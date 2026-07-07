<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Entity\TaskStatus;
use Symfony\Component\HttpFoundation\Response;

/**
 * Covers PATCH /api/projects/{projectId}/tasks/{taskId}
 * — used by the subcontractor "Mark as done" action and admin task edits.
 */
final class TaskUpdateTest extends AbstractFunctionalTestCase
{
    public function testAssignedSubcontractorCanMarkTaskAsDone(): void
    {
        $company = $this->createCompany();
        $client = $this->createClientEntity($company);
        $project = $this->createProject($client);

        $user = $this->createUser('worker@batico.fr', ['ROLE_SUBCONTRACTOR']);
        $employee = $this->createEmployee($user, $company);
        $this->assignEmployee($project, $employee);

        $task = $this->createTask($project, 'Pose charpente', TaskStatus::OPEN);

        $response = $this->jsonRequest(
            'PATCH',
            "/api/projects/{$project->getId()}/tasks/{$task->getId()}",
            ['status' => 'done'],
            $user,
        );

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());

        $this->em()->clear();
        $refreshed = $this->em()->getRepository(\App\Entity\Task::class)->find($task->getId());
        self::assertSame(TaskStatus::DONE, $refreshed?->getStatus());
    }

    public function testReturnsUnauthorizedWithoutJwt(): void
    {
        $company = $this->createCompany();
        $client = $this->createClientEntity($company);
        $project = $this->createProject($client);
        $task = $this->createTask($project);

        $response = $this->jsonRequest(
            'PATCH',
            "/api/projects/{$project->getId()}/tasks/{$task->getId()}",
            ['status' => 'done'],
        );

        self::assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
    }

    public function testReturnsForbiddenWhenSubcontractorIsNotAssignedToProject(): void
    {
        $company = $this->createCompany();
        $client = $this->createClientEntity($company);
        $project = $this->createProject($client);
        $task = $this->createTask($project);

        $intruder = $this->createUser('intruder@batico.fr', ['ROLE_SUBCONTRACTOR']);
        $this->createEmployee($intruder, $company);

        $response = $this->jsonRequest(
            'PATCH',
            "/api/projects/{$project->getId()}/tasks/{$task->getId()}",
            ['status' => 'done'],
            $intruder,
        );

        self::assertSame(Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }

    public function testRejectsInvalidStatusValue(): void
    {
        $company = $this->createCompany();
        $client = $this->createClientEntity($company);
        $project = $this->createProject($client);
        $task = $this->createTask($project);

        $admin = $this->createUser('admin@orkestria.app', ['ROLE_ADMIN']);

        $response = $this->jsonRequest(
            'PATCH',
            "/api/projects/{$project->getId()}/tasks/{$task->getId()}",
            ['status' => 'banana'],
            $admin,
        );

        self::assertSame(Response::HTTP_UNPROCESSABLE_ENTITY, $response->getStatusCode());
        $body = $this->decodeJson($response);
        self::assertSame('Invalid status.', $body['message']);
        self::assertContains('done', $body['allowed']);
    }

    public function testNonAdminCannotChangeTaskTitleEvenWhenAssigned(): void
    {
        $company = $this->createCompany();
        $client = $this->createClientEntity($company);
        $project = $this->createProject($client);

        $user = $this->createUser('worker@batico.fr', ['ROLE_SUBCONTRACTOR']);
        $employee = $this->createEmployee($user, $company);
        $this->assignEmployee($project, $employee);

        $task = $this->createTask($project, 'Original title', TaskStatus::OPEN);

        $response = $this->jsonRequest(
            'PATCH',
            "/api/projects/{$project->getId()}/tasks/{$task->getId()}",
            ['title' => 'Hacked title'],
            $user,
        );

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());

        $this->em()->clear();
        $refreshed = $this->em()->getRepository(\App\Entity\Task::class)->find($task->getId());
        self::assertSame('Original title', $refreshed?->getTitle(), 'Only admins may change the title.');
    }

    public function testReturnsNotFoundWhenTaskDoesNotBelongToProject(): void
    {
        $company = $this->createCompany();
        $client = $this->createClientEntity($company);
        $projectA = $this->createProject($client, 'A');
        $projectB = $this->createProject($client, 'B');
        $taskOfA = $this->createTask($projectA);

        $admin = $this->createUser('admin@orkestria.app', ['ROLE_ADMIN']);

        $response = $this->jsonRequest(
            'PATCH',
            "/api/projects/{$projectB->getId()}/tasks/{$taskOfA->getId()}",
            ['status' => 'done'],
            $admin,
        );

        self::assertSame(Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }
}
