<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Document;
use App\Entity\DocumentScope;
use App\Entity\Project;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Document>
 */
final class DocumentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Document::class);
    }

    /**
     * @return list<Document>
     */
    public function findForProjectAndUser(Project $project, User $user, ?DocumentScope $scopeFilter = null): array
    {
        $qb = $this->createQueryBuilder('d')
            ->where('d.project = :project')
            ->setParameter('project', $project)
            ->orderBy('d.createdAt', 'DESC');

        if (!\in_array('ROLE_ADMIN', $user->getRoles(), true)) {
            $scopes = $user->getDocumentScopes();
            if ($scopes === []) {
                return [];
            }
            $qb->andWhere('d.scope IN (:scopes)')->setParameter('scopes', $scopes);
        }

        if ($scopeFilter !== null) {
            $qb->andWhere('d.scope = :one')->setParameter('one', $scopeFilter);
        }

        /** @var list<Document> $list */
        $list = $qb->getQuery()->getResult();

        return $list;
    }
}
