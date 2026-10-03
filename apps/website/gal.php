<?php
// gallery.php
$dataFile = "data.json";
$uploadDir = "uploads/";

if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode([]));
}
$data = json_decode(file_get_contents($dataFile), true) ?? [];
?>


<html lang="en">

<head>
    <meta charset="utf-8">
    <title>HELDERBERG PIRATES BASEBALL</title>
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <meta content="Free HTML Templates" name="keywords">
    <meta content="Free HTML Templates" name="description">

    <!-- Favicon -->
    <link href="img/favicon.jpg" rel="icon">

    <!-- Google Web Fonts -->
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Rubik&display=swap" rel="stylesheet"> 

    <!-- Icon Font Stylesheet -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.0/css/all.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css" rel="stylesheet">
    <link href="lib/flaticon/font/flaticon.css" rel="stylesheet">

    <!-- Libraries Stylesheet -->
    <link href="lib/owlcarousel/assets/owl.carousel.min.css" rel="stylesheet">

    <!-- Customized Bootstrap Stylesheet -->
    <link href="css/bootstrap.min.css" rel="stylesheet">

    <!-- Template Stylesheet -->
    <link href="css/style.css" rel="stylesheet">
	
	<script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js"></script>

 <style>

  h1 {
    text-align: center;
  }
  .gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-top: 20px;
  }
  .item {
    background: #222;
    padding: 10px;
    border-radius: 8px;
    text-align: center;
  }
  .item img {
    max-width: 100%;
    border-radius: 8px;
    cursor: pointer;
  }
  p {
    margin-top: 5px;
    color: #ccc;
  }

  /* Lightbox */
  .lightbox {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.8);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .lightbox.active {
    display: flex;
  }
  .lightbox img {
    max-width: 80%;
    max-height: 80%;
    border-radius: 10px;
  }
  .close-btn {
    position: absolute;
    top: 20px;
    right: 30px;
    background: crimson;
    border: none;
    color: #fff;
    padding: 8px 14px;
    border-radius: 5px;
    cursor: pointer;
  }
</style>


</head>

<title>
</title>



<body>

    <!-- Header Start -->
    <div class="container-fluid bg-dark px-0">
        <div class="row gx-0">
            <div class="col-lg-3 bg-dark d-none d-lg-block" z-index=-1>
                <a href="index.php" class="navbar-brand w-100 h-100 m-0 p-0 d-flex align-items-center justify-content-center">
                    <img src="img/Logo.png" height=150px> 
					<!--<h1 class="m-0 display-4 text-primary text-uppercase"><img src="img/Logo.png" height=100px> Helderberg<br>Pirates</h1>-->
                </a>
            </div>
            <div class="col-lg-9">
                <div class="row gx-0 bg-secondary d-none d-lg-flex">
                    <div class="col-lg-7 px-5 text-start">
                        <div class="h-100 d-inline-flex align-items-center py-2 me-4">
                            <i class="fa fa-envelope text-primary me-2"></i>
                            <h6 class="mb-0">info@helderbergpirates.co.za</h6>
                        </div>
                        <div class="h-100 d-inline-flex align-items-center py-2">
                            <i class="fa fa-phone-alt text-primary me-2"></i>
                            <h6 class="mb-0">076 909 3707</h6>
                        </div>
                    </div>
                    <div class="col-lg-5 px-5 text-end">
					<a href="https://forms.gle/RRqZorZAKZQTANLh9" target="_blank">Book the Clubhouse</a>
                        <div class="d-inline-flex align-items-center py-2">
                            <a class="btn btn-light btn-square rounded-circle me-2" href="https://www.facebook.com/profile.php?id=61581433657465" target="_blank">
                                <i class="fab fa-facebook-f"></i>
                            </a>
                            <a class="btn btn-light btn-square rounded-circle me-2" href="https://www.instagram.com/helderbergpirates/" target="_blank">
                                <i class="fab fa-instagram"></i>
                            </a>

                        </div>
                    </div>
                </div>
                <nav class="navbar navbar-expand-lg bg-dark navbar-dark p-3 p-lg-0 px-lg-5">
                    <a href="index.html" class="navbar-brand d-block d-lg-none">
                        <h1 class="m-0 display-4 text-primary text-uppercase">Helderberg Pirates</h1>
                    </a>
                    <button type="button" class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse justify-content-between" id="navbarCollapse">
                        <div class="navbar-nav mr-auto py-0">
                            <a href="index.php" class="nav-item nav-link active">Home</a>
                            <a href="about.html" class="nav-item nav-link">About</a>
							<!--<a href="shop.html" class="nav-item nav-link">Shop</a>-->
                            <div class="nav-item dropdown">
                                <a href="schedule.php" class="nav-link dropdown-toggle" data-bs-toggle="dropdown">Schedule</a>
                                <div class="dropdown-menu rounded-0 m-0">
                                    <a href="schedule.php" class="dropdown-item">U10</a>
                                    <a href="schedule.php" class="dropdown-item">U12</a>
                                    <a href="schedule.php" class="dropdown-item">U15</a>
									<a href="schedule.php" class="dropdown-item">Seniors</a>
									<a href="schedule.php" class="dropdown-item">Masters</a>
                                </div>
                            </div>
							<a href="gallery.php" class="nav-item nav-link">Gallery</a>
                            <a href="contact.html" class="nav-item nav-link">Contact</a>
                        </div>
                      <!--<a href="" class="btn btn-primary py-md-2 px-md-2 d-none d-lg-block">Become a Pirate</a>-->
                    </div>
                </nav>
            </div>
        </div>
    </div>
    <!-- Header End -->




    <!-- Class Timetable Start -->
    <div class="container-fluid p-5">
        <div class="mb-5 text-center">
            <h5 class="text-primary text-uppercase">Gallery</h5>
            <!--<h1 class="display-3 text-uppercase mb-0">Our Schedule</h1>-->
        </div>
        <div class="tab-class text-center">
            <!--Gallery data goes here-->
			<div class="gallery">
  <?php if (!empty($data)): ?>
    <?php foreach ($data as $item): ?>
      <div class="item">
        <img src="<?= htmlspecialchars($uploadDir . $item['filename']) ?>" data-desc="<?= htmlspecialchars($item['description']) ?>" alt="">
        <p><?= htmlspecialchars($item['description']) ?></p>
      </div>
    <?php endforeach; ?>
  <?php else: ?>
    <p>No images uploaded yet.</p>
  <?php endif; ?>
</div>

<!-- Lightbox -->
<div class="lightbox">
  <button class="close-btn">Close</button>
  <div class="lightbox-content">
    <img src="" alt="">
  </div>
</div>
			
			
			
			
			<!--gallery data ends here-->
        </div>
    </div>
	

    
    

    <!-- Footer Start -->
    <div class="container-fluid bg-dark text-secondary px-5 mt-5">
        <div class="row gx-5">
            <div class="col-lg-8 col-md-6">
                <div class="row gx-5">
                    <div class="col-lg-4 col-md-12 pt-5 mb-5">
                        <h4 class="text-uppercase text-light mb-4">Get In Touch</h4>
                        <div class="d-flex mb-2">
                            <i class="bi bi-geo-alt text-primary me-2"></i>
                            <p class="mb-0">Radloff Park</p>
                        </div>
                        <div class="d-flex mb-2">
                            <i class="bi bi-envelope-open text-primary me-2"></i>
                            <p class="mb-0">info@helderbergpirates.co.za</p>
                        </div>
                        <div class="d-flex mb-2">
                            <i class="bi bi-telephone text-primary me-2"></i>
                            <p class="mb-0">076 909 3707</p>
                        </div>
                        <div class="d-flex mt-4">
                           
                            <a class="btn btn-primary btn-square rounded-circle me-2" href="https://www.facebook.com/profile.php?id=61581433657465" target="_blank"><i class="fab fa-facebook-f"></i></a>
                          
                            <a class="btn btn-primary btn-square rounded-circle" href="https://www.instagram.com/helderbergpirates/" target="_blank"><i class="fab fa-instagram"></i></a>
                        </div>
                    </div>
                     <div class="col-lg-4 col-md-12 pt-0 pt-lg-5 mb-5">
                        <h4 class="text-uppercase text-light mb-4">Quick Links</h4>
                        <div class="d-flex flex-column justify-content-start">
                            <a class="text-secondary mb-2" href="index.php"><i class="bi bi-arrow-right text-primary me-2"></i>Home</a>
                            <a class="text-secondary mb-2" href="about.html"><i class="bi bi-arrow-right text-primary me-2"></i>About Us</a>
                            <a class="text-secondary mb-2" href="schedule.php"><i class="bi bi-arrow-right text-primary me-2"></i>Schedule</a>
                            <!--<a class="text-secondary mb-2" href="#"><i class="bi bi-arrow-right text-primary me-2"></i>Our Coaches</a>-->
                            <a class="text-secondary" href="contact.html"><i class="bi bi-arrow-right text-primary me-2"></i>Contact Us</a>
                        </div>
                    </div>
                    <div class="col-lg-4 col-md-12 pt-0 pt-lg-5 mb-5">
                        <h4 class="text-uppercase text-light mb-4">Popular Links</h4>
                        <div class="d-flex flex-column justify-content-start">
                            <a class="text-secondary mb-2" href="index.php"><i class="bi bi-arrow-right text-primary me-2"></i>Home</a>
                            <a class="text-secondary mb-2" href="about.html"><i class="bi bi-arrow-right text-primary me-2"></i>About Us</a>
                            <a class="text-secondary mb-2" href="schedule.php"><i class="bi bi-arrow-right text-primary me-2"></i>Schedule</a>
                            <!--<a class="text-secondary mb-2" href="#"><i class="bi bi-arrow-right text-primary me-2"></i>Our Coaches</a>-->
                            <a class="text-secondary" href="contact.html"><i class="bi bi-arrow-right text-primary me-2"></i>Contact Us</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-4 col-md-6">
                <div class="d-flex flex-column align-items-center justify-content-center text-center h-100 bg-primary p-5">
                    <!--<h4 class="text-uppercase text-white mb-4">Newsletter</h4>
                    <h6 class="text-uppercase text-white">Subscribe Our Newsletter</h6>
                    <p class="text-light">Want to keep up to date with whats happening at the club?</p>
                    <form action="">
                        <div class="input-group">
                            <input type="text" class="form-control border-white p-3" placeholder="Your Email">
                            <button class="btn btn-dark">Sign Up</button>-->
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <div class="container-fluid py-4 py-lg-0 px-5" style="background: #111111;">
        <div class="row gx-5">
            <div class="col-lg-8">
                <div class="py-lg-4 text-center">
                    <p class="text-secondary mb-0">&copy; <a class="text-light fw-bold" href="#">Helderberg Pirates</a>. All Rights Reserved.</p>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="py-lg-4 text-center credit">
                    <p class="text-light mb-0">Designed by Helderberg Pirates Baseball</p>
                </div>
            </div>
        </div>
    </div>
    <!-- Footer End -->


    <!-- Back to Top -->
    <a href="#" class="btn btn-dark py-3 fs-4 back-to-top"><i class="bi bi-arrow-up"></i></a>


    <!-- JavaScript Libraries -->
    <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="lib/easing/easing.min.js"></script>
    <script src="lib/waypoints/waypoints.min.js"></script>
    <script src="lib/counterup/counterup.min.js"></script>
    <script src="lib/owlcarousel/owl.carousel.min.js"></script>

    <!-- Template Javascript -->
    <script src="js/main.js"></script>
<script>
const items = document.querySelectorAll(".item img");
const lightbox = document.querySelector(".lightbox");
const lightImg = document.querySelector(".lightbox img");
const closeBtn = document.querySelector(".close-btn");

items.forEach(img => {
  img.addEventListener("click", () => {
    lightImg.src = img.src;
    lightbox.classList.add("active");
  });
});

closeBtn.addEventListener("click", () => lightbox.classList.remove("active"));
lightbox.addEventListener("click", e => {
  if (e.target === lightbox) lightbox.classList.remove("active");
});
</script>
	
</body>

</html>