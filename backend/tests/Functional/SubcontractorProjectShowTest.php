<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use Symfony\Component\HttpFoundation\Response;

/**
 * Covers GET /api/subcontractor/projects/{id} — used by the subcontractor project detail page.
 */
final class SubcontractorProjectShowTest extends AbstractFunctionalTestCase
{
    public function testReturnsProjectForAssignedSubcontractor(): void
    {
        $company = $this->createCompany('BatiCo', 'batico');
        $client = $this->createClientEntity($company);
        $project = $this->createProject($client, 'Charpente entrepôt');

        $user = $this->createUser('worker@batico.fr', ['ROLE_SUBCONTRACTOR']);
        $employee = $this->createEmployee($user, $company);
        $this->assignEmployee($project, $employee);

        $response = $this->jsonRequest('GET', "/api/subcontractor/projects/{$project->getId()}", null, $user);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        $body = $this->decodeJson($response);
        self::assertSame($project->getId(), $body['id']);
        self::assertSame('Charpente entrepôt', $body['title']);
    }

    public function testAdminCanReadAnyProjectEvenWithoutEmployeeRecord(): void
    {
        $company = $this->createCompany('BatiCo', 'batico');
        $client = $this->createClientEntity($company);
        $project = $this->createProject($client);

        $admin = $this->createUser('admin@orkestria.app', ['ROLE_ADMIN']);

        $response = $this->jsonRequest('GET', "/api/subcontractor/projects/{$project->getId()}", null, $admin);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
    }

    public function testReturnsUnauthorizedWithoutJwt(): void
    {
        $company = $this->createCompany('BatiCo', 'batico');
        $client = $this->createClientEntity($company);
        $project = $this->createProject($client);

        $response = $this->jsonRequest('GET', "/api/subcontractor/projects/{$project->getId()}");

        self::assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
    }

    public function testReturnsForbiddenWhenSubcontractorIsNotAssigned(): void
    {
        $company = $this->createCompany('BatiCo', 'batico');
        $client = $this->createClientEntity($company);
        $project = $this->createProject($client);

        $intruder = $this->createUser('intruder@batico.fr', ['ROLE_SUBCONTRACTOR']);
        $this->createEmployee($intruder, $company);

        $response = $this->jsonRequest('GET', "/api/subcontractor/projects/{$project->getId()}", null, $intruder);

        self::assertSame(Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }

    public function testReturnsNotFoundForUnknownProject(): void
    {
        $admin = $this->createUser('admin@orkestria.app', ['ROLE_ADMIN']);

        $response = $this->jsonRequest('GET', '/api/subcontractor/projects/999999', null, $admin);

        self::assertSame(Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }
}
