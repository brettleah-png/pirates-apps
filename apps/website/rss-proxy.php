<?php
$url = "https://scheduler.leaguelobster.com/rsvp/calendar/team/24168317/rss/";

$context = stream_context_create([
    "http" => [
        "header" => "User-Agent: Mozilla/5.0\r\n"
    ]
]);

$data = @file_get_contents($url, false, $context);

if ($data === false) {
    header("Content-Type: application/json");
    echo json_encode(["error" => "Could not fetch feed"]);
    exit;
}

header("Content-Type: text/calendar");
echo $data;
