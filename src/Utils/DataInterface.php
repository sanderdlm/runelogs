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
            $log->value = floatval($log->value / 10);
            $groupedLogs[$log->day][] = (array)$log;
        }
        ksort($groupedLogs);
        return $groupedLogs;
    }

    private function groupEventsByDate(array $events): array
    {
        $groupedEvents = [];
        foreach ($events as $event) {
            $eventDayIndex = $this->generateUniqueDayIndex($event->timestamp);
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
                    $log['difference'] = $log['value'] - $logsPerDay[$previousDayIndex][$skillIndex]['value'];
                } else {
                    $log['difference'] = 0;
                }
                $totalsArray['level'] += $log['level'];
                $totalsArray['value'] += $log['value'];
                $totalsArray['difference'] += $log['difference'];
            }
            $logsOnThatDay[27] = $totalsArray;
        }
        return $logsPerDay;
    }

    private function createTotalsArray(): array
    {
        $totals = [];
        $totals['level'] = 0;
        $totals['value'] = 0;
        $totals['difference'] = 0;
        return $totals;
    }

    private function generateUniqueDayIndex(int $timestamp): int
    {
        return date('Y', $timestamp) . date('z', $timestamp);
    }
}