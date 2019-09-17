<?php


namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use App\Utils\ApiService;
use App\Utils\DatabaseService;

class PopulateCommand extends Command
{
    protected static $defaultName = 'app:populate';

    public function __construct(ApiService $apiService, DatabaseService $databaseService)
    {
        $this->apiService = $apiService;
        $this->databaseService = $databaseService;

        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
		$clanNames = file('%kernel.project_dir%/var/clans.txt');
		echo "[";
		foreach ($clanNames as $clanIndex => &$clanName) {
			echo $clanIndex;
			$clanName = str_replace(' ', '+', strtolower(trim($clanName)));
			$clanObject = $db->findClanByName($clanName);
			if(!$clanObject){
				$clanId = $db->addClan($clanName);
			} else {
				$clanId = $clanObject->cl_id;
			}

			$clanMemberList = $api->getClanList($clanName);

			if($clanMemberList == null){
				continue; //move next
			}

			foreach ($clanMemberList as &$clanMember) {

				$userObject = $db->findUserByName($clanMember);

				if(!$userObject){
			        $db->addUser($clanMember, $clanId);
			        continue;
				}

				if($userObject->us_cl_id != $clanId){
					$db->updateUser($userObject->us_id, $clanId);
				}
			}
			echo '+';
		}
		echo "]";
    }
}