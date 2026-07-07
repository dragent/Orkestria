<?php

declare(strict_types=1);

namespace App\Service;

use App\Repository\UserRepository;

final class SlugGenerator
{
    public function __construct(private readonly UserRepository $userRepository) {}

    public function generateForUser(string $firstName, string $lastName): string
    {
        $base = $this->slugify($firstName . '-' . $lastName);
        $slug = $base;
        $suffix = 2;

        while ($this->userRepository->findOneBy(['slug' => $slug]) !== null) {
            $slug = $base . '-' . $suffix;
            ++$suffix;
        }

        return $slug;
    }

    private function slugify(string $text): string
    {
        $text = mb_strtolower($text, 'UTF-8');

        $map = [
            'à' => 'a', 'â' => 'a', 'ä' => 'a', 'á' => 'a', 'ã' => 'a', 'å' => 'a',
            'è' => 'e', 'é' => 'e', 'ê' => 'e', 'ë' => 'e',
            'ì' => 'i', 'í' => 'i', 'î' => 'i', 'ï' => 'i',
            'ò' => 'o', 'ó' => 'o', 'ô' => 'o', 'õ' => 'o', 'ö' => 'o', 'ø' => 'o',
            'ù' => 'u', 'ú' => 'u', 'û' => 'u', 'ü' => 'u',
            'ý' => 'y', 'ÿ' => 'y',
            'ñ' => 'n', 'ç' => 'c', 'ß' => 'ss',
            'æ' => 'ae', 'œ' => 'oe',
        ];

        $text = strtr($text, $map);
        $text = (string) preg_replace('/[^a-z0-9]+/', '-', $text);
        $text = trim($text, '-');

        return $text !== '' ? $text : 'user';
    }
}
