<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\TimeEntryHourType;
use App\Repository\TimeEntryRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/payroll', name: 'api_admin_payroll_')]
#[IsGranted('ROLE_RH')]
final class PayrollExportController extends AbstractController
{
    public function __construct(
        private readonly TimeEntryRepository $timeEntryRepository,
    ) {}

    #[Route('/time-entries.csv', name: 'time_entries_csv', methods: ['GET'])]
    public function timeEntriesCsv(Request $request): Response
    {
        $fromRaw = $request->query->get('from');
        $toRaw = $request->query->get('to');
        if (!is_string($fromRaw) || $fromRaw === '' || !is_string($toRaw) || $toRaw === '') {
            return $this->json(['message' => 'Query parameters "from" and "to" are required (ISO dates).'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $from = (new \DateTimeImmutable($fromRaw))->setTime(0, 0, 0);
            $to = (new \DateTimeImmutable($toRaw))->setTime(23, 59, 59);
        } catch (\Exception) {
            return $this->json(['message' => 'Invalid date format for from/to.'], Response::HTTP_BAD_REQUEST);
        }

        if ($from > $to) {
            return $this->json(['message' => '"from" must be before or equal to "to".'], Response::HTTP_BAD_REQUEST);
        }

        $companyId = null;
        $cid = $request->query->get('companyId');
        if ($cid !== null && $cid !== '') {
            if (!is_numeric($cid)) {
                return $this->json(['message' => 'Invalid companyId.'], Response::HTTP_BAD_REQUEST);
            }
            $companyId = (int) $cid;
        }

        $entries = $this->timeEntryRepository->findForPayrollExport($from, $to, $companyId);

        $filename = sprintf('orkestria-payroll-%s_%s.csv', $from->format('Y-m-d'), $to->format('Y-m-d'));

        $buffer = fopen('php://temp', 'r+');
        if ($buffer === false) {
            return $this->json(['message' => 'Could not build export.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
        fputcsv($buffer, [
            'date',
            'employee_id',
            'last_name',
            'first_name',
            'hours',
            'hour_type',
            'project_id',
            'project_title',
            'description',
        ], ',', '"', '\\');
        foreach ($entries as $te) {
            $e = $te->getEmployee();
            $p = $te->getProject();
            fputcsv($buffer, [
                $te->getDate()->format('Y-m-d'),
                $e?->getId(),
                $e?->getLastName() ?? '',
                $e?->getFirstName() ?? '',
                $te->getHours(),
                $te->getHourType()->value,
                $p?->getId(),
                $p?->getTitle() ?? '',
                $te->getDescription() ?? '',
            ], ',', '"', '\\');
        }
        rewind($buffer);
        $csv = (string) stream_get_contents($buffer);
        fclose($buffer);

        $response = new Response($csv);
        $response->headers->set('Content-Type', 'text/csv; charset=UTF-8');
        $response->headers->set('Content-Disposition', 'attachment; filename="' . $filename . '"');

        return $response;
    }
}
