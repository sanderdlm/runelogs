<?php


namespace App\Utils;

use Predis;

class UpdateService
{
    /** @var ApiService */
    private $api;

    /** @var DatabaseService */
    private $db;

    /** @var Predis\Client */
    private $redis;

    /** @var float */
    private $timer;

    /** @var int */
    private $chunkSize;

    /** @var array */
    private $eventFilterArray = [
        'triskelion',
        'effigy',
        'battle',
        'whip',
        'dark',
        'Forcae',
        'dragon',
        'trail'
    ];

    public function __construct()
    {
        $this->api = new ApiService();
        $this->db = new DatabaseService();
        $this->redis = new RedisService();
        $this->chunkSize = 25;
    }

    public function update()
    {
    	$clans = $this->db->getClans();

    	foreach ($clans as $clan) {
    		$this->rosterUpdate($clan);
        }

        foreach ($clans as $clan) {
            echo "#" . $clan->cl_name . "[";
    		$clanList = $this->db->getClanMembers($clan->cl_id);
    		
    		$chunkedClanList = array_chunk($clanList, $this->chunkSize);
    		foreach ($chunkedClanList as $chunkIndex => $chunk) {

	            echo "(";
	            $this->startTimer();
	            $playerProfiles = $this->api->getBulkProfiles($chunk, $this->chunkSize);
	            echo $this->stopTimer() . "s)";
	            $this->startTimer();
	            $logAddList = [];
	            $logUpdateList = [];
	            $eventAddList = [];

	            foreach ($playerProfiles as $profile) {

	                $playerEventList = [];

	                if (isset($profile->error) || empty($profile->activities)) {
	                    continue; // Move on to the next player profile
	                }

	                $lastLocalEventHash = $this->getLastLocalEventHash($profile->userId);

	                foreach ($profile->activities as $activity) {

	                    if ($this->isEventFiltered($activity->text)) {
	                        continue; // Move on to the next event
	                    }
	                    $newEvent = (object)[
	                        "title" => $activity->text,
	                        "details" => $this->truncate($activity->details),
	                        "timestamp" => strtotime($activity->date),
	                        "userId" => $profile->userId
	                    ];

	                    if ($lastLocalEventHash !== null && $lastLocalEventHash === $this->hashEvent($newEvent)) {
	                        break; // When we find a match, move on to logs
	                    }

	                    $playerEventList[] = $newEvent;
	                }

	                $skillList = $this->db->getSkills();

	                foreach ($profile->skills as $skillValue) {

	                    $localSkillObject = $skillList[$skillValue->id];

	                    $currentLog = $this->db->getCurrentLog($profile->userId, $localSkillObject->sk_id);

	                    if ($currentLog) {
	                        if($currentLog->lg_value == intval($skillValue->xp)){
	                            continue;
	                        }
	                        $log = (object)[
	                            "id" => $currentLog->lg_id,
	                            "xp" => intval($skillValue->xp),
	                            "level" => intval($skillValue->level)
	                        ];
	                        $logUpdateList[] = $log;
	                        continue;
	                    }

	                    $newLog = (object)[
	                        "day" => date('Y') . date('z'),
	                        "xp" => intval($skillValue->xp),
	                        "level" => intval($skillValue->level),
	                        "userId" => $profile->userId,
	                        "skillId" => $localSkillObject->sk_id
	                    ];

	                    $logAddList[] = $newLog;
	                }

	                if(isset($playerEventList[0])) { // Make sure Redis has the last possible event
	                    $this->redis->updateLastEvent($profile->userId, $this->hashEvent($playerEventList[0]));
	                }

	                echo "=";
	                // Reverse the player's events because Jagex delivers them newest-first and we want to store them newest-last
	                $eventAddList = array_merge($eventAddList, array_reverse($playerEventList));
	            }
	            $totalCount = count($eventAddList) + count($logAddList) + count($logUpdateList);
	            echo "] (" . $this->stopTimer() . "s) -> ".$totalCount." queries (";
	            $this->startTimer();

	            $this->db->addEvents($eventAddList);

	            $this->db->addLogs($logAddList);

	            $this->db->updateLogs($logUpdateList);

	            echo $this->stopTimer() . "s) \r\n";
	        }
	        echo "] \r\n";
    	}
    }

    private function matchUsers(object $clan, array $list)
    {
        $leftoverProfiles = $this->api->getBulkProfiles($list['leftovers'], 25);
        $newbieProfiles = $this->api->getBulkActivitiesByName($list['newbies']);

        foreach ($leftoverProfiles as $profile) {

            if (isset($profile->error) && $profile->error == 'NO_PROFILE') {
                $leftoverEvents = $this->db->getLastXEventsByUserId($profile->userId, 100);
                $leftoverEventsHashed = $this->hashArrayOfEvents($leftoverEvents);

                foreach ($list['newbies'] as $newbieKey => $newbie) {
                    if (isset($newbieProfiles[$newbieKey]->error)) {
                        continue; //fuck em
                    }
                    $newbieEventsHashed = $this->hashArrayOfEvents($newbieProfiles[$newbieKey]->activities);

                    if (count(array_intersect($leftoverEventsHashed, $newbieEventsHashed)) > 5) {
                        echo 'name changed: '.$profile->userName.' to: '.$newbie."\r\n";
                        $this->db->updateUser($profile->userId, $newbie, $clan->cl_id);
                        unset($newbie);
                        break;
                    }
                }
            }

            //if the loop gets to this point, that means this leftover user is no longer in the
            //clan list we just pulled from jagex, but his runemetrics is set to public so we can
            //query his details end-point and 99% of the time get his new clan (or none)

            $leftoverClan = $this->api->getClanFromPlayerName($profile->userName);

            if ($leftoverClan === null) {
                echo 'public RM but no clan in details. probably clanless rn: '.$profile->userName;
                $this->db->updateUser($profile->userId, $profile->userName, 0);
                continue;
            }

            $leftoverClanLocalCheck = $this->db->findClanByName($leftoverClan);

            if ($leftoverClanLocalCheck) {
                echo 'has a new clan and we have it in our db, update his clan ID ('.$leftoverClanLocalCheck->cl_id.') for user '.$profile->userName;
                $this->db->updateUser($profile->userId, $profile->userName, $leftoverClanLocalCheck->cl_id);
                continue;
            }

            $leftOverNewClanId = $this->db->addClan($leftoverClan); //add it
            echo 'user has a new clan ('.$leftoverClan.') which wasnt in our db so far so weve added it. user:'.$profile->userName;
            $this->db->updateUser($profile->userId, $profile->userName, $leftOverNewClanId);

            echo "\r\n\ ";
        }

        return $list['newbies'];
    }

    private function addNewbies(array $unmatchedNewbies, object $clan)
    {
    	foreach ($unmatchedNewbies as $newbie) {
            $newbieFromDb = $this->db->findUserByName($newbie);
            if (!$newbieFromDb) {
                // Add new user
                echo 'added new user '.$newbie;
                $this->db->addUser($newbie, $clan->cl_id);
            } else {
                // Change clans
                echo 'changed clans for user '.$newbie.'. set to '.$clan->cl_id;
                $this->db->updateUser($newbieFromDb->us_id, $newbieFromDb->us_name, $clan->cl_id);
            }
        }
    }

    private function rosterUpdate(object $clan)
    {
        $currentClanMembers = $this->db->getClanMembers($clan->cl_id);
        $newClanMembers = $this->api->getClanList($clan->cl_name);

        if ($newClanMembers !== null) {
            $lists = $this->compareClanLists($currentClanMembers, $newClanMembers);
            $unmatchedNewbies = $this->matchUsers($clan, $lists);
            $this->addNewbies($unmatchedNewbies, $clan);
        }
    }

    private function compareClanLists(array $oldList, array $jagexList)
    {
        $output = [
            'leftovers' => [],
            'newbies' => []
        ];
        foreach ($oldList as $clanMember) {
            $check = array_search($clanMember->name, $jagexList);
            if ($check !== false) {
                unset($jagexList[$check]);
                continue;
            }
            $output['leftovers'][] = $clanMember;
        }
        $output['newbies'] = array_values($jagexList);
        return $output;
    }

    private function isEventFiltered(string $eventBodyText): bool
    {
        return array_intersect($this->eventFilterArray, explode(' ', strtolower($eventBodyText))) ? true : false;
    }

    private function hashEvent(object $event): string
    {
        return hash('sha256', $event->title . $event->details . $event->timestamp);
    }

    private function hashArrayOfEvents(array $events): array
    {
    	$eventsHashed = [];
    	foreach ($events as $event) {
    		$eventsHashed[] = hash('sha256', $event->title . $event->details . $event->timestamp);
    	}
        return $eventsHashed;
    }

    private function getLastLocalEventHash(int $userId)
    {
        $lastEventHash = $this->redis->getLastEventHashFromRedis($userId);
        if ($lastEventHash !== null){
            return $lastEventHash;
        }
        $lastEventFromDB = $this->db->getLastEventByUserId($userId);
        if(!$lastEventFromDB){
            return null;
        }
        return $this->hashEvent($lastEventFromDB );
    }

    private function truncate(string $stringToTruncate): string
    {
        $string = trim($stringToTruncate);
        if (strlen($string) > 255) {
            $string = substr($string, 0, 255);
        }
        return $string;
    }

    private function startTimer()
    {
        $this->timer = microtime(true);
    }

    private function stopTimer(): float
    {
        return round(microtime(true) - $this->timer, 2);
    }
}