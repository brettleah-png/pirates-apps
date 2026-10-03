<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json");

$feedUrl = isset($_GET['url']) ? $_GET['url'] : '';
if (!$feedUrl) {
    echo json_encode(["error" => "No URL provided"]);
    exit;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $feedUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0");
$data = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($data === false || $httpCode !== 200) {
    echo json_encode(["error" => "Could not fetch feed", "httpCode" => $httpCode]);
    exit;
}

// Parse ICS → same parsing logic you already had
$events = [];
preg_match_all('/BEGIN:VEVENT(.*?)END:VEVENT/s', $data, $matches);

foreach ($matches[1] as $vevent) {
    preg_match('/SUMMARY:(.*)/', $vevent, $summary);
    preg_match('/DTSTART.*:(.*)/', $vevent, $start);
    preg_match('/DTEND.*:(.*)/', $vevent, $end);
    preg_match('/LOCATION:(.*)/', $vevent, $location);
    preg_match('/DESCRIPTION:(.*)/', $vevent, $description);

    $events[] = [
        "title" => isset($summary[1]) ? trim($summary[1]) : "",
        "start" => isset($start[1]) ? date('c', strtotime($start[1])) : "",
        "end" => isset($end[1]) ? date('c', strtotime($end[1])) : "",
        "location" => isset($location[1]) ? trim($location[1]) : "",
        "description" => isset($description[1]) ? trim($description[1]) : ""
    ];
}

echo json_encode($events);
