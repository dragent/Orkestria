<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Entity\Ticket;
use App\Entity\TicketSource;
use App\Entity\TicketStatus;
use Symfony\Component\HttpFoundation\Response;

/**
 * Covers ticket CRUD endpoints under /api/tickets and /api/client/projects/{id}/tickets.
 */
final class TicketCrudTest extends AbstractFunctionalTestCase
{
    public function testDeveloperCanCreateInternalTicket(): void
    {
        $dev = $this->createUser('dev@orkestria.app', ['ROLE_DEVELOPER']);

        $response = $this->jsonRequest(
            'POST',
            '/api/tickets',
            [
                'title' => 'Crash on dashboard',
                'description' => 'Steps to reproduce: open admin dashboard, observe stacktrace.',
                'type' => 'bug',
                'priority' => 'high',
            ],
            $dev,
        );

        self::assertSame(Response::HTTP_CREATED, $response->getStatusCode());
        $body = $this->decodeJson($response);
        self::assertSame('Crash on dashboard', $body['title']);
        self::assertSame('bug', $body['type']);
        self::assertSame('high', $body['priority']);
        self::assertSame('open', $body['status']);
        self::assertSame('internal', $body['source']);
    }

    public function testNonDeveloperCannotCreateInternalTicket(): void
    {
        $client = $this->createUser('client@example.com', ['ROLE_CLIENT']);

        $response = $this->jsonRequest(
            'POST',
            '/api/tickets',
            ['title' => 'x', 'description' => 'y'],
            $client,
        );

        self::assertSame(Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }

    public function testDeveloperCanChangeStatus(): void
    {
        $dev = $this->createUser('dev@orkestria.app', ['ROLE_DEVELOPER']);
        $ticket = $this->createTicket($dev);

        $response = $this->jsonRequest(
            'PATCH',
            '/api/tickets/' . $ticket->getId(),
            ['status' => 'in_progress'],
            $dev,
        );

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());

        $this->em()->clear();
        $refreshed = $this->em()->getRepository(Ticket::class)->find($ticket->getId());
        self::assertSame(TicketStatus::IN_PROGRESS, $refreshed?->getStatus());
    }

    public function testOnlyAdminCanDelete(): void
    {
        $dev = $this->createUser('dev@orkestria.app', ['ROLE_DEVELOPER']);
        $ticket = $this->createTicket($dev);

        $response = $this->jsonRequest(
            'DELETE',
            '/api/tickets/' . $ticket->getId(),
            null,
            $dev,
        );
        self::assertSame(Response::HTTP_FORBIDDEN, $response->getStatusCode());

        $admin = $this->createUser('admin@orkestria.app', ['ROLE_ADMIN']);
        $response = $this->jsonRequest(
            'DELETE',
            '/api/tickets/' . $ticket->getId(),
            null,
            $admin,
        );
        self::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());
    }

    public function testClientCanOpenTicketOnOwnProject(): void
    {
        $company = $this->createCompany();
        $clientEntity = $this->createClientEntity($company, 'Acme', 'client@example.com');
        $project = $this->createProject($clientEntity);

        $clientUser = $this->createUser('client@example.com', ['ROLE_CLIENT']);

        $response = $this->jsonRequest(
            'POST',
            "/api/client/projects/{$project->getId()}/tickets",
            [
                'title' => 'Bug en production',
                'description' => 'La page facture renvoie 500.',
                'type' => 'bug',
                'priority' => 'urgent',
            ],
            $clientUser,
        );

        self::assertSame(Response::HTTP_CREATED, $response->getStatusCode());
        $body = $this->decodeJson($response);
        self::assertSame('client', $body['source']);
        self::assertSame('bug', $body['type']);
    }

    public function testClientCannotOpenTicketOnOtherProject(): void
    {
        $company = $this->createCompany();
        $clientEntity = $this->createClientEntity($company, 'Acme', 'client@example.com');
        $project = $this->createProject($clientEntity);

        $intruder = $this->createUser('intruder@example.com', ['ROLE_CLIENT']);

        $response = $this->jsonRequest(
            'POST',
            "/api/client/projects/{$project->getId()}/tickets",
            ['title' => 't', 'description' => 'd'],
            $intruder,
        );

        self::assertSame(Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }

    public function testListFiltersByStatus(): void
    {
        $dev = $this->createUser('dev@orkestria.app', ['ROLE_DEVELOPER']);
        $this->createTicket($dev, status: TicketStatus::OPEN, title: 'A');
        $this->createTicket($dev, status: TicketStatus::DONE, title: 'B');

        $response = $this->jsonRequest('GET', '/api/tickets?status=done', null, $dev);
        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        $list = $this->decodeJson($response);
        self::assertCount(1, $list);
        self::assertSame('B', $list[0]['title']);
    }

    public function testClientOnlySeesOwnTickets(): void
    {
        $company = $this->createCompany();
        $clientEntity = $this->createClientEntity($company, 'Acme', 'client@example.com');
        $project = $this->createProject($clientEntity);

        $clientUser = $this->createUser('client@example.com', ['ROLE_CLIENT']);
        $other = $this->createUser('other@example.com', ['ROLE_CLIENT']);

        $this->createTicket($clientUser, $project, source: TicketSource::CLIENT);
        $this->createTicket($other, $project, source: TicketSource::CLIENT);

        $response = $this->jsonRequest('GET', '/api/tickets', null, $clientUser);
        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        $list = $this->decodeJson($response);
        self::assertCount(1, $list);
    }
}
