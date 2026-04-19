<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Project;
use App\Entity\ProjectPipelineStage;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Project>
 */
final class ProjectRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Project::class);
    }

    /**
     * @return list<Project>
     */
    public function search(?string $q, ?ProjectPipelineStage $pipeline, ?int $clientId): array
    {
        $qb = $this->createQueryBuilder('p')
            ->leftJoin('p.client', 'c')->addSelect('c')
            ->orderBy('p.createdAt', 'DESC');

        if ($q !== null && $q !== '') {
            $term = '%' . mb_strtolower($q) . '%';
            $qb->andWhere($qb->expr()->orX(
                'LOWER(p.title) LIKE :q',
                'LOWER(c.name) LIKE :q',
                'LOWER(c.email) LIKE :q',
            ))->setParameter('q', $term);
        }

        if ($pipeline !== null) {
            $qb->andWhere('p.pipelineStage = :pipeline')->setParameter('pipeline', $pipeline);
        }

        if ($clientId !== null) {
            $qb->andWhere('c.id = :clientId')->setParameter('clientId', $clientId);
        }

        /** @var list<Project> $list */
        $list = $qb->getQuery()->getResult();

        return $list;
    }
}
