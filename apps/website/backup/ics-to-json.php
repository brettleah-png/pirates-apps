<?php
// ics-to-json.php
// Simple ICS -> JSON proxy/parser for FullCalendar

$feedUrl = "https://scheduler.leaguelobster.com/rsvp/calendar/team/24168317/rss/";

// Basic fetch with user agent
$context = stream_context_create([
    "http" => [
        "header" => "User-Agent: Mozilla/5.0\r\n",
        "timeout" => 10
    ]
]);

$raw = @file_get_contents($feedUrl, false, $context);

if ($raw === false) {
    header('Content-Type: application/json');
    http_response_code(502);
    echo json_encode(["error" => "Could not fetch upstream feed"]);
    exit;
}

// Unfold folded lines per RFC: lines that start with space or tab continue previous line
$raw = preg_replace("/(\r\n|\n)[ \t]/", '', $raw);

// Find VEVENT blocks
preg_match_all('/BEGIN:VEVENT(.*?)END:VEVENT/s', $raw, $vevents);

$events = [];

foreach ($vevents[1] as $vevent) {

    // Helper to extract a field (handles params like DTSTART;TZID=...:)
    $getField = function($name) use ($vevent) {
        $pattern = '/(?:^|\r\n|\n)' . preg_quote($name) . '(?:;[^:]*)?:(.*?)(?:\r\n|\n|$)/si';
        if (preg_match($pattern, $vevent, $m)) {
            return trim($m[1]);
        }
        return null;
    };

    $summary     = $getField('SUMMARY');
    $description = $getField('DESCRIPTION');
    $location    = $getField('LOCATION');
    $uid         = $getField('UID');
    $url         = $getField('URL');
    $dtstart_raw = $getField('DTSTART');
    $dtend_raw   = $getField('DTEND');

    // parse ICS datetime into ISO8601 (AToM)
    $parseIcsDate = function($s) {
        if (!$s) return null;
        // remove possible parameter prefix (e.g., DTSTART;TZID=Europe/Johannesburg:20251006T140000)
        if (strpos($s, ':') !== false && preg_match('/^[A-Z]+=.*:/', $s)) {
            // if full input contained params, keep after last colon
            $parts = explode(':', $s);
            $s = array_pop($parts);
        }
        $s = trim($s);

        // YYYYMMDD or YYYYMMDDTHHMMSS or with trailing Z
        if (preg_match('/^(\d{8})T(\d{6})Z$/', $s, $m)) {
            $dt = DateTime::createFromFormat('Ymd\THis', $m[1].'T'.$m[2], new DateTimeZone('UTC'));
        } elseif (preg_match('/^(\d{8})T(\d{6})$/', $s, $m)) {
            $dt = DateTime::createFromFormat('Ymd\THis', $m[1].'T'.$m[2]);
        } elseif (preg_match('/^(\d{8})$/', $s, $m)) {
            $dt = DateTime::createFromFormat('Ymd', $m[1]);
        } else {
            // fallback to PHP parsing
            try {
                $dt = new DateTime($s);
            } catch (Exception $e) {
                $dt = null;
            }
        }

        if ($dt instanceof DateTime) {
            return $dt->format(DateTime::ATOM); // ISO8601
        }
        return null;
    };

    $start = $parseIcsDate($dtstart_raw);
    $end   = $parseIcsDate($dtend_raw);

    // If no explicit end but DTSTART is a date (all-day) and DTSTART is date-only, end can remain null.
    $events[] = [
        "title" => $summary ?? "No title",
        "start" => $start,
        "end" => $end,
        "description" => $description ?? "",
        "location" => $location ?? "",
        "url" => $url ?? "",
        "uid" => $uid ?? ""
    ];
}

// Output JSON
header('Content-Type: application/json');
echo json_encode($events);
