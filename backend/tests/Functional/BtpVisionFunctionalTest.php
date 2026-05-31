<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Entity\ComplianceDeadlineCategory;
use App\Entity\ProjectPipelineStage;
use App\Entity\QuoteStatus;
use App\Entity\TimeEntryHourType;

final class BtpVisionFunctionalTest extends AbstractFunctionalTestCase
{
    public function testPayrollCsvExportContainsRowsAndHourType(): void
    {
        $company = $this->createCompany();
        $admin = $this->createUser('admin-btp@example.com', ['ROLE_ADMIN']);
        $admin->setCompany($company);
        $this->em()->flush();

        $client = $this->createClientEntity($company);
        $project = $this->createProject($client);
        $employee = $this->createEmployee(null, $company);
        $this->assignEmployee($project, $employee);
        $this->createTimeEntry($employee, $project, '2026-05-10', '8', TimeEntryHourType::NIGHT);

        $from = '2026-05-01';
        $to = '2026-05-31';
        $response = $this->jsonRequest(
            'GET',
            sprintf('/api/admin/payroll/time-entries.csv?from=%s&to=%s&companyId=%d', $from, $to, $company->getId()),
            null,
            $admin,
        );

        self::assertSame(200, $response->getStatusCode());
        $body = (string) $response->getContent();
        self::assertStringContainsString('hour_type', $body);
        self::assertStringContainsString('night', $body);
        self::assertStringContainsString('2026-05-10', $body);
    }

    public function testBtpKpisEndpoint(): void
    {
        $company = $this->createCompany();
        $admin = $this->createUser('patron@example.com', ['ROLE_ADMIN']);
        $admin->setCompany($company);
        $this->em()->flush();

        $client = $this->createClientEntity($company);
        $project = $this->createProject($client, 'Chantier A', ProjectPipelineStage::CONSTRUCTION);
        $this->createQuote($project, QuoteStatus::ACCEPTED, [
            ['label' => 'L1', 'quantity' => '2', 'unitPriceCents' => 50000],
        ]);

        $employee = $this->createEmployee(null, $company);
        $this->assignEmployee($project, $employee);
        $this->createTimeEntry($employee, $project, (new \DateTimeImmutable('-5 days'))->format('Y-m-d'), '4');

        $response = $this->jsonRequest('GET', '/api/admin/dashboard/btp-kpis', null, $admin);
        self::assertSame(200, $response->getStatusCode());
        $data = $this->decodeJson($response);
        self::assertSame(100000, $data['acceptedQuotesTotalCents']);
        self::assertArrayHasKey('timeEntriesTotalHoursLast30Days', $data);
        self::assertArrayHasKey('projectsByPipelineStage', $data);
        self::assertSame(1, $data['projectsByPipelineStage']['production']);
    }

    public function testComplianceDeadlineCrud(): void
    {
        $company = $this->createCompany();
        $admin = $this->createUser('rh@example.com', ['ROLE_ADMIN']);
        $admin->setCompany($company);
        $this->em()->flush();

        $createResp = $this->jsonRequest('POST', '/api/admin/compliance-deadlines', [
            'companyId' => $company->getId(),
            'title' => 'Visite SST',
            'category' => 'certification',
            'expiresAt' => '2026-12-01',
            'notes' => 'Renouvellement',
        ], $admin);

        self::assertSame(201, $createResp->getStatusCode());
        $row = $this->decodeJson($createResp);
        $id = (int) $row['id'];
        self::assertSame('Visite SST', $row['title']);

        $listResp = $this->jsonRequest('GET', '/api/admin/compliance-deadlines', null, $admin);
        $list = json_decode((string) $listResp->getContent(), true, 512, JSON_THROW_ON_ERROR);
        self::assertIsArray($list);
        self::assertCount(1, $list);

        $patchResp = $this->jsonRequest('PATCH', '/api/admin/compliance-deadlines/' . $id, [
            'title' => 'Mise à jour',
            'category' => ComplianceDeadlineCategory::MEDICAL->value,
        ], $admin);
        self::assertSame(200, $patchResp->getStatusCode());
        $updated = $this->decodeJson($patchResp);
        self::assertSame('Mise à jour', $updated['title']);
        self::assertSame('medical', $updated['category']);

        $delResp = $this->jsonRequest('DELETE', '/api/admin/compliance-deadlines/' . $id, null, $admin);
        self::assertSame(204, $delResp->getStatusCode());
    }

    public function testTimeEntryCreateAcceptsHourType(): void
    {
        $company = $this->createCompany();
        $user = $this->createUser('tech@example.com', ['ROLE_ENGINEER']);
        $user->setCompany($company);
        $this->em()->flush();
        $client = $this->createClientEntity($company);
        $project = $this->createProject($client);
        $employee = $this->createEmployee($user, $company);
        $this->assignEmployee($project, $employee);

        $resp = $this->jsonRequest('POST', '/api/projects/' . $project->getId() . '/time-entries', [
            'employeeId' => $employee->getId(),
            'hours' => 6,
            'date' => '2026-05-15',
            'hourType' => 'weekend',
        ], $user);

        self::assertSame(201, $resp->getStatusCode());
        $data = $this->decodeJson($resp);
        self::assertSame('weekend', $data['hourType']);
    }
}
