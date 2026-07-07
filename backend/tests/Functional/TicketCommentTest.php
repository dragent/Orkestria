<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use Symfony\Component\HttpFoundation\Response;

/**
 * Covers comments under /api/tickets/{id}/comments.
 */
final class TicketCommentTest extends AbstractFunctionalTestCase
{
    public function testDeveloperCanAddCommentAndList(): void
    {
        $dev = $this->createUser('dev@orkestria.app', ['ROLE_DEVELOPER']);
        $ticket = $this->createTicket($dev);

        $response = $this->jsonRequest(
            'POST',
            '/api/tickets/' . $ticket->getId() . '/comments',
            ['body' => 'Reproduit en local.'],
            $dev,
        );
        self::assertSame(Response::HTTP_CREATED, $response->getStatusCode());

        $listResp = $this->jsonRequest('GET', '/api/tickets/' . $ticket->getId() . '/comments', null, $dev);
        self::assertSame(Response::HTTP_OK, $listResp->getStatusCode());
        $list = $this->decodeJson($listResp);
        self::assertCount(1, $list);
        self::assertSame('Reproduit en local.', $list[0]['body']);
    }

    public function testReporterClientCanCommentOwnTicket(): void
    {
        $company = $this->createCompany();
        $clientEntity = $this->createClientEntity($company, 'Acme', 'client@example.com');
        $project = $this->createProject($clientEntity);

        $clientUser = $this->createUser('client@example.com', ['ROLE_CLIENT']);
        $ticket = $this->createTicket(
            $clientUser,
            $project,
            source: \App\Entity\TicketSource::CLIENT,
        );

        $response = $this->jsonRequest(
            'POST',
            '/api/tickets/' . $ticket->getId() . '/comments',
            ['body' => 'Plus de précisions ici.'],
            $clientUser,
        );

        self::assertSame(Response::HTTP_CREATED, $response->getStatusCode());
    }

    public function testForeignClientCannotComment(): void
    {
        $company = $this->createCompany();
        $clientEntity = $this->createClientEntity($company, 'Acme', 'client@example.com');
        $project = $this->createProject($clientEntity);

        $clientUser = $this->createUser('client@example.com', ['ROLE_CLIENT']);
        $ticket = $this->createTicket(
            $clientUser,
            $project,
            source: \App\Entity\TicketSource::CLIENT,
        );

        $intruder = $this->createUser('intruder@example.com', ['ROLE_CLIENT']);
        $response = $this->jsonRequest(
            'POST',
            '/api/tickets/' . $ticket->getId() . '/comments',
            ['body' => 'spam'],
            $intruder,
        );

        self::assertSame(Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }

    public function testEmptyBodyRejected(): void
    {
        $dev = $this->createUser('dev@orkestria.app', ['ROLE_DEVELOPER']);
        $ticket = $this->createTicket($dev);

        $response = $this->jsonRequest(
            'POST',
            '/api/tickets/' . $ticket->getId() . '/comments',
            ['body' => '   '],
            $dev,
        );

        self::assertSame(Response::HTTP_UNPROCESSABLE_ENTITY, $response->getStatusCode());
    }
}
