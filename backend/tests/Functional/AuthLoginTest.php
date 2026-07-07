<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class AuthLoginTest extends WebTestCase
{
    private static bool $schemaInitialized = false;

    private static function jwtKeypairPresent(): bool
    {
        return is_file(dirname(__DIR__, 2) . '/config/jwt/private.pem');
    }

    private static function ensureSchema(): void
    {
        if (self::$schemaInitialized) {
            return;
        }

        $em = static::getContainer()->get(EntityManagerInterface::class);
        $tool = new SchemaTool($em);
        $meta = $em->getMetadataFactory()->getAllMetadata();
        $tool->dropSchema($meta);
        $tool->createSchema($meta);
        self::$schemaInitialized = true;
    }

    public function testLoginReturnsJwtForVerifiedActiveUser(): void
    {
        if (!self::jwtKeypairPresent()) {
            self::markTestSkipped('JWT keypair missing (run: php bin/console lexik:jwt:generate-keypair).');
        }

        $client = static::createClient();
        self::ensureSchema();

        $container = static::getContainer();
        $em = $container->get(EntityManagerInterface::class);
        $hasher = $container->get(UserPasswordHasherInterface::class);

        $user = new User();
        $user->setEmail('auth-test@example.com');
        $user->setFirstName('Auth');
        $user->setLastName('Test');
        $user->setSlug('auth-test');
        $user->setRoles([]);
        $user->setPassword($hasher->hashPassword($user, 'Secret123!'));
        $user->setIsVerified(true);
        $user->setIsActive(true);

        $em->persist($user);
        $em->flush();

        $client->request(
            'POST',
            '/auth/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'auth-test@example.com',
                'password' => 'Secret123!',
            ], JSON_THROW_ON_ERROR)
        );

        self::assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        self::assertIsArray($data);
        self::assertArrayHasKey('token', $data);
        self::assertNotEmpty($data['token']);
    }

    public function testLoginRejectsUnverifiedUser(): void
    {
        if (!self::jwtKeypairPresent()) {
            self::markTestSkipped('JWT keypair missing (run: php bin/console lexik:jwt:generate-keypair).');
        }

        $client = static::createClient();
        self::ensureSchema();

        $container = static::getContainer();
        $em = $container->get(EntityManagerInterface::class);
        $hasher = $container->get(UserPasswordHasherInterface::class);

        $user = new User();
        $user->setEmail('unverified@example.com');
        $user->setFirstName('Un');
        $user->setLastName('Verified');
        $user->setSlug('unverified-test');
        $user->setRoles([]);
        $user->setPassword($hasher->hashPassword($user, 'Secret123!'));
        $user->setIsVerified(false);
        $user->setIsActive(true);

        $em->persist($user);
        $em->flush();

        $client->request(
            'POST',
            '/auth/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'unverified@example.com',
                'password' => 'Secret123!',
            ], JSON_THROW_ON_ERROR)
        );

        self::assertResponseStatusCodeSame(401);
    }
}
