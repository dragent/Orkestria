<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\InvoiceStatus;
use App\Entity\User;
use App\Repository\InvoiceRepository;
use App\Repository\ProjectRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/projects/{projectId}/invoices', name: 'api_invoices_', requirements: ['projectId' => '\d+'])]
#[IsGranted('ROLE_USER')]
final class InvoiceController extends AbstractController
{
    private const GROUPS = ['invoice:read', 'quote:read'];

    public function __construct(
        private readonly ProjectRepository $projectRepository,
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

        $invoices = [];
        foreach ($project->getQuotes() as $quote) {
            $inv = $quote->getInvoice();
            if ($inv !== null) {
                $invoices[] = $inv;
            }
        }

        $json = $this->serializer->serialize($invoices, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{invoiceId}/status', name: 'update_status', methods: ['PATCH'], requirements: ['invoiceId' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateStatus(int $projectId, int $invoiceId, Request $request): JsonResponse
    {
        $invoice = $this->invoiceRepository->find($invoiceId);
        if ($invoice === null || $invoice->getQuote()?->getProject()?->getId() !== $projectId) {
            return $this->json(['message' => 'Invoice not found.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data) || !isset($data['status'])) {
            return $this->json(['message' => 'Field "status" is required.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $status = InvoiceStatus::from((string) $data['status']);
        } catch (\ValueError) {
            return $this->json([
                'message' => 'Invalid status.',
                'allowed' => array_map(fn (InvoiceStatus $s) => $s->value, InvoiceStatus::cases()),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $invoice->setStatus($status);
        if ($status === InvoiceStatus::PAID && $invoice->getPaidAt() === null) {
            $invoice->setPaidAt(new \DateTimeImmutable());
        }

        $this->entityManager->flush();

        $json = $this->serializer->serialize($invoice, 'json', ['groups' => self::GROUPS]);

        return new JsonResponse($json, Response::HTTP_OK, [], true);
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
