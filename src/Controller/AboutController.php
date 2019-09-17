<?php


namespace App\Controller;

use App\Utils\DatabaseService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class AboutController extends AbstractController
{
    public function __construct(DatabaseService $databaseService)
    {
        $this->databaseService = $databaseService;
    }

    /**
     * @Route("/about", methods={"GET"})
     */
    public function about()
    {
        return $this->render('about.html.twig');
    }

    /**
     * @Route("/privacy", methods={"GET"})
     */
    public function privacy()
    {
        return $this->render('privacy.html.twig');
    }
}