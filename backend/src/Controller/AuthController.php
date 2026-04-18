<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\SlugGenerator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/auth', name: 'auth_')]
final class AuthController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly ValidatorInterface $validator,
        private readonly UserRepository $userRepository,
        private readonly MailerInterface $mailer,
        private readonly SlugGenerator $slugGenerator,
    ) {}

    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON payload.'], Response::HTTP_BAD_REQUEST);
        }

        $email = trim((string) ($data['email'] ?? ''));
        $plainPassword = (string) ($data['password'] ?? '');
        $firstName = trim((string) ($data['firstName'] ?? ''));
        $lastName = trim((string) ($data['lastName'] ?? ''));

        if ($this->userRepository->findOneBy(['email' => $email])) {
            return $this->json(['message' => 'An account with this email already exists.'], Response::HTTP_CONFLICT);
        }

        $token = bin2hex(random_bytes(32));

        $user = new User();
        $user->setEmail($email);
        $user->setFirstName($firstName);
        $user->setLastName($lastName);
        $user->setSlug($this->slugGenerator->generateForUser($firstName, $lastName));
        $user->setRoles(['ROLE_USER']);
        $user->setPassword($this->passwordHasher->hashPassword($user, $plainPassword));
        $user->setIsVerified(false);
        $user->setVerificationToken($token);
        $user->setVerificationTokenExpiresAt(new \DateTimeImmutable('+24 hours'));

        $violations = $this->validator->validate($user);
        if (count($violations) > 0) {
            $errors = [];
            foreach ($violations as $violation) {
                $errors[$violation->getPropertyPath()] = $violation->getMessage();
            }

            return $this->json(['message' => 'Validation failed.', 'errors' => $errors], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $appUrl = rtrim((string) $this->getParameter('app.url'), '/');
        $verificationUrl = $appUrl . '/auth/verify?token=' . $token;

        $mailerFrom = (string) $this->getParameter('app.mailer_from');

        $this->mailer->send(
            (new TemplatedEmail())
                ->from(new Address($mailerFrom, 'Orkestria'))
                ->to(new Address($user->getEmail(), $user->getFirstName() . ' ' . $user->getLastName()))
                ->subject('Confirmez votre adresse e-mail — Orkestria')
                ->htmlTemplate('email/verification.html.twig')
                ->context([
                    'firstName' => $user->getFirstName(),
                    'verificationUrl' => $verificationUrl,
                ])
        );

        return $this->json([
            'message' => 'Registration successful. Please check your email to verify your account.',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
            ],
        ], Response::HTTP_CREATED);
    }

    #[Route('/verify', name: 'verify_email', methods: ['GET'])]
    public function verifyEmail(Request $request): RedirectResponse
    {
        $frontendUrl = rtrim((string) $this->getParameter('app.frontend_url'), '/');
        $token = (string) $request->query->get('token', '');

        if ($token === '') {
            return new RedirectResponse($frontendUrl . '/login?verify_error=1');
        }

        $user = $this->userRepository->findOneBy(['verificationToken' => $token]);

        if ($user === null) {
            return new RedirectResponse($frontendUrl . '/login?verify_error=1');
        }

        $expiresAt = $user->getVerificationTokenExpiresAt();
        if ($expiresAt === null || $expiresAt < new \DateTimeImmutable()) {
            return new RedirectResponse($frontendUrl . '/login?verify_error=1');
        }

        $user->setIsVerified(true);
        $user->setVerificationToken(null);
        $user->setVerificationTokenExpiresAt(null);

        $this->entityManager->flush();

        return new RedirectResponse($frontendUrl . '/login?verified=1');
    }

    #[Route('/forgot-password', name: 'forgot_password', methods: ['POST'])]
    public function forgotPassword(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON payload.'], Response::HTTP_BAD_REQUEST);
        }

        $email = trim((string) ($data['email'] ?? ''));

        $user = $this->userRepository->findOneBy(['email' => $email]);

        // Always return success to avoid user enumeration
        if ($user === null || !$user->isVerified() || !$user->isActive()) {
            return $this->json(['message' => 'If this email is registered, a reset link has been sent.']);
        }

        $token = bin2hex(random_bytes(32));
        $user->setResetToken($token);
        $user->setResetTokenExpiresAt(new \DateTimeImmutable('+1 hour'));

        $this->entityManager->flush();

        $frontendUrl = rtrim((string) $this->getParameter('app.frontend_url'), '/');
        $resetUrl = $frontendUrl . '/reset-password?token=' . $token;
        $mailerFrom = (string) $this->getParameter('app.mailer_from');

        $this->mailer->send(
            (new TemplatedEmail())
                ->from(new Address($mailerFrom, 'Orkestria'))
                ->to(new Address($user->getEmail(), $user->getFirstName() . ' ' . $user->getLastName()))
                ->subject('Réinitialisation de votre mot de passe — Orkestria')
                ->htmlTemplate('email/reset_password.html.twig')
                ->context([
                    'firstName' => $user->getFirstName(),
                    'resetUrl' => $resetUrl,
                ])
        );

        return $this->json(['message' => 'If this email is registered, a reset link has been sent.']);
    }

    #[Route('/reset-password', name: 'reset_password', methods: ['POST'])]
    public function resetPassword(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON payload.'], Response::HTTP_BAD_REQUEST);
        }

        $token = trim((string) ($data['token'] ?? ''));
        $plainPassword = (string) ($data['password'] ?? '');

        if ($token === '' || $plainPassword === '') {
            return $this->json(['message' => 'Token and password are required.'], Response::HTTP_BAD_REQUEST);
        }

        $user = $this->userRepository->findOneBy(['resetToken' => $token]);

        if ($user === null) {
            return $this->json(['message' => 'Invalid or expired reset token.'], Response::HTTP_BAD_REQUEST);
        }

        $expiresAt = $user->getResetTokenExpiresAt();
        if ($expiresAt === null || $expiresAt < new \DateTimeImmutable()) {
            return $this->json(['message' => 'Invalid or expired reset token.'], Response::HTTP_BAD_REQUEST);
        }

        if (strlen($plainPassword) < 8) {
            return $this->json(['message' => 'Password must be at least 8 characters.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user->setPassword($this->passwordHasher->hashPassword($user, $plainPassword));
        $user->setResetToken(null);
        $user->setResetTokenExpiresAt(null);

        $this->entityManager->flush();

        return $this->json(['message' => 'Password has been reset successfully.']);
    }
}
