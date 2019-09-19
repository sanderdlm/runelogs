<?php


namespace App\Utils;

use Doctrine\DBAL\Driver\Connection;
use Doctrine\DBAL\FetchMode;

class DatabaseService
{
    private $connection;

    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
        $this->connection->setFetchMode(FetchMode::STANDARD_OBJECT);
    }

    public function getUsers() : array
    {
        $sql = "SELECT * FROM user";
        return $this->connection->query($sql)->fetchAll();
    }

    public function getUsersSortedByActivity() : array
    {
        $sql = "SELECT * FROM user ORDER BY last_visited DESC";
        return $this->connection->query($sql)->fetchAll();
    }

    public function getLogs() : array
    {
        $sql = "SELECT * FROM log";
        return $this->connection->query($sql)->fetchAll();
    }

    public function getClans() : array
    {
        $sql = "SELECT * FROM clan";
        return $this->connection->query($sql)->fetchAll();
    }

    public function getSkills() : array
    {
        $sql = "SELECT * FROM skill";
        return $this->connection->query($sql)->fetchAll();
    }

    public function getClanMembers(int $clanId) : array
    {
        $sql = $this->connection->prepare("SELECT * FROM user WHERE clan_id = :clanId");
        $sql->bindParam(':clanId', $clanId);
        $sql->execute();
        return $sql->fetchAll();
    }

    public function getCurrentLog(int $userId, int $skillId)
    {
        $dayIndex = date('Y') . date('z');
        $sql = $this->connection->prepare("SELECT * FROM log WHERE user_id = :userId AND skill_id = :skill_id AND day = :day");
        $sql->bindParam(':userId', $userId);
        $sql->bindParam(':skill_id', $skillId);
        $sql->bindParam(':day', $dayIndex);
        $sql->execute();
        return $sql->fetch();
    }

    public function addEvents(array $eventAddList)
    {
        $this->connection->beginTransaction();
        $sql = $this->connection->prepare("INSERT INTO event VALUES (null, :userId, :eventTitle, :eventDetails, :eventTimestamp)");
        foreach ($eventAddList as $event) {
            $sql->bindParam(':userId', $event->userId);
            $sql->bindParam(':eventTitle', $event->title);
            $sql->bindParam(':eventDetails', $event->details);
            $sql->bindParam(':eventTimestamp', $event->timestamp);
            $sql->execute();
        }
        $this->connection->commit();
    }

    public function addLogs(array $logAddList)
    {
        $this->connection->beginTransaction();
        $sql = $this->connection->prepare("INSERT INTO log VALUES (null, :userId, :skillId, :day, :value, :level)");
        foreach ($logAddList as $log) {
            $sql->bindParam(':userId', $log->userId);
            $sql->bindParam(':skillId', $log->skillId);
            $sql->bindParam(':day', $log->day);
            $sql->bindParam(':value', $log->xp);
            $sql->bindParam(':level', $log->level);
            $sql->execute();
        }
        $this->connection->commit();
    }

    public function updateLogs(array $logUpdateList)
    {
        $this->connection->beginTransaction();
        $sql = $this->connection->prepare("UPDATE log SET value = :xp, level = :level WHERE id = :id");
        foreach ($logUpdateList as $log) {
            $sql->bindParam(':id', $log->id);
            $sql->bindParam(':xp', $log->xp);
            $sql->bindParam(':level', $log->level);
            $sql->execute();
        }
        $this->connection->commit();
    }

    public function getLastXEventsByUserId(int $userId, int $limit)
    {
        $sql = $this->connection->prepare("SELECT * FROM event WHERE user_id = :userId ORDER BY event.id DESC LIMIT :elimit");
        $sql->bindParam(':userId', $userId);
        $sql->bindParam(':elimit', $limit);
        $sql->execute();
        return $sql->fetchAll();
    }

    public function getLastEventByUserId(int $userId)
    {
        $sql = $this->connection->prepare("SELECT * FROM event WHERE user_id = :userId ORDER BY event.id DESC LIMIT 1");
        $sql->bindParam(':userId', $userId);
        $sql->execute();
        return $sql->fetch();
    }

    public function findUserByName(string $userName)
    {
        $sql = $this->connection->prepare("SELECT * FROM user WHERE name = :userName");
        $sql->bindParam(':userName', $userName);
        $sql->execute();
        return $sql->fetch();
    }

    public function findClanByName(string $clanName)
    {
        $sql = $this->connection->prepare("SELECT * FROM clan WHERE name = :clanName");
        $sql->bindParam(':clanName', $clanName);
        $sql->execute();
        return $sql->fetch();
    }

    public function addUser(string $userName, int $clanId)
    {
        $sql = $this->connection->prepare("INSERT INTO user VALUES (null, :clanId, :userName, 0)");
        $sql->bindParam(':clanId', $clanId);
        $sql->bindParam(':userName', $userName);
        $sql->execute();
    }

    public function addClan(string $clanName): int
    {
        $sql = $this->connection->prepare("INSERT INTO clan VALUES (null, :clanName)");
        $sql->bindParam(':clanName', $clanName);
        $sql->execute();
        return $this->connection->lastInsertId();
    }

    public function updateUser(int $userId, string $userName, int $clanId)
    {
        $sql = $this->connection->prepare("UPDATE user SET clan_id = :clanId, name = :userName WHERE id = :userId");
        $sql->bindParam(':userId', $userId);
        $sql->bindParam(':userName', $userName);
        $sql->bindParam(':clanId', $clanId);
        $sql->execute();
    }

    public function updateUserActivity(int $userId)
    {
        $now = time();
        $sql = $this->connection->prepare("UPDATE user SET last_visited = :clanId WHERE id = :userId");
        $sql->bindParam(':userId', $userId);
        $sql->bindParam(':userName', $now);
        $sql->execute();
    }

    function search(int $userId, string $searchTerm) : array
    {
        $searchTerm = '%'.$searchTerm.'%'; //prep the search query here cus sqlite doesnt like it when u do this inline
        $sql = $this->connection->prepare("SELECT * FROM event WHERE user_id = :userId AND (title LIKE :searchTerm OR details LIKE :searchTerm) ORDER BY timestamp DESC");
        $sql->bindParam(':userId', $userId);
        $sql->bindParam(':searchTerm', $searchTerm);
        $sql->execute();
        return $sql->fetchAll();
    }

    public function getUserLogsByDay(int $userId, int $day): array
    {
        $sql = $this->connection->prepare("SELECT * FROM log WHERE user_id = :userId AND day = :day");
        $sql->bindParam(':userId', $userId);
        $sql->bindParam(':day', $day);
        $sql->execute();
        return $sql->fetchAll();
    }

    public function getUserEventsBetweenTimeframe(int $userId, int $start, int $end) : array
    {
        $sql = $this->connection->prepare("SELECT * FROM event WHERE user_id = :userId AND (timestamp >= :start AND timestamp <= :end)");
        $sql->bindParam(':userId', $userId);
        $sql->bindParam(':start', $start);
        $sql->bindParam(':end', $end);
        $sql->execute();
        return $sql->fetchAll();
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
        $sql = $this->connection->prepare("SELECT * FROM log WHERE user_id = :userId AND (day >= :start AND day <= :end)");
        $sql->bindParam(':userId', $userId);
        $sql->bindParam(':start', $start);
        $sql->bindParam(':end', $end);
        $sql->execute();
        return $sql->fetchAll();
    }
}