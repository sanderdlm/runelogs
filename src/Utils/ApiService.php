<?php

namespace App\Utils;

use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Client;
use GuzzleHttp\Pool;

class ApiService
{
    private $client = null;

    private $baseLegacyUrl = 'http://services.runescape.com/';

    private $baseRunemetricsUrl = 'https://apps.runescape.com/runemetrics/';

    public function __construct()
    {
        $this->client =  new Client([
            'http_errors' => false,
            'verify' => false
        ]);
    }

    public function getJson(string $url, $trimCallback = false)
    {
        try {
            $response = $this->client->request('GET', $url);

            if ($response->getStatusCode() == 200) {
                $body = $response->getBody()->getContents();

                if ($trimCallback == true) {
                    $body = $this->trimCallback($body);
                }

                $content = json_decode($body);

                if (isset($content->error)) {
                    return (object)["error" => $content->error];
                } else {
                    return $content;
                }
            } else {
                return null;
            }
        } catch (RequestException $e) {
            //  To do: log the Exception thrown
        }
    }

    public function getProfile(string $playerName): ?object
    {
        return $this->getJson(
            $this->baseRunemetricsUrl
            .'profile/profile?user='
            .$this->norm($playerName)
            .'&activities=20'
        );
    }

    public function getDetails(string $playerName): ?object
    {
        return $this->getJson(
            $this->baseLegacyUrl
            .'m=website-data/playerDetails.ws?membership=true&names=["'
            .$this->norm($playerName)
            .'"]&callback=angular.callbacks._0',
            true
        )[0];
    }

    public function getAvatar(string $playerName): void
    {
        return $this->baseLegacyUrl.'m=avatar-rs/'.$this->norm($playerName).'/chat.png';
    }

    public function getBulkProfiles(array $listOfUsers, int $chunkSize) : array
    {
        $output = [];

        $requests = function (array $listOfUsers) {
            foreach ($listOfUsers as $user) {
                yield new Request(
                    'GET',
                    $this->baseRunemetricsUrl
                    .'profile/profile?user='
                    .$this->norm($user->name)
                    .'&activities=20'
                );
            }
        };

        $pool = new Pool(
            $this->client, $requests($listOfUsers),
            [
                'concurrency' => $chunkSize,
                'fulfilled' => function ($response, $index) use ($listOfUsers, &$output) {
                    $outputObject = (object)[];
                    $outputObject->index = $index;
                    $outputObject->userId = $listOfUsers[$index]->id;
                    $outputObject->userName = $listOfUsers[$index]->name;

                    if ($response->getStatusCode() == 200) {
                        $profile = json_decode($response->getBody()->getContents());
                        if (!isset($profile->error)) {
                            $outputObject->activities = $profile->activities;
                            $outputObject->skills = $profile->skillvalues;
                        } else {
                            $outputObject->error = $profile->error;
                        }
                    }
                    $output[] = $outputObject;
                }
            ]);

        $promise = $pool->promise();
        $promise->wait();

        return $output;
    }

    public function getBulkActivitiesByName(array $listOfNames) : array
    {
        $output = [];
        $listOfNames = array_values($listOfNames);
        $requests = function (array $listOfNames) {
            foreach ($listOfNames as $name) {
                yield new Request(
                    'GET',
                    $this->baseRunemetricsUrl.'profile/profile?user='.$this->norm($name).'&activities=20'
                );
            }
        };
        $pool = new Pool(
            $this->client, $requests($listOfNames),
            [
                'concurrency' => 25,
                'fulfilled' => function ($response, $index) use ($listOfNames, &$output)
                {
                    $outputObject = (object)[];
                    $outputObject->userName = $listOfNames[$index];

                    if ($response->getStatusCode() == 200) {
                        $profile = json_decode($response->getBody()->getContents());
                        if (!isset($profile->error)) {
                            $parsedActivities = [];
                            foreach ($profile->activities as $activity) {
                                $parsedActivity = (object)[];
                                $parsedActivity->title = $activity->text;
                                $parsedActivity->details = $activity->details;
                                $parsedActivity->timestamp = strtotime($activity->date);
                                $parsedActivities[] = $parsedActivity;
                            }
                            $outputObject->activities = $parsedActivities;
                        } else {
                            $outputObject->error = $profile->error;
                        }
                    }
                    $output[$index] = $outputObject;
                }
            ]);

        $promise = $pool->promise();
        $promise->wait();
        return $output;
    }

    public function getClanList(string $clanName)
    {
        $clanUrl = $this->baseLegacyUrl.'m=clan-hiscores/members_lite.ws?clanName=';
        if (($handle = fopen($clanUrl.$this->norm($clanName), "r")) !== false) {
            $index = 0;
            $clanList = [];
            while (($row = fgetcsv($handle, ",")) !== false) {
                /*
                 * Instead of throwing an error when a clan doesn't exist,
                 * you get redirected to the clan hiscore overview page.
                 * Ty Jagex. This hacky fix checks for the first line of
                 * the page and breaks on the HTML doctype. If someone can
                 * replace this with a proper 302 HTTP status code fix, please do.
                 */
                if ($row[0] == '<!doctype html>') {
                    return null;
                }
                if ($index > 0) {
                    $clanList[] = $this->norm($row[0]);
                }
                $index++;
            }
            fclose($handle);
            return $clanList;
        } else {
            return null;
        }
    }

    public function getClanFromPlayerName(string $playerName): ?string
    {
        $playerDetails = $this->getDetails($playerName);
        if (isset($playerDetails->clan) && $playerDetails->clan != null) {
            return $this->norm($playerDetails->clan);
        } else {
            return null;
        }
    }

    /*
     *  If I ever find the Jagex dev that is responsible for this I'll cut him
     */
    public function norm(string $string) : string
    {
        $clear = strip_tags($string);
        $clear = html_entity_decode($clear);
        $clear = urldecode($clear);
        $clear = strtolower($clear);
        $clear = preg_replace('/[^A-Za-z0-9]/', ' ', $clear);
        $clear = preg_replace('/ +/', '+', $clear);
        $clear = trim($clear);
        return $clear;
    }

    private function trimCallback(string $response_string): string
    {
        /*
         * I can't get rid of these magic numbers just yet because getDetails
         * grabs data from some weird Angular end-point and it only works when
         * you include the callback URL parameter and then trim off the returned
         * JS crap. Will investigate at a later date aka never.
         */
        $response_string = substr($response_string, 21);
        $response_string = substr($response_string, 0, -3);
        return $response_string;
    }
}
