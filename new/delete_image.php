<?php
header("Content-Type: application/json");

$uploadDir = "uploads/";
$dataFile = "data.json";

if (!isset($_POST["filename"])) {
    echo json_encode(["status" => "error", "message" => "No filename specified"]);
    exit;
}

$filename = basename($_POST["filename"]);
$data = json_decode(file_get_contents($dataFile), true) ?? [];

// Remove file from disk
$filePath = $uploadDir . $filename;
if (file_exists($filePath)) {
    unlink($filePath);
}

// Remove entry from JSON
$data = array_filter($data, fn($item) => $item["filename"] !== $filename);
file_put_contents($dataFile, json_encode(array_values($data), JSON_PRETTY_PRINT));

echo json_encode(["status" => "success", "message" => "Image deleted"]);
