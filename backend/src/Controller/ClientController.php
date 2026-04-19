<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Client;
use App\Repository\ClientRepository;
use App\Repository\CompanyRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/clients', name: 'api_clients_')]
#[IsGranted('ROLE_ADMIN')]
final class ClientController extends AbstractController
{
    private const SERIALIZATION_GROUPS = ['client:read', 'company:read'];

    public function __construct(
        private readonly ClientRepository $clientRepository,
        private readonly CompanyRepository $companyRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly SerializerInterface $serializer,
        private readonly ValidatorInterface $validator,
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $clients = $this->clientRepository->findBy([], ['name' => 'ASC']);
        $json = $this->serializer->serialize($clients, 'json', ['groups' => self::SERIALIZATION_GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $client = $this->clientRepository->find($id);
        if ($client === null) {
            return $this->json(['message' => 'Client not found.'], Response::HTTP_NOT_FOUND);
        }

        $json = $this->serializer->serialize($client, 'json', ['groups' => self::SERIALIZATION_GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON payload.'], Response::HTTP_BAD_REQUEST);
        }

        $name = trim((string) ($data['name'] ?? ''));
        $email = trim((string) ($data['email'] ?? ''));
        $companyId = $data['companyId'] ?? null;

        if ($name === '' || $email === '') {
            return $this->json(['message' => 'Fields "name" and "email" are required.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (!is_int($companyId) && !(is_string($companyId) && ctype_digit((string) $companyId))) {
            return $this->json(['message' => 'Field "companyId" must be an integer.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $company = $this->companyRepository->find((int) $companyId);
        if ($company === null) {
            return $this->json(['message' => 'Company not found.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $client = new Client();
        $client->setName($name);
        $client->setEmail($email);
        $client->setCompany($company);

        $violations = $this->validator->validate($client);
        if (\count($violations) > 0) {
            return $this->validationErrorResponse($violations);
        }

        $this->entityManager->persist($client);
        $this->entityManager->flush();

        $json = $this->serializer->serialize($client, 'json', ['groups' => self::SERIALIZATION_GROUPS]);

        return new JsonResponse($json, Response::HTTP_CREATED, [], true);
    }

    #[Route('/{id}', name: 'update', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $client = $this->clientRepository->find($id);
        if ($client === null) {
            return $this->json(['message' => 'Client not found.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON payload.'], Response::HTTP_BAD_REQUEST);
        }

        if (array_key_exists('name', $data)) {
            $name = trim((string) $data['name']);
            if ($name === '') {
                return $this->json(['message' => 'Field "name" cannot be empty.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $client->setName($name);
        }

        if (array_key_exists('email', $data)) {
            $email = trim((string) $data['email']);
            if ($email === '') {
                return $this->json(['message' => 'Field "email" cannot be empty.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $client->setEmail($email);
        }

        if (array_key_exists('companyId', $data)) {
            $companyId = $data['companyId'];
            if (!is_int($companyId) && !(is_string($companyId) && ctype_digit((string) $companyId))) {
                return $this->json(['message' => 'Field "companyId" must be an integer.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $company = $this->companyRepository->find((int) $companyId);
            if ($company === null) {
                return $this->json(['message' => 'Company not found.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $client->setCompany($company);
        }

        $violations = $this->validator->validate($client);
        if (\count($violations) > 0) {
            return $this->validationErrorResponse($violations);
        }

        $this->entityManager->flush();

        $json = $this->serializer->serialize($client, 'json', ['groups' => self::SERIALIZATION_GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): Response
    {
        $client = $this->clientRepository->find($id);
        if ($client === null) {
            return $this->json(['message' => 'Client not found.'], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($client);
        $this->entityManager->flush();

        return new Response(null, Response::HTTP_NO_CONTENT);
    }

    private function validationErrorResponse(iterable $violations): JsonResponse
    {
        $errors = [];
        foreach ($violations as $violation) {
            $errors[$violation->getPropertyPath()] = $violation->getMessage();
        }

        return $this->json(['message' => 'Validation failed.', 'errors' => $errors], Response::HTTP_UNPROCESSABLE_ENTITY);
    }
}
