<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Employee;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Employee>
 */
class EmployeeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Employee::class);
    }

    public function findByUser(User $user): ?Employee
    {
        return $this->findOneBy(['user' => $user]);
    }

    /** @return Employee[] */
    public function findWithFilters(?string $q, ?int $companyId): array
    {
        $qb = $this->createQueryBuilder('e')
            ->leftJoin('e.user', 'u')
            ->leftJoin('e.company', 'c')
            ->addSelect('u', 'c');

        if ($q !== null) {
            $qb->andWhere('LOWER(e.firstName) LIKE :q OR LOWER(e.lastName) LIKE :q OR LOWER(e.role) LIKE :q')
                ->setParameter('q', '%' . mb_strtolower($q) . '%');
        }

        if ($companyId !== null) {
            $qb->andWhere('c.id = :companyId')
                ->setParameter('companyId', $companyId);
        }

        return $qb->orderBy('e.lastName', 'ASC')
            ->addOrderBy('e.firstName', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
