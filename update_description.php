<?php
header("Content-Type: application/json");

$dataFile = "data.json";

if (!isset($_POST["filename"], $_POST["description"])) {
    echo json_encode(["status" => "error", "message" => "Missing parameters"]);
    exit;
}

$filename = basename($_POST["filename"]);
$newDesc = trim($_POST["description"]);

if (!file_exists($dataFile)) {
    echo json_encode(["status" => "error", "message" => "Data file missing"]);
    exit;
}

$data = json_decode(file_get_contents($dataFile), true) ?? [];
$found = false;

foreach ($data as &$item) {
    if ($item["filename"] === $filename) {
        $item["description"] = $newDesc;
        $found = true;
        break;
    }
}

if ($found) {
    file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => "File not found in data"]);
}
