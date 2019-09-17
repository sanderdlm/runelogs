<?php


namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use App\Utils\RedisService;

class ApiController extends AbstractController
{
	private $redisService;
	
    public function __construct(RedisService $redisService)
    {
        $this->redisService = $redisService;
    }

    /**
     * @Route("/api/getData", methods={"POST"})
     */
    public function index(Request $request)
    {
    	$params = $request->getContent();
    	$p = json_decode($params);

	    $output = $this->redisService->getDataFromRedis($p->userId, $p->year, $p->startDay, $p->endDay);
	    return new JsonResponse($output);
    }
}