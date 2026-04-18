<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/me', name: 'api_me', methods: ['GET'])]
final class MeController extends AbstractController
{
    public function __invoke(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $company = $user->getCompany();

        return $this->json([
            'id'        => $user->getId(),
            'email'     => $user->getEmail(),
            'firstName' => $user->getFirstName(),
            'lastName'  => $user->getLastName(),
            'roles'     => $user->getRoles(),
            'isActive'  => $user->isActive(),
            'createdAt' => $user->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'company'   => $company ? ['id' => $company->getId(), 'name' => $company->getName()] : null,
        ]);
    }
}
