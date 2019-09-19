<?php


namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use App\Utils\ApiService;

class IndexController extends AbstractController
{
    private $apiService;
    
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
            $username = $request->request->get('username');
            return $this->redirectToRoute('profile', ['username' => $this->apiService->norm($username)]);
        }
        return $this->render('home/home.html.twig');
    }
}