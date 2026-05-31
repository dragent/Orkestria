<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Invoice;
use App\Entity\Project;
use App\Entity\ProjectPipelineStage;
use App\Entity\Quote;
use App\Repository\DocumentRepository;
use App\Repository\InvoiceRepository;
use App\Repository\QuoteRepository;

/**
 * Returns a static checklist of required actions for each pipeline stage,
 * with a "completed" flag computed from the project's existing data.
 */
final class StageChecklistService
{
    public function __construct(
        private readonly QuoteRepository $quoteRepository,
        private readonly InvoiceRepository $invoiceRepository,
        private readonly DocumentRepository $documentRepository,
    ) {}

    /**
     * @return list<array{id: string, label: string, completed: bool}>
     */
    public function getChecklist(Project $project): array
    {
        $stage = $project->getPipelineStage();

        return match ($stage) {
            ProjectPipelineStage::CONTACT => [
                ['id' => 'contact_info', 'label' => 'Coordonnées client enregistrées', 'completed' => $project->getClient() !== null],
                ['id' => 'project_created', 'label' => 'Projet créé dans Orkestria', 'completed' => $project->getId() !== null],
            ],
            ProjectPipelineStage::MEETING => [
                ['id' => 'meeting_scheduled', 'label' => 'Réunion planifiée avec le client', 'completed' => false],
                ['id' => 'needs_identified', 'label' => 'Besoins identifiés', 'completed' => false],
            ],
            ProjectPipelineStage::ENGINEER_ASSIGNED => [
                ['id' => 'engineer_assigned', 'label' => 'Ingénieur assigné au projet', 'completed' => $project->getEmployees()->count() > 0],
            ],
            ProjectPipelineStage::QUOTE_PLAN => [
                ['id' => 'quote_exists', 'label' => 'Au moins un devis créé', 'completed' => $this->hasQuote($project)],
            ],
            ProjectPipelineStage::QUOTE_SIGNED => [
                ['id' => 'quote_accepted', 'label' => 'Devis accepté par le client', 'completed' => $this->hasAcceptedQuote($project)],
            ],
            ProjectPipelineStage::INVOICE_SENT => [
                ['id' => 'invoice_created', 'label' => 'Facture créée', 'completed' => $this->hasInvoice($project)],
                ['id' => 'invoice_sent', 'label' => 'Facture envoyée', 'completed' => $this->hasInvoiceWithStatus($project, 'sent')],
            ],
            ProjectPipelineStage::DEPOSIT_RECEIVED => [
                ['id' => 'deposit_proof', 'label' => 'Preuve d\'acompte reçue', 'completed' => false],
            ],
            ProjectPipelineStage::DESIGN_STARTED => [
                ['id' => 'architect_assigned', 'label' => 'Architecte assigné', 'completed' => $project->getEmployees()->count() > 0],
                ['id' => 'plans_document', 'label' => 'Document de plans téléversé', 'completed' => $this->hasDocument($project)],
            ],
            ProjectPipelineStage::DESIGN_COMPLETED => [
                ['id' => 'plans_validated', 'label' => 'Plans validés en interne', 'completed' => $this->hasDocument($project)],
            ],
            ProjectPipelineStage::CLIENT_SIGNED => [
                ['id' => 'client_signature', 'label' => 'Signature client obtenue', 'completed' => false],
            ],
            ProjectPipelineStage::COMPONENTS_ORDERED => [
                ['id' => 'components_list', 'label' => 'Liste de matériaux établie', 'completed' => false],
                ['id' => 'orders_placed', 'label' => 'Commandes passées fournisseurs', 'completed' => false],
            ],
            ProjectPipelineStage::CONSTRUCTION => [
                ['id' => 'site_ready', 'label' => 'Chantier préparé', 'completed' => false],
                ['id' => 'team_briefed', 'label' => 'Équipe briefée', 'completed' => $project->getEmployees()->count() > 0],
            ],
            ProjectPipelineStage::SUBCONTRACTORS => [
                ['id' => 'sub_contracts', 'label' => 'Contrats sous-traitants signés', 'completed' => false],
            ],
            ProjectPipelineStage::SITE_VISIT => [
                ['id' => 'visit_done', 'label' => 'Visite de chantier effectuée', 'completed' => false],
                ['id' => 'punch_list', 'label' => 'Liste de réserves établie', 'completed' => false],
            ],
            ProjectPipelineStage::PAID => [
                ['id' => 'final_invoice_paid', 'label' => 'Facture finale payée', 'completed' => $this->hasInvoiceWithStatus($project, 'paid')],
                ['id' => 'project_closed', 'label' => 'Projet clôturé', 'completed' => true],
            ],
        };
    }

    private function hasQuote(Project $project): bool
    {
        return count($this->quoteRepository->findByProject($project)) > 0;
    }

    private function hasAcceptedQuote(Project $project): bool
    {
        $quotes = $this->quoteRepository->findByProject($project);
        foreach ($quotes as $q) {
            if ($q->getStatus()->value === 'accepted') {
                return true;
            }
        }

        return false;
    }

    private function hasInvoice(Project $project): bool
    {
        return count($this->invoiceRepository->findBy(['quote' => $this->quoteRepository->findByProject($project)])) > 0;
    }

    private function hasInvoiceWithStatus(Project $project, string $status): bool
    {
        $quotes = $this->quoteRepository->findByProject($project);
        if (empty($quotes)) {
            return false;
        }
        $invoices = $this->invoiceRepository->findBy(['quote' => $quotes]);
        foreach ($invoices as $inv) {
            if ($inv->getStatus()->value === $status) {
                return true;
            }
        }

        return false;
    }

    private function hasDocument(Project $project): bool
    {
        return count($this->documentRepository->findBy(['project' => $project])) > 0;
    }
}
