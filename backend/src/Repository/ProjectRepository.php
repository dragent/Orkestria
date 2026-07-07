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
     * @return array{items: list<Project>, total: int}
     */
    public function search(
        ?string $q,
        ?ProjectPipelineStage $pipeline,
        ?int $clientId,
        int $page = 1,
        int $perPage = 50,
    ): array {
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

        $total = (int) (clone $qb)->select('COUNT(p.id)')->getQuery()->getSingleScalarResult();

        if ($perPage > 0) {
            $qb->setFirstResult(($page - 1) * $perPage)->setMaxResults($perPage);
        }

        /** @var list<Project> $items */
        $items = $qb->getQuery()->getResult();

        return ['items' => $items, 'total' => $total];
    }

    /**
     * @return array<string, int> pipeline stage value => project count
     */
    public function countGroupedByPipelineStage(): array
    {
        $rows = $this->createQueryBuilder('p')
            ->select('p.pipelineStage AS stage')
            ->addSelect('COUNT(p.id) AS cnt')
            ->groupBy('p.pipelineStage')
            ->getQuery()
            ->getArrayResult();

        $out = [];
        foreach (ProjectPipelineStage::cases() as $case) {
            $out[$case->value] = 0;
        }
        foreach ($rows as $row) {
            $stage = $row['stage'] ?? null;
            $cnt = (int) ($row['cnt'] ?? 0);
            $key = $stage instanceof ProjectPipelineStage ? $stage->value : (is_string($stage) ? $stage : null);
            if ($key !== null && \array_key_exists($key, $out)) {
                $out[$key] = $cnt;
            }
        }

        return $out;
    }

    /**
     * @return list<Project>
     */
    public function findByClientEmail(string $email): array
    {
        /** @var list<Project> $result */
        $result = $this->createQueryBuilder('p')
            ->leftJoin('p.client', 'c')->addSelect('c')
            ->where('c.email = :email')
            ->setParameter('email', $email)
            ->orderBy('p.createdAt', 'DESC')
            ->getQuery()
            ->getResult();

        return $result;
    }
}
