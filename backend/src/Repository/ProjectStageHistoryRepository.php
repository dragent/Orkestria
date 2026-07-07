<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Project;
use App\Entity\ProjectStageHistory;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ProjectStageHistory>
 */
final class ProjectStageHistoryRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ProjectStageHistory::class);
    }

    /**
     * @return list<ProjectStageHistory>
     */
    public function findByProject(Project $project): array
    {
        /** @var list<ProjectStageHistory> $result */
        $result = $this->createQueryBuilder('h')
            ->leftJoin('h.changedBy', 'u')->addSelect('u')
            ->where('h.project = :project')
            ->setParameter('project', $project)
            ->orderBy('h.changedAt', 'ASC')
            ->getQuery()
            ->getResult();

        return $result;
    }
}
