<?php

declare(strict_types=1);

namespace App\Controller;

use App\Repository\ComplianceDeadlineRepository;
use App\Repository\LeaveRepository;
use App\Repository\ProjectRepository;
use App\Repository\QuoteRepository;
use App\Repository\TimeEntryRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/dashboard', name: 'api_admin_dashboard_')]
#[IsGranted('ROLE_ADMIN')]
final class BtpExecutiveDashboardController extends AbstractController
{
    public function __construct(
        private readonly QuoteRepository $quoteRepository,
        private readonly TimeEntryRepository $timeEntryRepository,
        private readonly ProjectRepository $projectRepository,
        private readonly ComplianceDeadlineRepository $complianceDeadlineRepository,
        private readonly LeaveRepository $leaveRepository,
    ) {}

    #[Route('/btp-kpis', name: 'btp_kpis', methods: ['GET'])]
    public function btpKpis(): JsonResponse
    {
        $today = new \DateTimeImmutable('today');
        $from30 = $today->modify('-30 days');
        $until30 = $today->modify('+30 days');

        $acceptedQuotesTotalCents         = $this->quoteRepository->sumTotalCentsAcceptedQuotes();
        $actualLaborCostCents             = $this->timeEntryRepository->sumActualLaborCostCents();
        $timeEntriesTotalHoursLast30Days  = $this->timeEntryRepository->sumHoursBetween($from30, $today);
        $projectsByPipelineStage          = $this->projectRepository->countGroupedByPipelineStage();
        $complianceDeadlinesDueNext30Days = $this->complianceDeadlineRepository->countExpiringBetween($today, $until30);
        $pendingLeavesCount               = $this->leaveRepository->countPendingAll();

        $marginCents = $acceptedQuotesTotalCents - $actualLaborCostCents;

        return $this->json([
            'acceptedQuotesTotalCents'         => $acceptedQuotesTotalCents,
            'actualLaborCostCents'             => $actualLaborCostCents,
            'marginCents'                      => $marginCents,
            'timeEntriesTotalHoursLast30Days'  => $timeEntriesTotalHoursLast30Days,
            'projectsByPipelineStage'          => $projectsByPipelineStage,
            'complianceDeadlinesDueNext30Days' => $complianceDeadlinesDueNext30Days,
            'pendingLeavesCount'               => $pendingLeavesCount,
        ]);
    }
}
