<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Project;
use App\Entity\Quote;
use App\Entity\QuoteStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Quote>
 */
class QuoteRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Quote::class);
    }

    /** @return Quote[] */
    public function findByProject(Project $project): array
    {
        return $this->createQueryBuilder('q')
            ->leftJoin('q.lines', 'l')
            ->addSelect('l')
            ->andWhere('q.project = :project')
            ->setParameter('project', $project)
            ->orderBy('q.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /** Total cents for all accepted quotes (vendu signé). */
    public function sumTotalCentsAcceptedQuotes(): int
    {
        $raw = $this->createQueryBuilder('q')
            ->select('SUM(l.quantity * l.unitPriceCents)')
            ->join('q.lines', 'l')
            ->andWhere('q.status = :accepted')
            ->setParameter('accepted', QuoteStatus::ACCEPTED)
            ->getQuery()
            ->getSingleScalarResult();

        if ($raw === null) {
            return 0;
        }

        return (int) round((float) $raw);
    }
}
