<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Employee;
use App\Entity\Project;
use App\Entity\TimeEntry;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TimeEntry>
 */
class TimeEntryRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TimeEntry::class);
    }

    /** @return TimeEntry[] */
    public function findByProject(Project $project): array
    {
        return $this->createQueryBuilder('te')
            ->join('te.employee', 'e')
            ->addSelect('e')
            ->andWhere('te.project = :project')
            ->setParameter('project', $project)
            ->orderBy('te.date', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /** @return TimeEntry[] */
    public function findByEmployee(Employee $employee): array
    {
        return $this->createQueryBuilder('te')
            ->join('te.project', 'p')
            ->addSelect('p')
            ->andWhere('te.employee = :employee')
            ->setParameter('employee', $employee)
            ->orderBy('te.date', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return TimeEntry[]
     */
    public function findForPayrollExport(\DateTimeImmutable $from, \DateTimeImmutable $to, ?int $companyId = null): array
    {
        $qb = $this->createQueryBuilder('te')
            ->join('te.employee', 'e')
            ->addSelect('e')
            ->join('te.project', 'p')
            ->addSelect('p')
            ->join('p.client', 'cl')
            ->addSelect('cl')
            ->andWhere('te.date >= :from')
            ->andWhere('te.date <= :to')
            ->setParameter('from', $from->setTime(0, 0, 0))
            ->setParameter('to', $to->setTime(23, 59, 59))
            ->orderBy('te.date', 'ASC')
            ->addOrderBy('e.lastName', 'ASC')
            ->addOrderBy('te.id', 'ASC');

        if ($companyId !== null) {
            $qb->andWhere('e.company = :cid OR (e.company IS NULL AND cl.company = :cid)')
                ->setParameter('cid', $companyId);
        }

        return $qb->getQuery()->getResult();
    }

    public function sumHoursBetween(\DateTimeImmutable $from, \DateTimeImmutable $to): string
    {
        $raw = $this->createQueryBuilder('te')
            ->select('SUM(te.hours)')
            ->andWhere('te.date >= :from')
            ->andWhere('te.date <= :to')
            ->setParameter('from', $from->setTime(0, 0, 0))
            ->setParameter('to', $to->setTime(23, 59, 59))
            ->getQuery()
            ->getSingleScalarResult();

        return $raw === null ? '0' : (string) $raw;
    }

    /**
     * Actual labor cost in cents: SUM(hours / 8 * daily_rate_cents).
     * Only counts employees with a non-null daily rate.
     */
    public function sumActualLaborCostCents(): int
    {
        $raw = $this->createQueryBuilder('te')
            ->select('SUM(te.hours / 8 * e.dailyRateCents)')
            ->join('te.employee', 'e')
            ->andWhere('e.dailyRateCents IS NOT NULL')
            ->getQuery()
            ->getSingleScalarResult();

        return $raw === null ? 0 : (int) round((float) $raw);
    }
}
