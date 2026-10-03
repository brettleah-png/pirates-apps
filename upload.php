<?php
$uploadRoot = "uploads/";

// Ensure uploads directory exists
if (!file_exists($uploadRoot)) mkdir($uploadRoot, 0777, true);

// ✅ Handle album rename
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['rename_album'], $_POST['new_album_name'])) {
    $oldAlbum = basename($_POST['rename_album']);
    $newAlbum = preg_replace('/[^a-zA-Z0-9_\-]/', '_', strtolower($_POST['new_album_name']));
    $oldPath = "$uploadRoot$oldAlbum";
    $newPath = "$uploadRoot$newAlbum";

    if ($oldAlbum !== $newAlbum && file_exists($oldPath)) {
        rename($oldPath, $newPath);
    }

    header("Location: upload.php?album=" . urlencode($newAlbum));
    exit;
}

// ✅ Handle album delete
if (isset($_GET['delete_album'])) {
    $album = basename($_GET['delete_album']);
    $path = "$uploadRoot$album";

    if (file_exists($path)) {
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($path, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );
        foreach ($files as $file) {
            $file->isDir() ? rmdir($file->getRealPath()) : unlink($file->getRealPath());
        }
        rmdir($path);
    }

    header("Location: upload.php");
    exit;
}

// ✅ Handle image delete
if (isset($_GET['delete'], $_GET['album'])) {
    $album = basename($_GET['album']);
    $file = basename($_GET['delete']);
    $dataFile = "$uploadRoot$album/data.json";
    $filePath = "$uploadRoot$album/$file";
    if (file_exists($filePath)) unlink($filePath);
    if (file_exists($dataFile)) {
        $data = json_decode(file_get_contents($dataFile), true) ?: [];
        $data = array_filter($data, fn($i) => $i['filename'] !== $file);
        file_put_contents($dataFile, json_encode(array_values($data), JSON_PRETTY_PRINT));
    }
    header("Location: upload.php?album=" . urlencode($album));
    exit;
}

// ✅ Handle description update
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_desc'])) {
    $album = basename($_POST['album']);
    $dataFile = "$uploadRoot$album/data.json";
    $data = file_exists($dataFile) ? json_decode(file_get_contents($dataFile), true) : [];
    foreach ($data as &$item) {
        if (isset($_POST['desc'][$item['filename']])) {
            $item['description'] = $_POST['desc'][$item['filename']];
        }
    }
    file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
    header("Location: upload.php?album=" . urlencode($album));
    exit;
}

// ✅ Handle file upload
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['images'])) {
    $album = $_POST['album'] ?: $_POST['new_album'] ?: 'default';
    $album = preg_replace('/[^a-zA-Z0-9_\-]/', '_', strtolower($album));
    $albumPath = "$uploadRoot$album/";
    if (!file_exists($albumPath)) mkdir($albumPath, 0777, true);

    $dataFile = "$albumPath/data.json";
    $data = file_exists($dataFile) ? json_decode(file_get_contents($dataFile), true) : [];

    foreach ($_FILES['images']['name'] as $i => $name) {
        if ($_FILES['images']['error'][$i] !== UPLOAD_ERR_OK) continue;
        $tmp = $_FILES['images']['tmp_name'][$i];
        $filename = time() . "_" . basename($name);
        move_uploaded_file($tmp, $albumPath . $filename);
        $desc = $_POST['descriptions'][$i] ?? '';
        $data[] = ["filename" => $filename, "description" => $desc];
    }
    file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
    header("Location: upload.php?album=" . urlencode($album));
    exit;
}

// ✅ Get all albums
$albums = array_map('basename', glob($uploadRoot . "*", GLOB_ONLYDIR));
$album = $_GET['album'] ?? null;
$data = [];
if ($album && file_exists("$uploadRoot$album/data.json")) {
    $data = json_decode(file_get_contents("$uploadRoot$album/data.json"), true);
}

// Helper to get album cover
function getAlbumCover($folder) {
    $dataFile = $folder . "/data.json";
    if (file_exists($dataFile)) {
        $data = json_decode(file_get_contents($dataFile), true);
        if (!empty($data[0]['filename'])) {
            return basename($folder) . "/" . $data[0]['filename'];
        }
    }
    $files = glob($folder . "/*.{jpg,jpeg,png,gif,webp}", GLOB_BRACE);
    return $files ? basename($folder) . "/" . basename($files[0]) : null;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Upload Manager</title>
<style>
body {
  background: #111;
  color: #fff;
  font-family: Arial, sans-serif;
  text-align: center;
  padding: 20px;
}
a { color: #9cf; text-decoration: none; }
select, input, textarea, button {
  margin: 5px; padding: 8px;
  border-radius: 6px;
  border: none;
}
.album-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
  margin: 20px 0;
}
.album-option {
  background: #222;
  border-radius: 10px;
  padding: 10px;
  text-align: center;
  width: 150px;
  cursor: pointer;
  transition: background 0.2s;
}
.album-option:hover { background: #333; }
.album-option img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
}
.preview-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}
.preview-item {
  background: #222;
  padding: 10px;
  border-radius: 8px;
  width: 180px;
}
.preview-item img {
  width: 100%; height: 120px; object-fit: cover; border-radius: 6px;
}
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill,minmax(200px,1fr));
  gap: 10px;
  margin-top: 30px;
}
.gallery div {
  background: #222;
  padding: 10px;
  border-radius: 8px;
}
.gallery img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 6px;
}
.rename-form {
  margin: 15px auto;
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
}
</style>
</head>
<body>

<h1>Upload Manager</h1>
<a href="upload.php">← Back</a><br>
<a href="gallery.php"> Go To Gallery</a>

<h3>Select an Album</h3>
<div class="album-list">
  <?php foreach ($albums as $a): 
    $cover = getAlbumCover($uploadRoot . $a);
  ?>
    <div class="album-option">
      <a href="upload.php?album=<?php echo urlencode($a); ?>" style="color:white;text-decoration:none;">
        <?php if ($cover): ?>
          <img src="uploads/<?php echo htmlspecialchars($cover); ?>" alt="">
        <?php else: ?>
          <div style="background:#444;height:100px;border-radius:6px;margin-bottom:6px;"></div>
        <?php endif; ?>
        <div><?php echo htmlspecialchars(ucwords(str_replace('_',' ',$a))); ?></div>
      </a>
      <a href="?delete_album=<?php echo urlencode($a); ?>" onclick="return confirm('Delete entire album? This cannot be undone.')">🗑 Delete Album</a>
    </div>
  <?php endforeach; ?>
</div>

<form id="uploadForm" action="upload.php" method="post" enctype="multipart/form-data">
  <h3><?php echo $album ? "Add Images to " . htmlspecialchars(ucwords(str_replace('_',' ',$album))) : "Create or Select Album"; ?></h3>
  
  <input type="hidden" name="album" value="<?php echo htmlspecialchars($album ?? ''); ?>">
  <?php if (!$album): ?>
    <input type="text" name="new_album" id="newAlbum" placeholder="New album name"><br>
  <?php endif; ?>

  <input type="file" name="images[]" id="images" multiple accept="image/*"><br>
  <div class="preview-container"></div>
  <br><button type="submit">Upload</button>
</form>

<?php if ($album): ?>
  <hr>
  <h2>Existing Images in <?php echo htmlspecialchars(ucwords(str_replace('_',' ',$album))); ?></h2>

  <!-- ✅ Rename album -->
  <form class="rename-form" method="post">
    <input type="hidden" name="rename_album" value="<?php echo htmlspecialchars($album); ?>">
    <input type="text" name="new_album_name" placeholder="Rename album" required>
    <button type="submit">Rename</button>
  </form>

  <form method="post">
    <input type="hidden" name="album" value="<?php echo htmlspecialchars($album); ?>">
    <div class="gallery">
      <?php foreach ($data as $item): ?>
        <div>
          <img src="uploads/<?php echo htmlspecialchars("$album/".$item['filename']); ?>" alt="">
          <textarea name="desc[<?php echo htmlspecialchars($item['filename']); ?>]" rows="2"><?php echo htmlspecialchars($item['description']); ?></textarea>
          <br>
          <a href="?album=<?php echo urlencode($album); ?>&delete=<?php echo urlencode($item['filename']); ?>" onclick="return confirm('Delete this image?')">🗑 Delete</a>
        </div>
      <?php endforeach; ?>
    </div>
    <br><button name="update_desc" type="submit">Update Descriptions</button>
  </form>
<?php endif; ?>

<script>
const input = document.getElementById("images");
const previewContainer = document.querySelector(".preview-container");

input?.addEventListener("change", function() {
  previewContainer.innerHTML = "";
  for (let file of this.files) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const div = document.createElement("div");
      div.className = "preview-item";
      div.innerHTML = `
        <img src="${e.target.result}" alt="">
        <textarea name="descriptions[]" placeholder="Description for ${file.name}"></textarea>
      `;
      previewContainer.appendChild(div);
    };
    reader.readAsDataURL(file);
  }
});
</script>

</body>
</html>
