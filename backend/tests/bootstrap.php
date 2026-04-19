<?php

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__).'/vendor/autoload.php';

if (method_exists(Dotenv::class, 'bootEnv')) {
    (new Dotenv())->bootEnv(dirname(__DIR__).'/.env');
}

$testDbPath = str_replace('\\', '/', dirname(__DIR__) . '/var/test.db');
$_ENV['DATABASE_URL'] = 'sqlite:///' . $testDbPath;
$_SERVER['DATABASE_URL'] = $_ENV['DATABASE_URL'];
putenv('DATABASE_URL=' . $_ENV['DATABASE_URL']);

if ($_SERVER['APP_DEBUG']) {
    umask(0000);
}
