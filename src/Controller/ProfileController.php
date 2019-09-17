<?php


namespace App\Controller;

use App\Utils\DatabaseService;
use App\Utils\GridGenerator;
use App\Utils\RedisService;
use App\Utils\ApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ProfileController extends AbstractController
{
    public function __construct(
        ApiService $apiService,
        DatabaseService $databaseService,
        GridGenerator $gridGenerator,
        RedisService $redisService
    ) {
        $this->apiService = $apiService;
        $this->databaseService = $databaseService;
        $this->gridGenerator = $gridGenerator;
        $this->redisService = $redisService;
    }

    /**
     * @Route("/profile/{username}", methods={"GET", "POST"}, name="profile")
     * @param string|null $username
     * @return Response
     */
    public function index(string $username): Response
    {
        if ($username !== null) {

            $cleanUsername = $this->apiService->norm($username);
            $user = $this->databaseService->findUserByName($cleanUsername);

            if ($user) {
                $year = 2019;
                $grid = $this->gridGenerator->generate($user->us_id, $year);
                $today = date('z');
                $profile = $this->redisService->getDataFromRedis($user->us_id, $year, $today);
            } else {
                $this->databaseService->addUser($cleanUsername, 0);
            }

        } else {
            $user = null;
        }

        return $this->render('profile.html.twig',[
            'user' => $user,
            'year' => $year,
            'grid' => $grid,
            'profile' => $profile
        ]);
    }

    /**
     * @Route("/profile/{username}", methods={"POST"})
     */
    public function search(Request $request, ?string $username): Response
    {
        if ($username === null) {
            $user = null;
        }

        $cleanUsername = $this->apiService->norm($username);
        $user = $this->databaseService->findUserByName($cleanUsername);

        if ($user) {
            $searchTerm = $request->request->get('search');
            if ($searchTerm !== null) { //search
                $results = $this->databaseService->search($user->us_id, $searchTerm);
            }
        }

        return $this->render('profile.html.twig',[
            'user' => $user,
            'results' => $results
        ]);
    }
}