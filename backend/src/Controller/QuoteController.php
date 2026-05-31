<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Invoice;
use App\Entity\Quote;
use App\Entity\QuoteLine;
use App\Entity\QuoteStatus;
use App\Entity\User;
use App\Repository\InvoiceRepository;
use App\Repository\ProjectRepository;
use App\Repository\QuoteRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/projects/{projectId}/quotes', name: 'api_quotes_', requirements: ['projectId' => '\d+'])]
#[IsGranted('ROLE_USER')]
final class QuoteController extends AbstractController
{
    private const GROUPS = ['quote:read', 'project:read', 'client:read', 'invoice:read'];

    public function __construct(
        private readonly ProjectRepository $projectRepository,
        private readonly QuoteRepository $quoteRepository,
        private readonly InvoiceRepository $invoiceRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly SerializerInterface $serializer,
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(int $projectId): JsonResponse
    {
        $project = $this->projectRepository->find($projectId);
        if ($project === null) {
            return $this->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        /** @var User $user */
        $user = $this->getUser();
        if (!\in_array('ROLE_ADMIN', $user->getRoles(), true)) {
            if (!$this->isClientProject($user, $project)) {
                return $this->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
            }
        }

        $quotes = $this->quoteRepository->findByProject($project);
        $json = $this->serializer->serialize($quotes, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{quoteId}', name: 'show', methods: ['GET'], requirements: ['quoteId' => '\d+'])]
    public function show(int $projectId, int $quoteId): JsonResponse
    {
        $quote = $this->quoteRepository->find($quoteId);
        if ($quote === null || $quote->getProject()?->getId() !== $projectId) {
            return $this->json(['message' => 'Quote not found.'], Response::HTTP_NOT_FOUND);
        }

        /** @var User $user */
        $user = $this->getUser();
        if (!\in_array('ROLE_ADMIN', $user->getRoles(), true)) {
            if (!$this->isClientProject($user, $quote->getProject())) {
                return $this->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
            }
        }

        $json = $this->serializer->serialize($quote, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(int $projectId, Request $request): JsonResponse
    {
        $project = $this->projectRepository->find($projectId);
        if ($project === null) {
            return $this->json(['message' => 'Project not found.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON.'], Response::HTTP_BAD_REQUEST);
        }

        $quote = new Quote();
        $quote->setProject($project);

        if (isset($data['notes'])) {
            $quote->setNotes((string) $data['notes']);
        }

        $linesError = $this->applyLines($quote, $data['lines'] ?? [], replace: false);
        if ($linesError !== null) {
            return $linesError;
        }

        $this->entityManager->persist($quote);
        $this->entityManager->flush();

        $json = $this->serializer->serialize($quote, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_CREATED, [], true);
    }

    #[Route('/{quoteId}', name: 'update', methods: ['PATCH'], requirements: ['quoteId' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function update(int $projectId, int $quoteId, Request $request): JsonResponse
    {
        $quote = $this->quoteRepository->find($quoteId);
        if ($quote === null || $quote->getProject()?->getId() !== $projectId) {
            return $this->json(['message' => 'Quote not found.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Invalid JSON.'], Response::HTTP_BAD_REQUEST);
        }

        if (array_key_exists('status', $data)) {
            try {
                $quote->setStatus(QuoteStatus::from((string) $data['status']));
            } catch (\ValueError) {
                return $this->json([
                    'message' => 'Invalid status.',
                    'allowed' => array_map(fn (QuoteStatus $s) => $s->value, QuoteStatus::cases()),
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            if ($quote->getStatus() === QuoteStatus::ACCEPTED && $quote->getInvoice() === null) {
                $invoice = new Invoice();
                $invoice->setQuote($quote);
                $invoice->setTotalCents($quote->getTotalCents());
                $this->entityManager->persist($invoice);
            }
        }

        if (array_key_exists('notes', $data)) {
            $quote->setNotes($data['notes'] !== null ? (string) $data['notes'] : null);
        }

        if (array_key_exists('lines', $data)) {
            $linesError = $this->applyLines($quote, $data['lines'], replace: true);
            if ($linesError !== null) {
                return $linesError;
            }
        }

        $this->entityManager->flush();

        $json = $this->serializer->serialize($quote, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{quoteId}/accept', name: 'client_accept', methods: ['POST'], requirements: ['quoteId' => '\d+'])]
    public function clientAccept(int $projectId, int $quoteId): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $quote = $this->quoteRepository->find($quoteId);
        if ($quote === null || $quote->getProject()?->getId() !== $projectId) {
            return $this->json(['message' => 'Quote not found.'], Response::HTTP_NOT_FOUND);
        }

        if ($quote->getStatus() !== QuoteStatus::SENT) {
            return $this->json(['message' => 'Only sent quotes can be accepted.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (!\in_array('ROLE_ADMIN', $user->getRoles(), true)) {
            if (!$this->isClientProject($user, $quote->getProject())) {
                return $this->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
            }
        }

        $quote->setStatus(QuoteStatus::ACCEPTED);

        if ($quote->getInvoice() === null) {
            $invoice = new Invoice();
            $invoice->setQuote($quote);
            $invoice->setTotalCents($quote->getTotalCents());
            $this->entityManager->persist($invoice);
        }

        $this->entityManager->flush();

        $json = $this->serializer->serialize($quote, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{quoteId}/reject', name: 'client_reject', methods: ['POST'], requirements: ['quoteId' => '\d+'])]
    public function clientReject(int $projectId, int $quoteId): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $quote = $this->quoteRepository->find($quoteId);
        if ($quote === null || $quote->getProject()?->getId() !== $projectId) {
            return $this->json(['message' => 'Quote not found.'], Response::HTTP_NOT_FOUND);
        }

        if ($quote->getStatus() !== QuoteStatus::SENT) {
            return $this->json(['message' => 'Only sent quotes can be rejected.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (!\in_array('ROLE_ADMIN', $user->getRoles(), true)) {
            if (!$this->isClientProject($user, $quote->getProject())) {
                return $this->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
            }
        }

        $quote->setStatus(QuoteStatus::REJECTED);
        $this->entityManager->flush();

        $json = $this->serializer->serialize($quote, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{quoteId}', name: 'delete', methods: ['DELETE'], requirements: ['quoteId' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(int $projectId, int $quoteId): Response
    {
        $quote = $this->quoteRepository->find($quoteId);
        if ($quote === null || $quote->getProject()?->getId() !== $projectId) {
            return $this->json(['message' => 'Quote not found.'], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($quote);
        $this->entityManager->flush();

        return new Response(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * @param array<mixed> $rawLines
     */
    private function applyLines(Quote $quote, array $rawLines, bool $replace): ?JsonResponse
    {
        if ($replace) {
            foreach ($quote->getLines()->toArray() as $line) {
                $this->entityManager->remove($line);
            }
            $quote->getLines()->clear();
        }

        foreach ($rawLines as $i => $rawLine) {
            if (!is_array($rawLine)) {
                return $this->json(['message' => "Line $i must be an object."], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $label = trim((string) ($rawLine['label'] ?? ''));
            if ($label === '') {
                return $this->json(['message' => "Line $i: field \"label\" is required."], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $qty = $rawLine['quantity'] ?? null;
            if (!is_numeric($qty) || (float) $qty <= 0) {
                return $this->json(['message' => "Line $i: field \"quantity\" must be a positive number."], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $unitPrice = $rawLine['unitPriceCents'] ?? null;
            if (!is_int($unitPrice) || $unitPrice < 0) {
                return $this->json(['message' => "Line $i: field \"unitPriceCents\" must be a non-negative integer."], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $line = new QuoteLine();
            $line->setLabel($label);
            $line->setQuantity((string) $qty);
            $line->setUnitPriceCents($unitPrice);
            $quote->addLine($line);
            $this->entityManager->persist($line);
        }

        return null;
    }

    private function isClientProject(User $user, ?\App\Entity\Project $project): bool
    {
        if ($project === null) {
            return false;
        }
        $client = $project->getClient();

        return $client !== null && $client->getEmail() === $user->getEmail();
    }
}
