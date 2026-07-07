<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\ComplianceDeadline;
use App\Entity\ComplianceDeadlineCategory;
use App\Repository\CompanyRepository;
use App\Repository\ComplianceDeadlineRepository;
use App\Repository\EmployeeRepository;
use App\Repository\ProjectRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/admin/compliance-deadlines', name: 'api_admin_compliance_deadlines_')]
#[IsGranted('ROLE_RH')]
final class ComplianceDeadlineController extends AbstractController
{
    private const GROUPS = ['compliance_deadline:read'];

    public function __construct(
        private readonly ComplianceDeadlineRepository $deadlineRepository,
        private readonly CompanyRepository $companyRepository,
        private readonly EmployeeRepository $employeeRepository,
        private readonly ProjectRepository $projectRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly SerializerInterface $serializer,
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $companyId = null;
        $p = $request->query->get('companyId');
        if ($p !== null && $p !== '' && ctype_digit((string) $p)) {
            $companyId = (int) $p;
        }

        $upcoming = $request->query->get('upcomingDays');
        $upcomingDays = null;
        if ($upcoming !== null && $upcoming !== '' && ctype_digit((string) $upcoming)) {
            $upcomingDays = (int) $upcoming;
        }

        $company = $companyId !== null ? $this->companyRepository->find($companyId) : null;
        if ($companyId !== null && $company === null) {
            return $this->json(['message' => 'Company not found.'], Response::HTTP_NOT_FOUND);
        }

        $items = $this->deadlineRepository->findOrdered($company, $upcomingDays);
        $json = $this->serializer->serialize($items, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON.'], Response::HTTP_BAD_REQUEST);
        }

        $deadline = new ComplianceDeadline();
        $err = $this->hydrate($deadline, $data, true);
        if ($err !== null) {
            return $err;
        }

        $this->entityManager->persist($deadline);
        $this->entityManager->flush();

        $json = $this->serializer->serialize($deadline, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_CREATED, [], true);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $deadline = $this->deadlineRepository->find($id);
        if ($deadline === null) {
            return $this->json(['message' => 'Not found.'], Response::HTTP_NOT_FOUND);
        }

        $json = $this->serializer->serialize($deadline, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'update', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $deadline = $this->deadlineRepository->find($id);
        if ($deadline === null) {
            return $this->json(['message' => 'Not found.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON.'], Response::HTTP_BAD_REQUEST);
        }

        $err = $this->hydrate($deadline, $data, false);
        if ($err !== null) {
            return $err;
        }

        $this->entityManager->flush();

        $json = $this->serializer->serialize($deadline, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): Response
    {
        $deadline = $this->deadlineRepository->find($id);
        if ($deadline === null) {
            return $this->json(['message' => 'Not found.'], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($deadline);
        $this->entityManager->flush();

        return new Response(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * @param array<string, mixed> $data
     */
    private function hydrate(ComplianceDeadline $deadline, array $data, bool $create): ?JsonResponse
    {
        if ($create || array_key_exists('companyId', $data)) {
            $cId = $data['companyId'] ?? null;
            if (!is_int($cId) && !(is_string($cId) && ctype_digit((string) $cId))) {
                return $this->json(['message' => 'Field "companyId" is required.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $company = $this->companyRepository->find((int) $cId);
            if ($company === null) {
                return $this->json(['message' => 'Company not found.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $deadline->setCompany($company);
        }

        if ($create || array_key_exists('title', $data)) {
            $title = trim((string) ($data['title'] ?? ''));
            if ($title === '') {
                return $this->json(['message' => 'Field "title" is required.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $deadline->setTitle($title);
        }

        if ($create || array_key_exists('category', $data)) {
            $raw = $data['category'] ?? null;
            if (!is_string($raw)) {
                return $this->json(['message' => 'Field "category" is required.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            try {
                $deadline->setCategory(ComplianceDeadlineCategory::from($raw));
            } catch (\ValueError) {
                return $this->json(['message' => 'Invalid category.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        if ($create || array_key_exists('expiresAt', $data)) {
            $raw = $data['expiresAt'] ?? null;
            if (!is_string($raw) || $raw === '') {
                return $this->json(['message' => 'Field "expiresAt" is required (ISO date).'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            try {
                $deadline->setExpiresAt(new \DateTimeImmutable($raw));
            } catch (\Exception) {
                return $this->json(['message' => 'Invalid expiresAt.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        if (array_key_exists('notes', $data)) {
            $notes = $data['notes'];
            $deadline->setNotes(is_string($notes) && $notes !== '' ? $notes : null);
        }

        if (array_key_exists('employeeId', $data)) {
            $eId = $data['employeeId'];
            if ($eId === null) {
                $deadline->setEmployee(null);
            } else {
                if (!is_int($eId) && !(is_string($eId) && ctype_digit((string) $eId))) {
                    return $this->json(['message' => 'Invalid employeeId.'], Response::HTTP_UNPROCESSABLE_ENTITY);
                }
                $emp = $this->employeeRepository->find((int) $eId);
                if ($emp === null) {
                    return $this->json(['message' => 'Employee not found.'], Response::HTTP_UNPROCESSABLE_ENTITY);
                }
                $deadline->setEmployee($emp);
            }
        }

        if (array_key_exists('projectId', $data)) {
            $pId = $data['projectId'];
            if ($pId === null) {
                $deadline->setProject(null);
            } else {
                if (!is_int($pId) && !(is_string($pId) && ctype_digit((string) $pId))) {
                    return $this->json(['message' => 'Invalid projectId.'], Response::HTTP_UNPROCESSABLE_ENTITY);
                }
                $proj = $this->projectRepository->find((int) $pId);
                if ($proj === null) {
                    return $this->json(['message' => 'Project not found.'], Response::HTTP_UNPROCESSABLE_ENTITY);
                }
                $deadline->setProject($proj);
            }
        }

        return null;
    }
}
