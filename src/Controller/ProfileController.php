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
    private $apiService;

    private $databaseService;

    private $gridGenerator;

    private $redisService;

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
        $year = 2019;
        $today = date('z');

        if ($username !== null) {

            $cleanUsername = $this->apiService->norm($username);
            $user = $this->databaseService->findUserByName($cleanUsername);

            if ($user) {
                $this->databaseService->updateUserActivity($user->id);
                $grid = $this->gridGenerator->generate($user->id, $year);
                $profile = $this->redisService->getDataFromRedis($user->id, $year, $today);
            } else {
                $this->databaseService->addUser($cleanUsername, null);
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
                $results = $this->databaseService->search($user->id, $searchTerm);
            }
        }

        return $this->render('profile.html.twig',[
            'user' => $user,
            'results' => $results
        ]);
    }

    /**
     * @Route("/test", methods={"GET"})
     */
    public function test()
    {
        //$users = $this->databaseService->test();
        $details = $this->apiService->getDetails('isobho');
        dump($details);
    }
}