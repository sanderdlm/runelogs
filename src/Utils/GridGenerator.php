<?php


namespace App\Utils;

class GridGenerator
{
    private $redisService;
    
    private $fillArray = array(
        500 => "sweat",
        250 => "high",
        50 => "medium",
        1 => "low",
        0 => "nothing"
    );

    public function __construct(RedisService $redisService)
    {
        $this->redisService = $redisService;
    }

    /**
     * @param int $userId
     * @param int $year
     * @return string|null
     */
    public function generate(int $userId, int $year): ?string
    {
        $rawData = $this->redisService->checkRedisForGridData($userId, $year);
        $formattedData = $this->countData($rawData, $year);
        $gridSquareSize = 16;
        $gridSquareMargin = 2;
        $gridIncrement = $gridSquareSize + $gridSquareMargin;
        $weekIncrement = 0;
        $yPos = 0;
        $xPos = 0;

        $grid = '<svg width="960" height="126" class=""><g><g transform="translate(0,0)">';

        foreach ($formattedData as $dayKey => $day) {
            $total = $day['logs'] + $day['events'];
            $date = \DateTime::createFromFormat('z Y', strval($dayKey) . ' ' . strval($year));
            $displayDate = $date->format('Y/m/d');
            $fill = $this->getFillValue($total);
            if (intval(date('z')) === $dayKey) {
                $fill .= ' today';
            } 
            $grid .= "<rect "
                    . "class='day ".$fill."'"
                    . "width='".$gridSquareSize."'"
                    . "height='".$gridSquareSize."'"
                    . "x='".$xPos."'"
                    . "y='".$yPos."'"
                    . "fill='#ebedf0'"
                    . "data-index='".$dayKey."'"
                    . "data-count='".$day['events']."'"
                    . "data-date='".$displayDate."'>"
                    . "<title>".$day['events']." log(s) and ".$day['logs']."k xp on ".$displayDate."</title>"
                    . "</rect>";
            $yPos += $gridIncrement;

            if (($dayKey+1) % 7 === 0) {
                $weekIncrement += $gridIncrement;
                $grid .= '</g><g transform="translate('.$weekIncrement.', 0)">';
                $yPos = 0;
            }
        }

        //close the grid
        $grid .= '</g>';

        //close it up
        $grid .=  '</g></svg>';

        //and wrap it
        return $grid;
    }

    private function getFillValue(int $count): string
    {
        foreach ($this->fillArray as $threshold => $sweatLevel) {
            if ($count >= $threshold) {
                return $sweatLevel;
            }
        }
    }

    private function countData(array $data, int $year)
    {
        $output = [];
        for ($i=0; $i < 365; $i++) {
            $key = $year.$i;
            $logCount = 0;
            $eventCount = 0;
            if (isset($data['logs'][$key])) {
                $logCount = round($data['logs'][$year.$i][27]['difference'] / 10000);
            }
            if (isset($data['events'][$key])) {
                $eventCount = count($data['events'][$year.$i]);
            }
            $output[$i]['logs'] = $logCount;
            $output[$i]['events'] = $eventCount;
        }

        return $output;
    }
}