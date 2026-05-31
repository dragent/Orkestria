<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use App\Repository\InvoiceRepository;
use App\Repository\ProjectRepository;
use App\Repository\ProjectStageHistoryRepository;
use App\Repository\QuoteRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/pdf', name: 'api_pdf_')]
#[IsGranted('ROLE_USER')]
final class PdfController extends AbstractController
{
    public function __construct(
        private readonly QuoteRepository $quoteRepository,
        private readonly InvoiceRepository $invoiceRepository,
        private readonly ProjectRepository $projectRepository,
        private readonly ProjectStageHistoryRepository $stageHistoryRepository,
    ) {}

    #[Route('/projects/{id}/report', name: 'project_report', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function projectReport(int $id): Response
    {
        $project = $this->projectRepository->find($id);
        if ($project === null) {
            return $this->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        $history = $this->stageHistoryRepository->findByProject($project);
        $html    = $this->renderView('pdf/project_report.html.twig', [
            'project' => $project,
            'history' => $history,
        ]);

        return new Response($html, Response::HTTP_OK, ['Content-Type' => 'text/html; charset=UTF-8']);
    }

    #[Route('/quotes/{id}', name: 'quote', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function quote(int $id): Response
    {
        $quote = $this->quoteRepository->find($id);
        if ($quote === null) {
            return $this->json(['message' => 'Quote not found.'], Response::HTTP_NOT_FOUND);
        }

        /** @var User $user */
        $user = $this->getUser();
        $isAdmin = \in_array('ROLE_ADMIN', $user->getRoles(), true);

        if (!$isAdmin) {
            $client = $quote->getProject()?->getClient();
            if ($client === null || $client->getEmail() !== $user->getEmail()) {
                return $this->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
            }
        }

        $html = $this->renderView('pdf/quote.html.twig', ['quote' => $quote]);

        return new Response($html, Response::HTTP_OK, ['Content-Type' => 'text/html; charset=UTF-8']);
    }

    #[Route('/invoices/{id}', name: 'invoice', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function invoice(int $id): Response
    {
        $invoice = $this->invoiceRepository->find($id);
        if ($invoice === null) {
            return $this->json(['message' => 'Invoice not found.'], Response::HTTP_NOT_FOUND);
        }

        /** @var User $user */
        $user = $this->getUser();
        $isAdmin = \in_array('ROLE_ADMIN', $user->getRoles(), true);

        if (!$isAdmin) {
            $client = $invoice->getQuote()?->getProject()?->getClient();
            if ($client === null || $client->getEmail() !== $user->getEmail()) {
                return $this->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
            }
        }

        $html = $this->renderView('pdf/invoice.html.twig', ['invoice' => $invoice]);

        return new Response($html, Response::HTTP_OK, ['Content-Type' => 'text/html; charset=UTF-8']);
    }
}
