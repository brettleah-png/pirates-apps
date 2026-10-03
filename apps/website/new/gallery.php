<?php
$albums = array_filter(glob('uploads/*'), 'is_dir');
?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Gallery</title>
  <style>
    body { font-family: Arial; background: #f2f2f2; text-align: center; }
    h1 { margin-top: 30px; }
    .albums { display: flex; flex-wrap: wrap; justify-content: center; }
    .album { background: white; border-radius: 8px; margin: 10px; padding: 10px; width: 180px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
    .album img { width: 160px; height: 120px; object-fit: cover; border-radius: 6px; }
    .album a { text-decoration: none; color: #333; display: block; margin-top: 8px; font-weight: bold; }
    .gallery { display: flex; flex-wrap: wrap; justify-content: center; margin-top: 30px; }
    .gallery img { width: 160px; height: 120px; object-fit: cover; border-radius: 6px; margin: 5px; cursor: pointer; transition: 0.2s; }
    .gallery img:hover { transform: scale(1.05); }
    .lightbox { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.8); display:none; align-items:center; justify-content:center; flex-direction:column; }
    .lightbox.active { display:flex; }
    .lightbox img { max-width:90%; max-height:80%; border-radius:10px; }
    .lightbox p { color:#fff; margin-top:10px; }
    .nav-btn { position:absolute; top:50%; font-size:40px; color:white; cursor:pointer; user-select:none; }
    .prev { left:30px; }
    .next { right:30px; }
    .close-btn { position:absolute; top:20px; right:30px; font-size:35px; color:white; cursor:pointer; }
  </style>
</head>
<body>
  <h1>Photo Gallery</h1>
  <p><a href="upload.php">Upload & Manage Albums</a></p>

  <?php if (!isset($_GET['album'])): ?>
    <div class="albums">
      <?php foreach ($albums as $albumPath): 
        $album = basename($albumPath);
        $images = glob("$albumPath/*.{jpg,jpeg,png,gif}", GLOB_BRACE);
        $thumb = count($images) ? $images[0] : "uploads/default.jpg";
      ?>
      <div class="album">
        <a href="?album=<?php echo urlencode($album); ?>">
          <img src="<?php echo $thumb; ?>" onerror="this.src='uploads/default.jpg'">
          <?php echo htmlspecialchars($album); ?>
        </a>
      </div>
      <?php endforeach; ?>
    </div>
  <?php else: 
    $album = basename($_GET['album']);
    $images = glob("uploads/$album/*.{jpg,jpeg,png,gif}", GLOB_BRACE);
  ?>
    <h2><?php echo htmlspecialchars($album); ?></h2>
    <a href="index.php">← Back to albums</a>
    <div class="gallery">
      <?php foreach ($images as $i => $img): ?>
        <img src="<?php echo $img; ?>" data-index="<?php echo $i; ?>">
      <?php endforeach; ?>
    </div>
  <?php endif; ?>

  <div class="lightbox">
    <span class="close-btn">&times;</span>
    <span class="nav-btn prev">&#10094;</span>
    <img src="">
    <span class="nav-btn next">&#10095;</span>
    <p></p>
  </div>

  <script>
  const lightbox = document.querySelector(".lightbox");
  const lbImg = lightbox.querySelector("img");
  const imgs = document.querySelectorAll(".gallery img");
  let current = 0;

  function show(i) {
    if (i < 0) i = imgs.length - 1;
    if (i >= imgs.length) i = 0;
    current = i;
    lbImg.src = imgs[i].src;
    lightbox.classList.add("active");
  }

  imgs.forEach((img, i) => img.addEventListener("click", () => show(i)));
  document.querySelector(".close-btn").onclick = () => lightbox.classList.remove("active");
  document.querySelector(".prev").onclick = () => show(current - 1);
  document.querySelector(".next").onclick = () => show(current + 1);
  </script>
</body>
</html>
