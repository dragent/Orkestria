<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Entity\QuoteStatus;
use Symfony\Component\HttpFoundation\Response;

/**
 * Covers POST /api/projects/{projectId}/quotes/{quoteId}/{accept,reject}
 * — used by the client project detail page.
 */
final class QuoteClientActionsTest extends AbstractFunctionalTestCase
{
    public function testClientCanAcceptOwnSentQuoteAndAnInvoiceIsCreated(): void
    {
        $company = $this->createCompany();
        $client = $this->createClientEntity($company, email: 'buyer@acme.io');
        $project = $this->createProject($client);
        $quote = $this->createQuote($project, QuoteStatus::SENT, [
            ['label' => 'Design', 'quantity' => '2', 'unitPriceCents' => 50000],
            ['label' => 'Build', 'quantity' => '5', 'unitPriceCents' => 80000],
        ]);

        // Client user shares the same email as the Client entity (cf. QuoteController::isClientProject).
        $clientUser = $this->createUser('buyer@acme.io', ['ROLE_CLIENT']);

        $response = $this->jsonRequest(
            'POST',
            "/api/projects/{$project->getId()}/quotes/{$quote->getId()}/accept",
            null,
            $clientUser,
        );

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());

        $this->em()->clear();
        $refreshed = $this->em()->getRepository(\App\Entity\Quote::class)->find($quote->getId());
        self::assertNotNull($refreshed);
        self::assertSame(QuoteStatus::ACCEPTED, $refreshed->getStatus());
        self::assertNotNull($refreshed->getInvoice(), 'An invoice should be created on acceptance.');
        self::assertSame(2 * 50000 + 5 * 80000, $refreshed->getInvoice()->getTotalCents());
    }

    public function testClientCanRejectOwnSentQuote(): void
    {
        $company = $this->createCompany();
        $client = $this->createClientEntity($company, email: 'buyer@acme.io');
        $project = $this->createProject($client);
        $quote = $this->createQuote($project, QuoteStatus::SENT);

        $clientUser = $this->createUser('buyer@acme.io', ['ROLE_CLIENT']);

        $response = $this->jsonRequest(
            'POST',
            "/api/projects/{$project->getId()}/quotes/{$quote->getId()}/reject",
            null,
            $clientUser,
        );

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());

        $this->em()->clear();
        $refreshed = $this->em()->getRepository(\App\Entity\Quote::class)->find($quote->getId());
        self::assertSame(QuoteStatus::REJECTED, $refreshed?->getStatus());
        self::assertNull($refreshed?->getInvoice(), 'Rejection must not create an invoice.');
    }

    public function testReturnsUnauthorizedWithoutJwt(): void
    {
        $company = $this->createCompany();
        $client = $this->createClientEntity($company);
        $project = $this->createProject($client);
        $quote = $this->createQuote($project);

        $response = $this->jsonRequest(
            'POST',
            "/api/projects/{$project->getId()}/quotes/{$quote->getId()}/accept",
        );

        self::assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
    }

    public function testReturnsForbiddenForUserUnrelatedToTheClient(): void
    {
        $company = $this->createCompany();
        $client = $this->createClientEntity($company, email: 'real-buyer@acme.io');
        $project = $this->createProject($client);
        $quote = $this->createQuote($project, QuoteStatus::SENT);

        $stranger = $this->createUser('stranger@example.com', ['ROLE_CLIENT']);

        $response = $this->jsonRequest(
            'POST',
            "/api/projects/{$project->getId()}/quotes/{$quote->getId()}/accept",
            null,
            $stranger,
        );

        self::assertSame(Response::HTTP_FORBIDDEN, $response->getStatusCode());
    }

    public function testRejectsAcceptingAQuoteThatIsNotInSentStatus(): void
    {
        $company = $this->createCompany();
        $client = $this->createClientEntity($company, email: 'buyer@acme.io');
        $project = $this->createProject($client);
        $draft = $this->createQuote($project, QuoteStatus::DRAFT);

        $clientUser = $this->createUser('buyer@acme.io', ['ROLE_CLIENT']);

        $response = $this->jsonRequest(
            'POST',
            "/api/projects/{$project->getId()}/quotes/{$draft->getId()}/accept",
            null,
            $clientUser,
        );

        self::assertSame(Response::HTTP_UNPROCESSABLE_ENTITY, $response->getStatusCode());
    }

    public function testReturnsNotFoundWhenQuoteDoesNotBelongToProject(): void
    {
        $company = $this->createCompany();
        $client = $this->createClientEntity($company, email: 'buyer@acme.io');
        $projectA = $this->createProject($client, 'Project A');
        $projectB = $this->createProject($client, 'Project B');
        $quoteOfA = $this->createQuote($projectA, QuoteStatus::SENT);

        $clientUser = $this->createUser('buyer@acme.io', ['ROLE_CLIENT']);

        $response = $this->jsonRequest(
            'POST',
            "/api/projects/{$projectB->getId()}/quotes/{$quoteOfA->getId()}/accept",
            null,
            $clientUser,
        );

        self::assertSame(Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }
}
