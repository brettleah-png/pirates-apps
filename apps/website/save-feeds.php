<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $feeds = file_get_contents("php://input");
    if ($feeds) {
        $result = file_put_contents("feeds.json", $feeds);
        if ($result !== false) {
            echo json_encode(["status" => "success"]);
            exit;
        }
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to save feeds"]);
    exit;
}

http_response_code(405);
echo json_encode(["status" => "error", "message" => "Method not allowed"]);
