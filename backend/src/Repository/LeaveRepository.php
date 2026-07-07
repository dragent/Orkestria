<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Leave;
use App\Entity\LeaveStatus;
use App\Entity\LeaveType;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Leave>
 */
class LeaveRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Leave::class);
    }

    /**
     * @return array{items: Leave[], total: int}
     */
    public function findFiltered(
        ?int $employeeId = null,
        ?int $companyId = null,
        ?LeaveStatus $status = null,
        ?LeaveType $type = null,
        int $page = 1,
        int $perPage = 50,
    ): array {
        $qb = $this->createQueryBuilder('l')
            ->leftJoin('l.employee', 'e')
            ->addSelect('e')
            ->orderBy('l.startsAt', 'DESC')
            ->addOrderBy('l.id', 'DESC');

        if ($employeeId !== null) {
            $qb->andWhere('e.id = :empId')
                ->setParameter('empId', $employeeId);
        }

        if ($companyId !== null) {
            $qb->andWhere('e.company = :compId')
                ->setParameter('compId', $companyId);
        }

        if ($status !== null) {
            $qb->andWhere('l.status = :status')
                ->setParameter('status', $status);
        }

        if ($type !== null) {
            $qb->andWhere('l.type = :type')
                ->setParameter('type', $type);
        }

        $total = (int) (clone $qb)->select('COUNT(l.id)')->getQuery()->getSingleScalarResult();

        if ($perPage > 0) {
            $qb->setFirstResult(($page - 1) * $perPage)->setMaxResults($perPage);
        }

        return ['items' => $qb->getQuery()->getResult(), 'total' => $total];
    }

    /**
     * Returns true if the employee already has an active (pending or approved) leave overlapping the given date range.
     */
    public function hasOverlap(int $employeeId, \DateTimeImmutable $startsAt, \DateTimeImmutable $endsAt, ?int $excludeId = null): bool
    {
        $qb = $this->createQueryBuilder('l')
            ->select('COUNT(l.id)')
            ->leftJoin('l.employee', 'e')
            ->andWhere('e.id = :empId')
            ->andWhere('l.status IN (:activeStatuses)')
            ->andWhere('l.startsAt <= :endsAt')
            ->andWhere('l.endsAt >= :startsAt')
            ->setParameter('empId', $employeeId)
            ->setParameter('activeStatuses', [LeaveStatus::PENDING, LeaveStatus::APPROVED])
            ->setParameter('startsAt', $startsAt->setTime(0, 0, 0))
            ->setParameter('endsAt', $endsAt->setTime(23, 59, 59));

        if ($excludeId !== null) {
            $qb->andWhere('l.id != :excludeId')
                ->setParameter('excludeId', $excludeId);
        }

        return (int) $qb->getQuery()->getSingleScalarResult() > 0;
    }

    public function countPendingAll(): int
    {
        return (int) $this->createQueryBuilder('l')
            ->select('COUNT(l.id)')
            ->andWhere('l.status = :status')
            ->setParameter('status', LeaveStatus::PENDING)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function countPendingForCompany(int $companyId): int
    {
        $n = (int) $this->createQueryBuilder('l')
            ->select('COUNT(l.id)')
            ->leftJoin('l.employee', 'e')
            ->andWhere('e.company = :compId')
            ->andWhere('l.status = :status')
            ->setParameter('compId', $companyId)
            ->setParameter('status', LeaveStatus::PENDING)
            ->getQuery()
            ->getSingleScalarResult();

        return $n;
    }
}
