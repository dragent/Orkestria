<?php

declare(strict_types=1);

namespace App\EventListener;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\RateLimiter\RateLimiterFactory;

#[AsEventListener(event: KernelEvents::REQUEST, priority: 20)]
final class LoginRateLimitListener
{
    public function __construct(
        private readonly RateLimiterFactory $loginAttemptLimiter,
    ) {}

    public function __invoke(RequestEvent $event): void
    {
        $request = $event->getRequest();

        if ($request->getPathInfo() !== '/auth/login' || $request->getMethod() !== 'POST') {
            return;
        }

        $limiter = $this->loginAttemptLimiter->create($request->getClientIp() ?? 'unknown');
        $limit   = $limiter->consume(1);

        if (!$limit->isAccepted()) {
            $retryAfter = $limit->getRetryAfter()->getTimestamp() - time();
            $event->setResponse(new JsonResponse(
                ['message' => 'Too many login attempts. Please try again later.'],
                Response::HTTP_TOO_MANY_REQUESTS,
                ['Retry-After' => max(1, $retryAfter)]
            ));
        }
    }
}
