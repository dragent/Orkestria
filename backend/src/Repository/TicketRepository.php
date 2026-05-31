<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Ticket;
use App\Entity\TicketPriority;
use App\Entity\TicketSource;
use App\Entity\TicketStatus;
use App\Entity\TicketType;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Ticket>
 */
class TicketRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Ticket::class);
    }

    /**
     * @param array{
     *     status?: TicketStatus|null,
     *     priority?: TicketPriority|null,
     *     type?: TicketType|null,
     *     source?: TicketSource|null,
     *     projectId?: int|null,
     *     assigneeId?: int|null,
     *     reporterId?: int|null,
     *     q?: string|null,
     * } $criteria
     *
     * @return array{items: Ticket[], total: int}
     */
    public function findFiltered(array $criteria, int $page = 1, int $perPage = 50): array
    {
        $qb = $this->createQueryBuilder('t')
            ->leftJoin('t.assignee', 'a')->addSelect('a')
            ->leftJoin('t.reporter', 'r')->addSelect('r')
            ->leftJoin('t.project', 'p')->addSelect('p');

        if (!empty($criteria['status'])) {
            $qb->andWhere('t.status = :status')->setParameter('status', $criteria['status']);
        }
        if (!empty($criteria['priority'])) {
            $qb->andWhere('t.priority = :priority')->setParameter('priority', $criteria['priority']);
        }
        if (!empty($criteria['type'])) {
            $qb->andWhere('t.type = :type')->setParameter('type', $criteria['type']);
        }
        if (!empty($criteria['source'])) {
            $qb->andWhere('t.source = :source')->setParameter('source', $criteria['source']);
        }
        if (!empty($criteria['projectId'])) {
            $qb->andWhere('p.id = :projectId')->setParameter('projectId', (int) $criteria['projectId']);
        }
        if (!empty($criteria['assigneeId'])) {
            $qb->andWhere('a.id = :assigneeId')->setParameter('assigneeId', (int) $criteria['assigneeId']);
        }
        if (!empty($criteria['reporterId'])) {
            $qb->andWhere('r.id = :reporterId')->setParameter('reporterId', (int) $criteria['reporterId']);
        }
        if (!empty($criteria['q'])) {
            $qb->andWhere('LOWER(t.title) LIKE :q OR LOWER(t.description) LIKE :q')
                ->setParameter('q', '%' . mb_strtolower((string) $criteria['q']) . '%');
        }

        $qb->orderBy('t.updatedAt', 'DESC');

        $total = (int) (clone $qb)->select('COUNT(t.id)')->getQuery()->getSingleScalarResult();

        if ($perPage > 0) {
            $qb->setFirstResult(($page - 1) * $perPage)->setMaxResults($perPage);
        }

        return ['items' => $qb->getQuery()->getResult(), 'total' => $total];
    }

    /** @return Ticket[] */
    public function findReportedBy(User $user): array
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.reporter = :user')
            ->setParameter('user', $user)
            ->orderBy('t.updatedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
