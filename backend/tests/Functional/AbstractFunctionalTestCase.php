<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Entity\Client;
use App\Entity\Company;
use App\Entity\Employee;
use App\Entity\Project;
use App\Entity\ProjectPipelineStage;
use App\Entity\Quote;
use App\Entity\QuoteLine;
use App\Entity\QuoteStatus;
use App\Entity\Task;
use App\Entity\TaskStatus;
use App\Entity\TimeEntry;
use App\Entity\TimeEntryHourType;
use App\Entity\Ticket;
use App\Entity\TicketComment;
use App\Entity\TicketPriority;
use App\Entity\TicketSource;
use App\Entity\TicketStatus;
use App\Entity\TicketType;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * Shared scaffolding for functional tests that hit the JWT-protected API:
 *  - resets the SQLite schema once per test class
 *  - exposes fixture helpers and a JWT-authenticated HTTP helper
 */
abstract class AbstractFunctionalTestCase extends WebTestCase
{
    protected static ?KernelBrowser $client = null;
    private static bool $schemaReady = false;

    protected static function jwtKeypairPresent(): bool
    {
        return is_file(dirname(__DIR__, 2) . '/config/jwt/private.pem');
    }

    protected function setUp(): void
    {
        parent::setUp();

        if (!self::jwtKeypairPresent()) {
            self::markTestSkipped('JWT keypair missing (run: php bin/console lexik:jwt:generate-keypair).');
        }

        self::$client = static::createClient();
        $this->resetSchema();
    }

    protected function tearDown(): void
    {
        self::$client = null;
        self::ensureKernelShutdown();
        self::$schemaReady = false;
        parent::tearDown();
    }

    /** Drop and recreate the schema once per test method (safer for shared SQLite state). */
    private function resetSchema(): void
    {
        if (self::$schemaReady) {
            return;
        }

        $em = self::getContainer()->get(EntityManagerInterface::class);
        $tool = new SchemaTool($em);
        $meta = $em->getMetadataFactory()->getAllMetadata();
        $tool->dropSchema($meta);
        $tool->createSchema($meta);
        self::$schemaReady = true;
    }

    protected function em(): EntityManagerInterface
    {
        return self::getContainer()->get(EntityManagerInterface::class);
    }

    protected function jwtFor(User $user): string
    {
        return self::getContainer()->get(JWTTokenManagerInterface::class)->create($user);
    }

    /**
     * @param array<string, mixed>|null $jsonBody
     */
    protected function jsonRequest(
        string $method,
        string $uri,
        ?array $jsonBody = null,
        ?User $authAs = null,
    ): \Symfony\Component\HttpFoundation\Response {
        $server = ['CONTENT_TYPE' => 'application/json'];
        if ($authAs !== null) {
            $server['HTTP_AUTHORIZATION'] = 'Bearer ' . $this->jwtFor($authAs);
        }

        // Detach fixtures so the controller hits fresh entities (avoids stale
        // in-memory collections from the test's identity map).
        $this->em()->clear();

        self::$client->request(
            $method,
            $uri,
            [],
            [],
            $server,
            $jsonBody === null ? null : json_encode($jsonBody, JSON_THROW_ON_ERROR),
        );

        return self::$client->getResponse();
    }

    /** @return array<string, mixed> */
    protected function decodeJson(\Symfony\Component\HttpFoundation\Response $response): array
    {
        $content = (string) $response->getContent();
        $data = json_decode($content, true, 512, JSON_THROW_ON_ERROR);
        self::assertIsArray($data);

        return $data;
    }

    // ─── Fixture builders ────────────────────────────────────────────────────

    protected function createCompany(string $name = 'Acme', string $slug = 'acme'): Company
    {
        $company = (new Company())->setName($name)->setSlug($slug);
        $this->em()->persist($company);
        $this->em()->flush();

        return $company;
    }

    /**
     * @param list<string> $roles
     */
    protected function createUser(
        string $email,
        array $roles = [],
        string $password = 'Secret123!',
        bool $active = true,
        bool $verified = true,
    ): User {
        $hasher = self::getContainer()->get(UserPasswordHasherInterface::class);
        $user = new User();
        $user
            ->setEmail($email)
            ->setFirstName('Test')
            ->setLastName(ucfirst(explode('@', $email)[0]))
            ->setSlug(uniqid('user-', true))
            ->setRoles($roles)
            ->setIsActive($active)
            ->setIsVerified($verified)
            ->setPassword($hasher->hashPassword($user, $password));

        $this->em()->persist($user);
        $this->em()->flush();

        return $user;
    }

    protected function createClientEntity(Company $company, string $name = 'Acme Client', ?string $email = null): Client
    {
        $client = (new Client())
            ->setName($name)
            ->setEmail($email ?? sprintf('client-%s@example.com', uniqid()))
            ->setCompany($company);
        $this->em()->persist($client);
        $this->em()->flush();

        return $client;
    }

    protected function createProject(
        Client $client,
        string $title = 'Project',
        ProjectPipelineStage $stage = ProjectPipelineStage::CONSTRUCTION,
    ): Project {
        $project = (new Project())
            ->setTitle($title)
            ->setClient($client)
            ->setPipelineStage($stage);

        $this->em()->persist($project);
        $this->em()->flush();

        return $project;
    }

    protected function createEmployee(?User $user, ?Company $company, string $role = 'Worker'): Employee
    {
        $employee = (new Employee())
            ->setFirstName('Emp')
            ->setLastName('Loyee')
            ->setRole($role)
            ->setUser($user)
            ->setCompany($company);

        $this->em()->persist($employee);
        $this->em()->flush();

        return $employee;
    }

    protected function createTimeEntry(
        Employee $employee,
        Project $project,
        string $date = '2026-05-01',
        string $hours = '7.5',
        TimeEntryHourType $hourType = TimeEntryHourType::REGULAR,
    ): TimeEntry {
        $entry = (new TimeEntry())
            ->setEmployee($employee)
            ->setProject($project)
            ->setDate(new \DateTimeImmutable($date))
            ->setHours($hours)
            ->setHourType($hourType);

        $this->em()->persist($entry);
        $this->em()->flush();

        return $entry;
    }

    protected function assignEmployee(Project $project, Employee $employee): void
    {
        $project->addEmployee($employee);
        $this->em()->flush();
    }

    /**
     * @param list<array{label: string, quantity: string, unitPriceCents: int}> $lines
     */
    protected function createQuote(
        Project $project,
        QuoteStatus $status = QuoteStatus::SENT,
        array $lines = [['label' => 'Service', 'quantity' => '1', 'unitPriceCents' => 100000]],
    ): Quote {
        $quote = new Quote();
        $quote->setProject($project);
        $quote->setStatus($status);

        foreach ($lines as $line) {
            $ql = (new QuoteLine())
                ->setLabel($line['label'])
                ->setQuantity($line['quantity'])
                ->setUnitPriceCents($line['unitPriceCents']);
            $quote->addLine($ql);
            $this->em()->persist($ql);
        }

        $this->em()->persist($quote);
        $this->em()->flush();

        return $quote;
    }

    protected function createTask(
        Project $project,
        string $title = 'Task',
        TaskStatus $status = TaskStatus::OPEN,
        ?Employee $assignee = null,
    ): Task {
        $task = (new Task())
            ->setTitle($title)
            ->setProject($project)
            ->setStatus($status)
            ->setAssignee($assignee);

        $this->em()->persist($task);
        $this->em()->flush();

        return $task;
    }

    protected function createTicket(
        User $reporter,
        ?Project $project = null,
        ?Employee $assignee = null,
        string $title = 'Ticket',
        string $description = 'Some description',
        TicketType $type = TicketType::BUG,
        TicketPriority $priority = TicketPriority::NORMAL,
        TicketStatus $status = TicketStatus::OPEN,
        TicketSource $source = TicketSource::INTERNAL,
    ): Ticket {
        $ticket = (new Ticket())
            ->setTitle($title)
            ->setDescription($description)
            ->setType($type)
            ->setPriority($priority)
            ->setStatus($status)
            ->setSource($source)
            ->setReporter($reporter)
            ->setProject($project)
            ->setAssignee($assignee);

        $this->em()->persist($ticket);
        $this->em()->flush();

        return $ticket;
    }

    protected function createTicketComment(Ticket $ticket, User $author, string $body = 'Comment'): TicketComment
    {
        $comment = (new TicketComment())
            ->setTicket($ticket)
            ->setAuthor($author)
            ->setBody($body);

        $this->em()->persist($comment);
        $this->em()->flush();

        return $comment;
    }
}
