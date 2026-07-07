<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Company;
use App\Entity\ComplianceDeadline;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ComplianceDeadline>
 */
class ComplianceDeadlineRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ComplianceDeadline::class);
    }

    /**
     * @return ComplianceDeadline[]
     */
    public function findOrdered(?Company $company = null, ?int $onlyWithinDays = null): array
    {
        $qb = $this->createQueryBuilder('c')
            ->orderBy('c.expiresAt', 'ASC')
            ->addOrderBy('c.id', 'ASC');

        if ($company !== null) {
            $qb->andWhere('c.company = :comp')
                ->setParameter('comp', $company);
        }

        if ($onlyWithinDays !== null) {
            $until = new \DateTimeImmutable(sprintf('+%d days', $onlyWithinDays));
            $qb
                ->andWhere('c.expiresAt <= :until')
                ->setParameter('until', $until->setTime(23, 59, 59));
        }

        return $qb->getQuery()->getResult();
    }

    public function countExpiringBetween(\DateTimeImmutable $from, \DateTimeImmutable $to): int
    {
        $n = (int) $this->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->andWhere('c.expiresAt >= :from')
            ->andWhere('c.expiresAt <= :to')
            ->setParameter('from', $from->setTime(0, 0, 0))
            ->setParameter('to', $to->setTime(23, 59, 59))
            ->getQuery()
            ->getSingleScalarResult();

        return $n;
    }
}
