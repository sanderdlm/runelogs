<?php


namespace App\Utils;

class DataInterface
{
    /**
     * @var DatabaseService
     */
    private $databaseService;

    public function __construct(DatabaseService $databaseService)
    {
        $this->databaseService = $databaseService;
    }

    public function getYearlyData(int $userId, int $year): array
    {
        $logs = $this->databaseService->getUserLogsByYear($userId, $year);
        $events = $this->databaseService->getUserEventsByYear($userId, $year);

        $groupedLogs = $this->databaseService->groupLogsByDate($logs);
        $groupedLogsWithDifference = $this->databaseService->calculateDailyDifference($groupedLogs);

        $groupedEvents = $this->databaseService->groupEventsByDate($events);

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
            $eventDayIndex = $this->databaseService->generateUniqueDayIndex($event->ev_ts);
            $groupedEvents[$eventDayIndex][] = (array)$event;
        }
        ksort($groupedEvents);
        return $groupedEvents;
    }

    private function calculateDailyDifference(array $logsPerDay): array
    {
        foreach ($logsPerDay as $dayIndex => &$logsOnThatDay) {
            $previousDayIndex = $dayIndex - 1;
            $totalsArray = $this->databaseService->createTotalsArray();
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

    private function generateUniqueDayIndex(int $timestamp): int
    {
        return date('Y', $timestamp) . date('z', $timestamp);
    }
}