<?php


namespace App\Utils;

//use \PDO;
use Doctrine\DBAL\Driver\Connection;

class DatabaseService
{
    private $connection;

    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
    }

    public function test()
    {
        $sql = "SELECT * FROM user";
        return $this->connection->query($sql)->fetchAll();
    }

    private function getConnection(): PDO
    {
        $dsn = 'sqlite:'.__DIR__ .'/../../var/runelogs.db';
        $options = [
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ
        ];
        try {
            $pdo = new \PDO($dsn, '', '', $options);
        } catch (\PDOException $e) {
            throw new \PDOException($e->getMessage(), (int)$e->getCode());
        }
        return $pdo;
    }

    private function clean(PDO $connection)
    {
        $connection = null;
    }

    public function getUsers() : array
    {
        $con = $this->getConnection();
        $sql = "SELECT * FROM user";
        $result = $con->query($sql)->fetchAll();
        $this->clean($con);
        return $result;
    }

    public function getUsersSortedByActivity() : array
    {
        $con = $this->getConnection();
        $sql = "SELECT * FROM user ORDER BY us_last_visited DESC";
        $result = $con->query($sql)->fetchAll();
        $this->clean($con);
        return $result;
    }


    public function getLogs() : array
    {
        $con = $this->getConnection();
        $sql = "SELECT * FROM log";
        $result = $con->query($sql)->fetchAll();
        $this->clean($con);
        return $result;
    }

    public function getClans() : array
    {
        $con = $this->getConnection();
        $sql = "SELECT * FROM clan";
        $result = $con->query($sql)->fetchAll();
        $this->clean($con);
        return $result;
    }

    public function getClanMembers(int $clanId) : array
    {
        $con = $this->getConnection();
        $sql = $con->prepare("SELECT us_id as id, us_name as name FROM user WHERE us_cl_id = :clanId");
        $sql->bindParam(':clanId', $clanId);
        $sql->execute();
        $result = $sql->fetchAll();
        $this->clean($con);
        return $result;
    }

    public function getClanMemberNames(int $clanId) : array
    {
        $con = $this->getConnection();
        $sql = $con->prepare("SELECT us_name as name FROM user WHERE us_cl_id = :clanId");
        $sql->bindParam(':clanId', $clanId);
        $sql->execute();
        $result = $sql->fetchAll(PDO::FETCH_COLUMN);
        $this->clean($con);
        return $result;
    }

    public function getSkills() : array
    {
        $con = $this->getConnection();
        $sql = "SELECT * FROM skill";
        $result = $con->query($sql)->fetchAll();
        return $result;
    }

    public function getCurrentLog(int $userId, int $skillId)
    {
        $dayIndex = date('Y') . date('z');
        $con = $this->getConnection();
        $sql = $con->prepare("SELECT * FROM log WHERE lg_us_id = :userId AND lg_sk_id = :skill_id AND lg_day = :day");
        $sql->bindParam(':userId', $userId);
        $sql->bindParam(':skill_id', $skillId);
        $sql->bindParam(':day', $dayIndex);
        $sql->execute();
        $result = $sql->fetch();
        $this->clean($con);
        return $result;
    }

    public function addEvents(array $eventAddList)
    {
        $con = $this->getConnection();
        $con->beginTransaction();
        $sql = $con->prepare("INSERT INTO event VALUES (null, :userId, :eventTitle, :eventDetails, :eventTimestamp)");
        foreach ($eventAddList as $event) {
            $sql->bindParam(':userId', $event->userId);
            $sql->bindParam(':eventTitle', $event->title);
            $sql->bindParam(':eventDetails', $event->details);
            $sql->bindParam(':eventTimestamp', $event->timestamp);
            $sql->execute();
        }
        $con->commit();
        $this->clean($con);
    }

    public function addLogs(array $logAddList)
    {
        $con = $this->getConnection();
        $con->beginTransaction();
        $sql = $con->prepare("INSERT INTO log VALUES (null, :userId, :skillId, :day, :value, :level)");
        foreach ($logAddList as $log) {
            $sql->bindParam(':userId', $log->userId);
            $sql->bindParam(':skillId', $log->skillId);
            $sql->bindParam(':day', $log->day);
            $sql->bindParam(':value', $log->xp);
            $sql->bindParam(':level', $log->level);
            $sql->execute();
        }
        $con->commit();
        $this->clean($con);
    }

    public function updateLogs(array $logUpdateList)
    {
        $con = $this->getConnection();
        $con->beginTransaction();
        $sql = $con->prepare("UPDATE log SET lg_value = :xp, lg_level = :level WHERE lg_id = :id");
        foreach ($logUpdateList as $log) {
            $sql->bindParam(':id', $log->id);
            $sql->bindParam(':xp', $log->xp);
            $sql->bindParam(':level', $log->level);
            $sql->execute();
        }
        $con->commit();
        $this->clean($con);
    }

    public function getLastXEventsByUserId(int $userId, int $limit)
    {
        $con = $this->getConnection();
        $sql = $con->prepare("SELECT ev_title as title, ev_details as details, ev_ts as timestamp FROM event WHERE ev_us_id = :userId ORDER BY event.ev_id DESC LIMIT :elimit");
        $sql->bindParam(':userId', $userId);
        $sql->bindParam(':elimit', $limit);
        $sql->execute();
        $result = $sql->fetchAll();
        $this->clean($con);
        return $result;
    }

    public function getLastEventByUserId(int $userId)
    {
        $con = $this->getConnection();
        $sql = $con->prepare("SELECT ev_title as title, ev_details as details, ev_ts as timestamp FROM event WHERE ev_us_id = :userId ORDER BY event.ev_id DESC LIMIT 1");
        $sql->bindParam(':userId', $userId);
        $sql->execute();
        $result = $sql->fetch();
        $this->clean($con);
        return $result;
    }

    public function findUserByName(string $userName)
    {
        $con = $this->getConnection();
        $sql = $con->prepare("SELECT * FROM user WHERE us_name = :userName");
        $sql->bindParam(':userName', $userName);
        $sql->execute();
        $result = $sql->fetch();
        $this->clean($con);
        return $result;
    }

    public function findClanByName(string $clanName)
    {
        $con = $this->getConnection();
        $sql = $con->prepare("SELECT * FROM clan WHERE cl_name = :clanName");
        $sql->bindParam(':clanName', $clanName);
        $sql->execute();
        $result = $sql->fetch();
        $this->clean($con);
        return $result;
    }

    public function addUser(string $userName, int $clanId)
    {
        $con = $this->getConnection();
        $sql = $con->prepare("INSERT INTO user VALUES (null, :clanId, :userName, 0)");
        $sql->bindParam(':clanId', $clanId);
        $sql->bindParam(':userName', $userName);
        $sql->execute();
        $this->clean($con);
    }

    public function addClan(string $clanName): int
    {
        $con = $this->getConnection();
        $sql = $con->prepare("INSERT INTO clan VALUES (null, :clanName)");
        $sql->bindParam(':clanName', $clanName);
        $sql->execute();
        $clanId = $con->lastInsertId();
        $this->clean($con);
        return $clanId;
    }

    public function updateUser(int $userId, string $userName, int $clanId)
    {
        $con = $this->getConnection();
        $sql = $con->prepare("UPDATE user SET us_cl_id = :clanId, us_name = :userName WHERE us_id = :userId");
        $sql->bindParam(':userId', $userId);
        $sql->bindParam(':userName', $userName);
        $sql->bindParam(':clanId', $clanId);
        $sql->execute();
        $this->clean($con);
    }

    public function updateUserActivity(int $userId)
    {
        $now = time();
        $con = $this->getConnection();
        $sql = $con->prepare("UPDATE user SET us_last_visited = :clanId WHERE us_id = :userId");
        $sql->bindParam(':userId', $userId);
        $sql->bindParam(':userName', $now);
        $sql->execute();
        $this->clean($con);
    }

    public function getStats() : array
    {
        $return = [];
        $con = $this->getConnection();
        $sql = "SELECT count(ev_us_id) as c FROM event;";
        $return['events'] = $con->query($sql)->fetch()->c;
        $sql = "SELECT count(lg_us_id) as c FROM log;";
        $return['logs'] = $con->query($sql)->fetch()->c;
        $sql = "SELECT count(us_id) as c FROM user;";
        $return['users'] = $con->query($sql)->fetch()->c;
        $sql = "SELECT count(cl_id) as c  FROM clan;";
        $return['clans'] = $con->query($sql)->fetch()->c;
        $this->clean($con);
        return $return;
    }

    function search(int $userId, string $searchTerm) : array
{
    $con = $this->getConnection();
    $searchTerm = '%'.$searchTerm.'%'; //prep the search query here cus sqlite doesnt like it when u do this inline
    $sql = $con->prepare("SELECT * FROM event WHERE ev_us_id = :userId AND (ev_title LIKE :searchTerm OR ev_details LIKE :searchTerm) ORDER BY ev_ts DESC");
    $sql->bindParam(':userId', $userId);
    $sql->bindParam(':searchTerm', $searchTerm);
    $sql->execute();
    $result = $sql->fetchAll();
    $this->clean($con);
    return $result;
}

    private function generateUniqueDayIndex(int $timestamp): int
    {
        return date('Y', $timestamp) . date('z', $timestamp);
    }

    public function getUserLogsByDay(int $userId, int $date): array
    {
        $datekey = $this->generateUniqueDayIndex($date);
        $con = $this->getConnection();
        $sql = $con->prepare("SELECT * FROM log WHERE lg_us_id = :userId AND lg_day = :day");
        $sql->bindParam(':userId', $userId);
        $sql->bindParam(':day', $datekey);
        $sql->execute();
        $result = $sql->fetchAll();
        $this->clean($con);
        return $result;
    }

    public function getUserEventsBetweenTimeframe(int $userId, int $start, int $end) : array
    {
        $con = $this->getConnection();
        $sql = $con->prepare("SELECT * FROM event WHERE ev_us_id = :userId AND (ev_ts >= :start AND ev_ts <= :end)");
        $sql->bindParam(':userId', $userId);
        $sql->bindParam(':start', $start);
        $sql->bindParam(':end', $end);
        $sql->execute();
        $result = $sql->fetchAll();
        $this->clean($con);
        return $result;
    }

    public function getUserEventsByDay(int $userId, int $date) : array
    {
        $start = strtotime("midnight", $date);
        $end = strtotime("tomorrow", $start) - 1;
        return $this->getUserEventsBetweenTimeframe($userId, $start, $end);
    }

    public function getUserEventsByYear(int $userId, int $year) : array
    {
        $start = strtotime('first day of january '.$year);
        $end = strtotime('last day of december '.$year);
        return $this->getUserEventsBetweenTimeframe($userId, $start, $end);
    }

    public function getUserLogsByYear(int $userId, int $year): array
    {
        $start = $year.'0';
        $end = $year.'365';
        $con = $this->getConnection();
        $sql = $con->prepare("SELECT * FROM log WHERE lg_us_id = :userId AND (lg_day >= :start AND lg_day <= :end)");
        $sql->bindParam(':userId', $userId);
        $sql->bindParam(':start', $start);
        $sql->bindParam(':end', $end);
        $sql->execute();
        $result = $sql->fetchAll();
        $this->clean($con);
        return $result;
    }

    public function getYearlyData(int $userId, int $year): array
    {
        $logs = $this->getUserLogsByYear($userId, $year);
        $events = $this->getUserEventsByYear($userId, $year);

        $groupedLogs = $this->groupLogsByDate($logs);
        $groupedLogsWithDifference = $this->calculateDailyDifference($groupedLogs);

        $groupedEvents = $this->groupEventsByDate($events);

        $output['logs'] = $groupedLogsWithDifference;
        $output['events'] = $groupedEvents;

        return $output;
    }

    private function groupLogsByDate(array $logs): array
    {
        $groupedLogs = [];
        foreach ($logs as &$log) {
            $log->lg_value = floatval($log->lg_value / 10);
            $groupedLogs[$log->lg_day][] = (array)$log;
        }
        ksort($groupedLogs);
        return $groupedLogs;
    }

    private function groupEventsByDate(array $events): array
    {
        $groupedEvents = [];
        foreach ($events as $event) {
            $eventDayIndex = $this->generateUniqueDayIndex($event->ev_ts);
            $groupedEvents[$eventDayIndex][] = (array)$event;
        }
        ksort($groupedEvents);
        return $groupedEvents;
    }

    private function calculateDailyDifference(array $logsPerDay): array
    {
        foreach ($logsPerDay as $dayIndex => &$logsOnThatDay) {
            $previousDayIndex = $dayIndex - 1;
            $totalsArray = $this->createTotalsArray();
            foreach ($logsOnThatDay as $skillIndex => &$log) {
                if (isset($logsPerDay[$previousDayIndex]) && $logsPerDay[$previousDayIndex] !== null) {
                    $log['difference'] = $log['lg_value'] - $logsPerDay[$previousDayIndex][$skillIndex]['lg_value'];
                } else {
                    $log['difference'] = 0;
                }
                $totalsArray['lg_level'] += $log['lg_level'];
                $totalsArray['lg_value'] += $log['lg_value'];
                $totalsArray['difference'] += $log['difference'];
            }
            $logsOnThatDay[27] = $totalsArray;
        }
        return $logsPerDay;
    }

    private function createTotalsArray(): array
    {
        $totals = [];
        $totals['lg_level'] = 0;
        $totals['lg_value'] = 0;
        $totals['difference'] = 0;
        return $totals;
    }
}