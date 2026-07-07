<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Entity\ProjectPipelineStage;

/**
 * Functional tests for ProjectStageController:
 *  - Advance stage (happy path)
 *  - Advance with note
 *  - Forbidden for wrong role
 *  - Terminal stage cannot be advanced
 *  - Stage history is recorded
 */
final class ProjectStageCrudTest extends AbstractFunctionalTestCase
{
    public function testAdminCanAdvanceStage(): void
    {
        $company = $this->createCompany();
        $admin   = $this->createUser('admin@example.com', ['ROLE_ADMIN']);
        $client  = $this->createClientEntity($company);
        $project = $this->createProject($client, 'Chantier Alpha', ProjectPipelineStage::CONTACT);

        $response = $this->jsonRequest('POST', "/api/projects/{$project->getId()}/stage/advance", [], $admin);

        self::assertSame(200, $response->getStatusCode());
        $data = $this->decodeJson($response);
        self::assertSame('meeting', $data['stage']);
        self::assertFalse($data['isTerminal']);
    }

    public function testAdvanceWithNote(): void
    {
        $company = $this->createCompany();
        $admin   = $this->createUser('admin2@example.com', ['ROLE_ADMIN']);
        $client  = $this->createClientEntity($company);
        $project = $this->createProject($client, 'Chantier Beta', ProjectPipelineStage::CONTACT);

        $response = $this->jsonRequest(
            'POST',
            "/api/projects/{$project->getId()}/stage/advance",
            ['note' => 'Rendez-vous confirmé le 01/06'],
            $admin
        );

        self::assertSame(200, $response->getStatusCode());

        // Check history has the note
        $historyResponse = $this->jsonRequest('GET', "/api/projects/{$project->getId()}/stage/history", null, $admin);
        self::assertSame(200, $historyResponse->getStatusCode());
        $history = $this->decodeJson($historyResponse);
        self::assertCount(1, $history);
        self::assertSame('Rendez-vous confirmé le 01/06', $history[0]['note']);
    }

    public function testEngineerCanAdvanceTechnicalStage(): void
    {
        $company  = $this->createCompany();
        $engineer = $this->createUser('engineer@example.com', ['ROLE_ENGINEER']);
        $client   = $this->createClientEntity($company);
        $project  = $this->createProject($client, 'Chantier Gamma', ProjectPipelineStage::ENGINEER_ASSIGNED);

        $response = $this->jsonRequest('POST', "/api/projects/{$project->getId()}/stage/advance", [], $engineer);

        self::assertSame(200, $response->getStatusCode());
        $data = $this->decodeJson($response);
        self::assertSame('quote_plan', $data['stage']);
    }

    public function testEngineerCannotAdvanceAdminOnlyStage(): void
    {
        $company  = $this->createCompany();
        $engineer = $this->createUser('eng2@example.com', ['ROLE_ENGINEER']);
        $client   = $this->createClientEntity($company);
        // CONTACT stage requires ROLE_ADMIN only
        $project = $this->createProject($client, 'Chantier Delta', ProjectPipelineStage::CONTACT);

        $response = $this->jsonRequest('POST', "/api/projects/{$project->getId()}/stage/advance", [], $engineer);

        self::assertSame(403, $response->getStatusCode());
    }

    public function testRhCanAdvanceFinancialStage(): void
    {
        $company = $this->createCompany();
        $rh      = $this->createUser('rh@example.com', ['ROLE_RH']);
        $client  = $this->createClientEntity($company);
        // INVOICE_SENT → DEPOSIT_RECEIVED requires ROLE_RH or ROLE_ADMIN
        $project = $this->createProject($client, 'Chantier Epsilon', ProjectPipelineStage::INVOICE_SENT);

        $response = $this->jsonRequest('POST', "/api/projects/{$project->getId()}/stage/advance", [], $rh);

        self::assertSame(200, $response->getStatusCode());
        $data = $this->decodeJson($response);
        self::assertSame('deposit_received', $data['stage']);
    }

    public function testTerminalStageCannotBeAdvanced(): void
    {
        $company = $this->createCompany();
        $admin   = $this->createUser('admin3@example.com', ['ROLE_ADMIN']);
        $client  = $this->createClientEntity($company);
        $project = $this->createProject($client, 'Chantier Terminé', ProjectPipelineStage::PAID);

        $response = $this->jsonRequest('POST', "/api/projects/{$project->getId()}/stage/advance", [], $admin);

        self::assertSame(422, $response->getStatusCode());
        $data = $this->decodeJson($response);
        self::assertStringContainsString('final', $data['message']);
    }

    public function testHistoryIsRecordedOnAdvance(): void
    {
        $company = $this->createCompany();
        $admin   = $this->createUser('admin4@example.com', ['ROLE_ADMIN']);
        $client  = $this->createClientEntity($company);
        $project = $this->createProject($client, 'Chantier History', ProjectPipelineStage::CONTACT);

        // Advance twice
        $this->jsonRequest('POST', "/api/projects/{$project->getId()}/stage/advance", [], $admin);
        $this->jsonRequest('POST', "/api/projects/{$project->getId()}/stage/advance", [], $admin);

        $response = $this->jsonRequest('GET', "/api/projects/{$project->getId()}/stage/history", null, $admin);
        self::assertSame(200, $response->getStatusCode());
        $history = $this->decodeJson($response);
        self::assertCount(2, $history);
        self::assertSame('contact', $history[0]['fromStage']);
        self::assertSame('meeting', $history[0]['toStage']);
        self::assertSame('meeting', $history[1]['fromStage']);
        self::assertSame('engineer_assigned', $history[1]['toStage']);
    }

    public function testUnauthenticatedCannotAdvance(): void
    {
        $company = $this->createCompany();
        $client  = $this->createClientEntity($company);
        $project = $this->createProject($client, 'Chantier Anon', ProjectPipelineStage::CONTACT);

        $response = $this->jsonRequest('POST', "/api/projects/{$project->getId()}/stage/advance");

        self::assertSame(401, $response->getStatusCode());
    }

    public function testProjectNotFoundReturns404(): void
    {
        $admin    = $this->createUser('admin5@example.com', ['ROLE_ADMIN']);
        $response = $this->jsonRequest('POST', '/api/projects/99999/stage/advance', [], $admin);

        self::assertSame(404, $response->getStatusCode());
    }
}
