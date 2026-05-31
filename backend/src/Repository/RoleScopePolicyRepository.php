<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\RoleScopePolicy;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<RoleScopePolicy>
 */
class RoleScopePolicyRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, RoleScopePolicy::class);
    }

    /**
     * Returns all policies indexed by role string.
     *
     * @return array<string, RoleScopePolicy>
     */
    public function findAllIndexedByRole(): array
    {
        $policies = $this->findAll();
        $indexed = [];
        foreach ($policies as $policy) {
            $indexed[$policy->getRole()] = $policy;
        }

        return $indexed;
    }

    /**
     * Returns the union of all document scopes granted by the given roles.
     *
     * @param  list<string> $roles
     * @return list<string>
     */
    public function findScopesForRoles(array $roles): array
    {
        if ($roles === []) {
            return [];
        }

        $policies = $this->createQueryBuilder('p')
            ->where('p.role IN (:roles)')
            ->setParameter('roles', $roles)
            ->getQuery()
            ->getResult();

        $scopes = [];
        foreach ($policies as $policy) {
            /** @var RoleScopePolicy $policy */
            foreach ($policy->getDocumentScopes() as $scope) {
                $scopes[] = $scope;
            }
        }

        return array_values(array_unique($scopes));
    }
}
