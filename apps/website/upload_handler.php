<?php
header("Content-Type: application/json");

$uploadDir = "uploads/";
$dataFile = "data.json";

if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);
if (!file_exists($dataFile)) file_put_contents($dataFile, json_encode([]));

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_FILES["images"]) && !empty($_FILES["images"]["name"][0])) {
    $data = json_decode(file_get_contents($dataFile), true);

    foreach ($_FILES["images"]["name"] as $index => $name) {
        $tmp = $_FILES["images"]["tmp_name"][$index];
        $filename = time() . "_" . basename($name);
        $target = $uploadDir . $filename;
        $desc = $_POST["descriptions"][$index] ?? "";

        if (move_uploaded_file($tmp, $target)) {
            $data[] = [
                "filename" => $filename,
                "description" => $desc
            ];
        }
    }

    file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
    echo json_encode(["status" => "success", "message" => "Files uploaded"]);
} else {
    echo json_encode(["status" => "error", "message" => "No files received"]);
}
