<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Employee;
use App\Repository\CompanyRepository;
use App\Repository\EmployeeRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/employees', name: 'api_employees_')]
#[IsGranted('ROLE_ADMIN')]
final class EmployeeController extends AbstractController
{
    private const GROUPS = ['employee:read'];

    public function __construct(
        private readonly EmployeeRepository $employeeRepository,
        private readonly CompanyRepository $companyRepository,
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly SerializerInterface $serializer,
        private readonly ValidatorInterface $validator,
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $q = $request->query->get('q');
        $q = is_string($q) && $q !== '' ? trim($q) : null;

        $companyIdParam = $request->query->get('companyId');
        $companyId = null;
        if ($companyIdParam !== null && ctype_digit((string) $companyIdParam)) {
            $companyId = (int) $companyIdParam;
        }

        $employees = $this->employeeRepository->findWithFilters($q, $companyId);
        $json = $this->serializer->serialize($employees, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $employee = $this->employeeRepository->find($id);
        if ($employee === null) {
            return $this->json(['message' => 'Employee not found.'], Response::HTTP_NOT_FOUND);
        }

        $json = $this->serializer->serialize($employee, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON.'], Response::HTTP_BAD_REQUEST);
        }

        $employee = new Employee();
        $error = $this->hydrate($employee, $data, create: true);
        if ($error !== null) {
            return $error;
        }

        $violations = $this->validator->validate($employee);
        if (\count($violations) > 0) {
            return $this->validationErrors($violations);
        }

        $this->entityManager->persist($employee);
        $this->entityManager->flush();

        $json = $this->serializer->serialize($employee, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_CREATED, [], true);
    }

    #[Route('/{id}', name: 'update', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $employee = $this->employeeRepository->find($id);
        if ($employee === null) {
            return $this->json(['message' => 'Employee not found.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON.'], Response::HTTP_BAD_REQUEST);
        }

        $error = $this->hydrate($employee, $data, create: false);
        if ($error !== null) {
            return $error;
        }

        $violations = $this->validator->validate($employee);
        if (\count($violations) > 0) {
            return $this->validationErrors($violations);
        }

        $this->entityManager->flush();

        $json = $this->serializer->serialize($employee, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): Response
    {
        $employee = $this->employeeRepository->find($id);
        if ($employee === null) {
            return $this->json(['message' => 'Employee not found.'], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($employee);
        $this->entityManager->flush();

        return new Response(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * @param array<string, mixed> $data
     */
    private function hydrate(Employee $employee, array $data, bool $create): ?JsonResponse
    {
        if ($create || array_key_exists('firstName', $data)) {
            $v = trim((string) ($data['firstName'] ?? ''));
            if ($v === '') {
                return $this->json(['message' => 'Field "firstName" is required.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $employee->setFirstName($v);
        }

        if ($create || array_key_exists('lastName', $data)) {
            $v = trim((string) ($data['lastName'] ?? ''));
            if ($v === '') {
                return $this->json(['message' => 'Field "lastName" is required.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $employee->setLastName($v);
        }

        if ($create || array_key_exists('role', $data)) {
            $v = trim((string) ($data['role'] ?? ''));
            if ($v === '') {
                return $this->json(['message' => 'Field "role" is required.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $employee->setRole($v);
        }

        if (array_key_exists('skills', $data)) {
            $skills = $data['skills'];
            if (!is_array($skills)) {
                return $this->json(['message' => 'Field "skills" must be an array.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $employee->setSkills(array_values(array_filter(array_map('strval', $skills))));
        }

        if (array_key_exists('dailyRateCents', $data)) {
            $rate = $data['dailyRateCents'];
            if ($rate !== null && (!is_int($rate) || $rate < 0)) {
                return $this->json(['message' => 'Field "dailyRateCents" must be a non-negative integer or null.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $employee->setDailyRateCents($rate);
        }

        if (array_key_exists('companyId', $data)) {
            $cId = $data['companyId'];
            if ($cId === null) {
                $employee->setCompany(null);
            } else {
                if (!is_int($cId) && !(is_string($cId) && ctype_digit((string) $cId))) {
                    return $this->json(['message' => 'Invalid companyId.'], Response::HTTP_UNPROCESSABLE_ENTITY);
                }
                $company = $this->companyRepository->find((int) $cId);
                if ($company === null) {
                    return $this->json(['message' => 'Company not found.'], Response::HTTP_UNPROCESSABLE_ENTITY);
                }
                $employee->setCompany($company);
            }
        }

        if (array_key_exists('userId', $data)) {
            $uId = $data['userId'];
            if ($uId === null) {
                $employee->setUser(null);
            } else {
                if (!is_int($uId) && !(is_string($uId) && ctype_digit((string) $uId))) {
                    return $this->json(['message' => 'Invalid userId.'], Response::HTTP_UNPROCESSABLE_ENTITY);
                }
                $user = $this->userRepository->find((int) $uId);
                if ($user === null) {
                    return $this->json(['message' => 'User not found.'], Response::HTTP_UNPROCESSABLE_ENTITY);
                }
                $employee->setUser($user);
            }
        }

        return null;
    }

    private function validationErrors(iterable $violations): JsonResponse
    {
        $errors = [];
        foreach ($violations as $v) {
            $errors[$v->getPropertyPath()] = $v->getMessage();
        }

        return $this->json(['message' => 'Validation failed.', 'errors' => $errors], Response::HTTP_UNPROCESSABLE_ENTITY);
    }
}
