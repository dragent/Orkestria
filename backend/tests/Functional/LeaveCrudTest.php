<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Entity\Leave;
use App\Entity\LeaveStatus;
use App\Entity\LeaveType;

final class LeaveCrudTest extends AbstractFunctionalTestCase
{
    public function testCreateAndListLeaves(): void
    {
        $company  = $this->createCompany('BTP Corp', 'btp-corp');
        $rhUser   = $this->createUser('rh@btp.test', ['ROLE_RH']);
        $employee = $this->createEmployee(null, $company, 'Worker');

        $response = $this->jsonRequest('POST', '/api/admin/leaves', [
            'employeeId' => $employee->getId(),
            'type'       => 'paid_vacation',
            'startsAt'   => '2026-06-01',
            'endsAt'     => '2026-06-07',
            'reason'     => 'Summer holiday',
        ], $rhUser);

        self::assertSame(201, $response->getStatusCode());
        $data = $this->decodeJson($response);
        self::assertSame('paid_vacation', $data['type']);
        self::assertSame('pending', $data['status']);
        self::assertSame('Summer holiday', $data['reason']);

        $leaveId = $data['id'];

        // List
        $listResponse = $this->jsonRequest('GET', '/api/admin/leaves', authAs: $rhUser);
        self::assertSame(200, $listResponse->getStatusCode());
        $list = $this->decodeJson($listResponse);
        self::assertCount(1, $list);
        self::assertSame($leaveId, $list[0]['id']);

        // Filter by employeeId
        $filtered = $this->jsonRequest('GET', '/api/admin/leaves?employeeId=' . $employee->getId(), authAs: $rhUser);
        self::assertSame(200, $filtered->getStatusCode());
        self::assertCount(1, $this->decodeJson($filtered));
    }

    public function testApproveLeave(): void
    {
        $company  = $this->createCompany('Corp', 'corp');
        $rhUser   = $this->createUser('rh2@btp.test', ['ROLE_RH']);
        $employee = $this->createEmployee(null, $company);

        $createResp = $this->jsonRequest('POST', '/api/admin/leaves', [
            'employeeId' => $employee->getId(),
            'type'       => 'rtt',
            'startsAt'   => '2026-07-14',
            'endsAt'     => '2026-07-14',
        ], $rhUser);
        self::assertSame(201, $createResp->getStatusCode());
        $id = $this->decodeJson($createResp)['id'];

        $approveResp = $this->jsonRequest('PATCH', "/api/admin/leaves/{$id}/approve", authAs: $rhUser);
        self::assertSame(200, $approveResp->getStatusCode());
        $approved = $this->decodeJson($approveResp);
        self::assertSame('approved', $approved['status']);
        self::assertNotNull($approved['approvedAt']);
    }

    public function testRejectLeave(): void
    {
        $company  = $this->createCompany('Corp2', 'corp2');
        $rhUser   = $this->createUser('rh3@btp.test', ['ROLE_RH']);
        $employee = $this->createEmployee(null, $company);

        $createResp = $this->jsonRequest('POST', '/api/admin/leaves', [
            'employeeId' => $employee->getId(),
            'type'       => 'sick',
            'startsAt'   => '2026-08-01',
            'endsAt'     => '2026-08-05',
        ], $rhUser);
        self::assertSame(201, $createResp->getStatusCode());
        $id = $this->decodeJson($createResp)['id'];

        $rejectResp = $this->jsonRequest('PATCH', "/api/admin/leaves/{$id}/reject", authAs: $rhUser);
        self::assertSame(200, $rejectResp->getStatusCode());
        $rejected = $this->decodeJson($rejectResp);
        self::assertSame('rejected', $rejected['status']);
    }

    public function testDeleteLeave(): void
    {
        $company  = $this->createCompany('Corp3', 'corp3');
        $rhUser   = $this->createUser('rh4@btp.test', ['ROLE_RH']);
        $employee = $this->createEmployee(null, $company);

        $createResp = $this->jsonRequest('POST', '/api/admin/leaves', [
            'employeeId' => $employee->getId(),
            'type'       => 'training',
            'startsAt'   => '2026-09-01',
            'endsAt'     => '2026-09-03',
        ], $rhUser);
        self::assertSame(201, $createResp->getStatusCode());
        $id = $this->decodeJson($createResp)['id'];

        $delResp = $this->jsonRequest('DELETE', "/api/admin/leaves/{$id}", authAs: $rhUser);
        self::assertSame(204, $delResp->getStatusCode());

        $notFound = $this->jsonRequest('GET', "/api/admin/leaves/{$id}", authAs: $rhUser);
        self::assertSame(404, $notFound->getStatusCode());
    }

    public function testAccessDeniedWithoutRhRole(): void
    {
        $user     = $this->createUser('plain@user.test', []);
        $response = $this->jsonRequest('GET', '/api/admin/leaves', authAs: $user);
        self::assertSame(403, $response->getStatusCode());
    }

    public function testWorkingDaysCalculation(): void
    {
        // Monday 2026-06-01 to Friday 2026-06-05 = 5 working days
        $company  = $this->createCompany('Corp4', 'corp4');
        $rhUser   = $this->createUser('rh5@btp.test', ['ROLE_RH']);
        $employee = $this->createEmployee(null, $company);

        $createResp = $this->jsonRequest('POST', '/api/admin/leaves', [
            'employeeId' => $employee->getId(),
            'type'       => 'paid_vacation',
            'startsAt'   => '2026-06-01',
            'endsAt'     => '2026-06-05',
        ], $rhUser);
        self::assertSame(201, $createResp->getStatusCode());
        $data = $this->decodeJson($createResp);

        // Retrieve entity to verify workingDays (not serialized, so just check response fields)
        $em    = $this->em();
        $leave = $em->getRepository(Leave::class)->find($data['id']);
        self::assertNotNull($leave);
        self::assertSame(5, $leave->getWorkingDays());
    }
}
