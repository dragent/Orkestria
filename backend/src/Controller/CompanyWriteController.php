<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Company;
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

#[Route('/api/companies', name: 'api_companies_write_')]
#[IsGranted('ROLE_ADMIN')]
final class CompanyWriteController extends AbstractController
{
    public function __construct(
        private readonly CompanyRepository $companyRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly SerializerInterface $serializer,
        private readonly ValidatorInterface $validator,
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $companies = $this->companyRepository->findBy([], ['createdAt' => 'DESC']);
        $json = $this->serializer->serialize($companies, 'json', ['groups' => ['company:read']]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'get', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function get(int $id): JsonResponse
    {
        $company = $this->companyRepository->find($id);

        if ($company === null) {
            return $this->json(['message' => 'Company not found.'], Response::HTTP_NOT_FOUND);
        }

        $json = $this->serializer->serialize($company, 'json', ['groups' => ['company:read']]);

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
        $slug = trim((string) ($data['slug'] ?? ''));

        if ($name === '' || $slug === '') {
            return $this->json(['message' => 'Fields "name" and "slug" are required.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (!preg_match('/^[a-z0-9-]+$/', $slug)) {
            return $this->json(['message' => 'Slug must contain only lowercase letters, numbers, and hyphens.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($this->companyRepository->findOneBy(['slug' => $slug]) !== null) {
            return $this->json(['message' => 'A company with this slug already exists.'], Response::HTTP_CONFLICT);
        }

        $company = new Company();
        $company->setName($name);
        $company->setSlug($slug);

        $violations = $this->validator->validate($company);
        if (\count($violations) > 0) {
            return $this->validationErrorResponse($violations);
        }

        $this->entityManager->persist($company);
        $this->entityManager->flush();

        $json = $this->serializer->serialize($company, 'json', ['groups' => ['company:read']]);

        return new JsonResponse($json, Response::HTTP_CREATED, [], true);
    }

    #[Route('/{id}', name: 'update', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $company = $this->companyRepository->find($id);

        if ($company === null) {
            return $this->json(['message' => 'Company not found.'], Response::HTTP_NOT_FOUND);
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
            $company->setName($name);
        }

        if (array_key_exists('slug', $data)) {
            $slug = trim((string) $data['slug']);
            if (!preg_match('/^[a-z0-9-]+$/', $slug)) {
                return $this->json(['message' => 'Slug must contain only lowercase letters, numbers, and hyphens.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $other = $this->companyRepository->findOneBy(['slug' => $slug]);
            if ($other !== null && $other->getId() !== $company->getId()) {
                return $this->json(['message' => 'A company with this slug already exists.'], Response::HTTP_CONFLICT);
            }
            $company->setSlug($slug);
        }

        $violations = $this->validator->validate($company);
        if (\count($violations) > 0) {
            return $this->validationErrorResponse($violations);
        }

        $this->entityManager->flush();

        $json = $this->serializer->serialize($company, 'json', ['groups' => ['company:read']]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
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
