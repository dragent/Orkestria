<?php

declare(strict_types=1);

namespace App\Controller;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

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
        private readonly EntityManagerInterface $entityManager,
        private readonly SerializerInterface $serializer,
    ) {}

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

        $this->entityManager->flush();

        $json = $this->serializer->serialize($user, 'json', ['groups' => ['user:read']]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }
}
