<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\DocumentScope;
use App\Entity\User;
use App\Repository\CompanyRepository;
use App\Repository\UserRepository;
use App\Service\SlugGenerator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/admin/users', name: 'api_admin_users_')]
#[IsGranted('ROLE_ADMIN')]
final class AdminUserController extends AbstractController
{
    private const ALLOWED_ROLES = [
        'ROLE_USER',
        'ROLE_ADMIN',
        'ROLE_SUBCONTRACTOR',
        'ROLE_CLIENT',
    ];

    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly CompanyRepository $companyRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly SerializerInterface $serializer,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly SlugGenerator $slugGenerator,
        private readonly ValidatorInterface $validator,
    ) {}

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON payload.'], Response::HTTP_BAD_REQUEST);
        }

        $email = trim((string) ($data['email'] ?? ''));
        $plainPassword = (string) ($data['password'] ?? '');
        $firstName = trim((string) ($data['firstName'] ?? ''));
        $lastName = trim((string) ($data['lastName'] ?? ''));

        if ($email === '' || $plainPassword === '' || $firstName === '' || $lastName === '') {
            return $this->json([
                'message' => 'Fields "email", "password", "firstName", and "lastName" are required.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($this->userRepository->findOneBy(['email' => $email]) !== null) {
            return $this->json(['message' => 'An account with this email already exists.'], Response::HTTP_CONFLICT);
        }

        $user = new User();
        $user->setEmail($email);
        $user->setFirstName($firstName);
        $user->setLastName($lastName);
        $user->setSlug($this->slugGenerator->generateForUser($firstName, $lastName));
        $user->setPassword($this->passwordHasher->hashPassword($user, $plainPassword));
        $user->setIsVerified(true);
        $user->setIsActive(true);

        if (array_key_exists('roles', $data)) {
            if (!is_array($data['roles'])) {
                return $this->json(['message' => 'Field "roles" must be an array.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $invalidRoles = array_diff($data['roles'], self::ALLOWED_ROLES);
            if ($invalidRoles !== []) {
                return $this->json([
                    'message' => 'Invalid roles: ' . implode(', ', $invalidRoles),
                    'allowed' => self::ALLOWED_ROLES,
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $roles = array_values(array_unique($data['roles']));
            $user->setRoles(array_filter($roles, static fn (string $r) => $r !== 'ROLE_USER'));
        }

        $companyResponse = $this->applyCompanyId($user, $data['companyId'] ?? null);
        if ($companyResponse !== null) {
            return $companyResponse;
        }

        $scopesResponse = $this->applyDocumentScopes($user, $data['documentScopes'] ?? null);
        if ($scopesResponse !== null) {
            return $scopesResponse;
        }

        $violations = $this->validator->validate($user);
        if (\count($violations) > 0) {
            $errors = [];
            foreach ($violations as $violation) {
                $errors[$violation->getPropertyPath()] = $violation->getMessage();
            }

            return $this->json(['message' => 'Validation failed.', 'errors' => $errors], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $json = $this->serializer->serialize($user, 'json', ['groups' => ['user:read']]);

        return new JsonResponse($json, Response::HTTP_CREATED, [], true);
    }

    #[Route('/{id}', name: 'update', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $user = $this->userRepository->find($id);

        if ($user === null) {
            return $this->json(['message' => 'User not found.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON payload.'], Response::HTTP_BAD_REQUEST);
        }

        if (array_key_exists('roles', $data)) {
            if (!is_array($data['roles'])) {
                return $this->json(['message' => 'Field "roles" must be an array.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $invalidRoles = array_diff($data['roles'], self::ALLOWED_ROLES);
            if ($invalidRoles !== []) {
                return $this->json([
                    'message' => 'Invalid roles: ' . implode(', ', $invalidRoles),
                    'allowed' => self::ALLOWED_ROLES,
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $roles = array_values(array_unique($data['roles']));
            // ROLE_USER is always implied; no need to store it explicitly
            $user->setRoles(array_filter($roles, static fn (string $r) => $r !== 'ROLE_USER'));
        }

        if (array_key_exists('isActive', $data)) {
            if (!is_bool($data['isActive'])) {
                return $this->json(['message' => 'Field "isActive" must be a boolean.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $user->setIsActive($data['isActive']);
        }

        if (array_key_exists('companyId', $data)) {
            $companyResponse = $this->applyCompanyId($user, $data['companyId']);
            if ($companyResponse !== null) {
                return $companyResponse;
            }
        }

        if (array_key_exists('documentScopes', $data)) {
            $scopesResponse = $this->applyDocumentScopes($user, $data['documentScopes']);
            if ($scopesResponse !== null) {
                return $scopesResponse;
            }
        }

        $this->entityManager->flush();

        $json = $this->serializer->serialize($user, 'json', ['groups' => ['user:read']]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    private function applyCompanyId(User $user, mixed $companyId): ?JsonResponse
    {
        if ($companyId === null) {
            $user->setCompany(null);

            return null;
        }

        if (!is_int($companyId) && !(is_string($companyId) && ctype_digit($companyId))) {
            return $this->json(['message' => 'Field "companyId" must be an integer or null.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $id = is_int($companyId) ? $companyId : (int) $companyId;
        $company = $this->companyRepository->find($id);

        if ($company === null) {
            return $this->json(['message' => 'Company not found.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user->setCompany($company);

        return null;
    }

    private function applyDocumentScopes(User $user, mixed $raw): ?JsonResponse
    {
        if ($raw === null) {
            return null;
        }

        if (!is_array($raw)) {
            return $this->json(['message' => 'Field "documentScopes" must be an array of scope strings.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $allowed = array_map(static fn (DocumentScope $s) => $s->value, DocumentScope::cases());
        $normalized = [];
        foreach ($raw as $item) {
            if (!is_string($item)) {
                return $this->json(['message' => 'Each document scope must be a string.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            try {
                $normalized[] = DocumentScope::from($item)->value;
            } catch (\ValueError) {
                return $this->json([
                    'message' => 'Invalid document scope: ' . $item,
                    'allowed' => $allowed,
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $user->setDocumentScopes($normalized);

        return null;
    }
}
