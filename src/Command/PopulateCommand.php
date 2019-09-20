<?php


namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use App\Utils\ApiService;
use App\Utils\DatabaseService;

class PopulateCommand extends Command
{
    /**
     * @var string
     */
    private $path;

    private $apiService;

    private $databaseService;

    protected static $defaultName = 'app:populate';

    public function __construct(ApiService $apiService, DatabaseService $databaseService, string $path)
    {
        $this->apiService = $apiService;
        $this->databaseService = $databaseService;
        $this->path = $path;

        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $clanNames = file($this->path.'/var/clans.txt');
        echo "[";
        foreach ($clanNames as $clanIndex => &$clanName) {
            echo $clanIndex;
            $clanName = str_replace(' ', '+', strtolower(trim($clanName)));
            $clanObject = $this->databaseService->findClanByName($clanName);
            if (!$clanObject) {
                $clanId = $this->databaseService->addClan($clanName);
            } else {
                $clanId = $clanObject->id;
            }
            $clanMemberList = $this->apiService->getClanList($clanName);

            if ($clanMemberList == null) {
                continue; //move next
            }

            foreach ($clanMemberList as &$clanMember) {

                $userObject = $this->databaseService->findUserByName($clanMember);

                if (!$userObject) {
                    $this->databaseService->addUser($clanMember, $clanId);
                    continue;
                }

                if ($userObject->us_cl_id != $clanId) {
                    $this->databaseService->updateUser($userObject->id, $clanId);
                }
            }
            echo '+';
        }
        echo "]";
    }
}
