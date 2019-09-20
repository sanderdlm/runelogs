<?php

namespace App\Utils;

use Predis\Client;

class RedisService
{
    private $redis = null;

    /**
     * @var DataInterface
     */
    private $dataInterface;

    public function __construct(DataInterface $dataInterface)
    {
        $this->dataInterface = $dataInterface;
        $this->redis = new Client();
    }

    public function checkRedisForGridData(int $userId, int $year): array
    {
        if ($this->redis->hExists($userId, "logs") && $this->redis->hExists($userId, "events")) {
            $yearlyData['logs'] = json_decode($this->redis->hget($userId, "logs"), true);
            $yearlyData['events'] = json_decode($this->redis->hget($userId, "events"), true);
            return $yearlyData;
        }

        $yearlyData = $this->dataInterface->getYearlyData($userId, $year);

        $this->redis->hset($userId, "logs", json_encode($yearlyData['logs']));
        $this->redis->hset($userId, "events", json_encode($yearlyData['events']));
        $this->redis->expire($userId, 3600);

        return $yearlyData;
    }

    public function getDataFromRedis(int $userId, int $year, int $startDay, int $endDay = null): array
    {
        if ($endDay === null) {
            $endDay = $startDay;
        }

        $logs = json_decode($this->redis->hget($userId, "logs"), true);
        $events = json_decode($this->redis->hget($userId, "events"), true);

        $output['logs'] = null;
        $output['events'] = [];
        while ($endDay >= $startDay) {
            $key = $year.$endDay;

            if (isset($logs[$key])) {
                if ($output['logs'] === null) {
                    $output['logs'] = $logs[$key];
                } else {
                    foreach ($logs[$key] as $skillIndex => $skill) {
                        $output['logs'][$skillIndex]['difference'] += $logs[$key][$skillIndex]['difference'];
                    }
                }
            }
            if (isset($events[$key])) {
                $output['events'] = array_merge($output['events'], $events[$key]);
            }
            $endDay--;
        }
        return $output;
    }

    public function getLastEventHashFromRedis(int $userId): ?string
    {
        if ($this->redis->hExists($userId, "lastEvent")) {
            return $this->redis->hget($userId, "lastEvent");
        }
        return null;
    }

    public function updateLastEvent(int $userId, string $lastEventHash): void
    {
        $this->redis->hset($userId, "lastEvent", $lastEventHash);
    }
}
