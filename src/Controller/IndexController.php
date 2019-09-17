<?php


namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use App\Utils\ApiService;

class IndexController extends AbstractController
{
    public function __construct(ApiService $apiService)
    {
        $this->apiService = $apiService;
    }

    /**
     * @Route("/", methods={"GET", "POST"})
     */
    public function index(Request $request)
    {
        if ($request->getMethod() === 'POST') {
            $userName = $request->request->get('userName');
            return $this->redirectToRoute('/profile/'.$this->apiService->norm($userName));
        }
        return $this->render('home.html.twig');
    }
}