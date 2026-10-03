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

    #calendar {
      max-width: 100%;
      margin: 0 auto 20px auto;
    }
    #legend {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;          
      border-top: 1px solid #ddd;
      padding-top: 12px;
      justify-content: flex-start; /* row layout on desktop */
    }
    .legend-item {
      display: flex;
      align-items: center;
      font-size: 15px;
      cursor: pointer;
      user-select: none;
    }
    .legend-color {
      width: 14px;
      height: 14px;
      margin-right: 6px;
      border: 1px solid #444;
      border-radius: 3px;
    }
    .legend-item.inactive {
      opacity: 0.5;
      color: #888;
    }

    /* ✅ Mobile responsiveness */
    @media (max-width: 600px) {
      body {
        padding: 10px;
      }
      #legend {
        flex-direction: column;
        gap: 6px;
      }
      .fc-toolbar.fc-header-toolbar {
        flex-wrap: wrap;
        justify-content: center;
        text-align: center;
      }
      .fc-toolbar-chunk {
        margin-bottom: 6px;
      }
      .legend-item {
        font-size: 13px;
      }
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
                    <a href="index.php" class="navbar-brand d-block d-lg-none">
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


    <!-- Carousel Start -->
    <div class="container-fluid p-0 mb-5">
        <div id="header-carousel" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
                <div class="carousel-item active">
                    <img class="w-100 h-50" src="img/carousel-1.jpg" alt="Image">
                    <div class="carousel-caption d-flex flex-column align-items-center justify-content-center">
                        <div class="p-3" style="max-width: 900px;">
                            <h5 class="text-white text-uppercase">Helderberg Pirates Baseball Club</h5>
                            <h1 class="display-2 text-white text-uppercase mb-md-4">Pirates R.O.C.K.S! </h1><h5 class="text-white text-uppercase"><br>Respect, 0penness, Community,Kindness and Support.<br> These are the words that every Pirate lives by.</h5>
                            <a href="https://forms.gle/RhgDEo3Kqg71NJ1R8" class="btn btn-primary py-md-3 px-md-5 me-3"  target="_blank">Become A Pirate</a>
                            <a href="contact.html" class="btn btn-light py-md-3 px-md-5">Contact Us</a>
                        </div>
                    </div>
                </div>
                
            </div>
          <!--  <button class="carousel-control-prev" type="button" data-bs-target="#header-carousel"
                data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#header-carousel"
                data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>-->
        </div>
    </div>
    <!-- Carousel End -->


    <!-- About Start -->
    <div class="container-fluid p-5">
        <div class="row gx-5">
            <div class="col-lg-5 mb-5 mb-lg-0" style="min-height: 500px;">
                <div class="position-relative h-100">
                    <img class="position-absolute w-100 h-100 rounded" src="img/about.jpg" style="object-fit: cover;">
                </div>
            </div>
            <div class="col-lg-7">
                <div class="mb-4">
                    <h5 class="text-primary text-uppercase">About Us</h5>
                    <h1 class="display-3 text-uppercase mb-0">Welcome to the Helderberg Pirates</h1>
                </div>
                <h4 class="text-body mb-4">Since 1952</h4>
                <p class="mb-4">Welcome to the Helderberg Pirates Baseball Club, where the love of baseball and vibrant community spirit meet.</p>
                <div class="rounded bg-dark p-5">
                    <ul class="nav nav-pills justify-content-between mb-3">
                        <li class="nav-item w-50">
                            <a class="nav-link text-uppercase text-center w-100 active" data-bs-toggle="pill" href="#pills-1">About Us</a>
                        </li>
                        <li class="nav-item w-50">
                                <a class="nav-link text-uppercase text-center w-100" data-bs-toggle="pill" href="#pills-2">Why Choose Us</a>
                        </li>
                    </ul>
                    <div class="tab-content">
                        <div class="tab-pane fade show active" id="pills-1">
                            <p class="text-secondary mb-0">Helderberg Pirate's was originally founded in 1952, over the years, from season to season we have grown from strength to strength. In 1995 we founded our permanent “home” at Radloff Park in Somerset West, and today within our clubhouse people from all walks of life are united by our passion for the amazing sport of baseball.</p>
                        </div>
                        <div class="tab-pane fade" id="pills-2">
                            <p class="text-secondary mb-0">At our club, baseball is more than just a game – it’s a community. We provide a welcoming environment where players of all ages and skill levels can learn, grow, and thrive both on and off the field. Our dedicated coaches focus on building strong fundamentals while encouraging teamwork, discipline, and sportsmanship. Whether you’re looking to develop your skills, make new friends, or simply enjoy the spirit of the game, our club offers the perfect balance of fun, development, and competitive opportunity. Join us and become part of a team that feels like family.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- About End -->


    <!-- Programe Start -->
    <div class="container-fluid programe position-relative px-5 mt-5" style="margin-bottom: 135px;">
        <div class="row g-5 gb-5">
            <div class="col-lg-4 col-md-6">
                <div class="bg-light rounded text-center p-5">
                    <i class="display-1 text-primary"><img src="img/icons/diamond.png" width="100px"></i>
                    <h3 class="text-uppercase my-4">Teamwork</h3>
                    <p>Baseball is the ultimate team sport—every pitch, every catch, every swing matters. Success comes not from one player, but from nine working together with trust, support, and shared determination. Teamwork turns individual effort into collective victory</p>
                    <!--<a class="text-uppercase" href="">Read More <i class="bi bi-arrow-right"></i></a>-->
                </div>
            </div>
            <div class="col-lg-4 col-md-6">
                <div class="bg-light rounded text-center p-5">
                    <i class="display-1 text-primary"><img src="img/icons/baseball.png" width="100px"></i>
                    <h3 class="text-uppercase my-4">Batting</h3>
                    <p>Batting is about focus, patience, and confidence. Every time a player steps up to the plate, they carry the chance to spark momentum for the whole team. Whether it’s a hard hit, a smart walk, or simply putting the ball in play, every at-bat counts and adds to the team’s success.</p>
                    <!--<a class="text-uppercase" href="">Read More <i class="bi bi-arrow-right"></i></a>-->
                </div>
            </div>
            <div class="col-lg-4 col-md-6">
                <div class="bg-light rounded text-center p-5">
                    <i class="display-1 text-primary"><img src="img/icons/glove.png" width="100px"></i>
                    <h3 class="text-uppercase my-4">Fielding</h3>
                    <p>Fielding is where quick reactions and smart decisions make all the difference. From tracking fly balls to making clean throws, every defensive play protects the team’s chances. Great fielding is not just about skill, but about communication and trust—knowing your teammates are ready to back you up.</p>
                    <!--<a class="text-uppercase" href="">Read More <i class="bi bi-arrow-right"></i></a>-->
                </div>
            </div>
            <div class="col-lg-12 col-md-6 text-center">
                <h1 class="text-uppercase text-light mb-4">Register today!</h1>
                <a href="https://forms.gle/RhgDEo3Kqg71NJ1R8" class="btn btn-primary py-3 px-5" target = "_blank">Become A Pirate</a>
            </div>
        </div>
    </div>
    <!-- Programe Start -->


    <!-- Class Timetable Start -->
    <div class="container-fluid p-5">
        <div class="mb-5 text-center">
            <h5 class="text-primary text-uppercase">Schedule</h5>
            <h1 class="display-3 text-uppercase mb-0">Our Schedule</h1>
        </div>
        <div class="tab-class text-center">
            <ul class="nav nav-pills d-inline-flex justify-content-center bg-dark text-uppercase rounded-pill mb-5">
                
                <li class="nav-item">
                    <a class="nav-link rounded-pill text-white" data-bs-toggle="pill" href="#tab-1">Tuesday</a>
                </li>
                
                <li class="nav-item">
                    <a class="nav-link rounded-pill text-white" data-bs-toggle="pill" href="#tab-2">Thursday</a>
                </li>
                
                <li class="nav-item">
                    <a class="nav-link rounded-pill text-white" data-bs-toggle="pill" href="#tab-3">Saturday</a>
                </li>
                
            </ul>
            <div class="tab-content">
                <div id="tab-1" class="tab-pane fade show p-0 active">
                    <div class="row g-5">
                        <div class="col-lg-3 col-md-4 col-sm-6">
                            <div class="bg-dark rounded text-center py-5 px-3">
                                <h6 class="text-uppercase text-light mb-3">5:30 PM - 7:00PM</h6>
                                <h5 class="text-uppercase text-primary2">U/10 Training</h5>
								<p class="text-uppercase text-secondary mb-0">Coach Jacques</p>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-4 col-sm-6">
                            <div class="bg-dark rounded text-center py-5 px-3">
                                <h6 class="text-uppercase text-light mb-3">5:30 PM - 7:30PM</h6>
                                <h5 class="text-uppercase text-primary2">U/12 Training</h5>
                                <p class="text-uppercase text-secondary mb-0">Coach Josh</p>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-4 col-sm-6">
                            <div class="bg-dark rounded text-center py-5 px-3">
                                <h6 class="text-uppercase text-light mb-3">5:30 PM - 7:30PM</h6>
                                <h5 class="text-uppercase text-primary2">U/15 Training</h5>
                                <p class="text-uppercase text-secondary mb-0">Coach Brett</p>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-4 col-sm-6">
                            <div class="bg-dark rounded text-center py-5 px-3">
                                <h6 class="text-uppercase text-light mb-3">5:30 PM - 7:30PM</h6>
                                <h5 class="text-uppercase text-primary2">Senior Side Training</h5>
                                <p class="text-uppercase text-secondary mb-0">Coach Devan</p>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-4 col-sm-6">
                            <div class="bg-dark rounded text-center py-5 px-3">
                                <h6 class="text-uppercase text-light mb-3">5:30 PM - 7:30PM</h6>
                                <h5 class="text-uppercase text-primary2">Masters Training</h5>
                                <p class="text-uppercase text-secondary mb-0">Coach Peter</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="tab-2" class="tab-pane fade p-0">
                    <div class="row g-5">
                        <div class="col-lg-3 col-md-4 col-sm-6">
                            <div class="bg-dark rounded text-center py-5 px-3">
                                <h6 class="text-uppercase text-light mb-3">5:30 PM - 7:00PM</h6>
                                <h5 class="text-uppercase text-primary2">U/10 Training</h5>
								<p class="text-uppercase text-secondary mb-0">Coach Jacques</p>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-4 col-sm-6">
                            <div class="bg-dark rounded text-center py-5 px-3">
                                <h6 class="text-uppercase text-light mb-3">5:30 PM - 7:30PM</h6>
                                <h5 class="text-uppercase text-primary2">U/12 Training</h5>
                                <p class="text-uppercase text-secondary mb-0">Coach Josh</p>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-4 col-sm-6">
                            <div class="bg-dark rounded text-center py-5 px-3">
                                <h6 class="text-uppercase text-light mb-3">5:30 PM - 7:30PM</h6>
                                <h5 class="text-uppercase text-primary2">U/15 Training</h5>
                                <p class="text-uppercase text-secondary mb-0">Coach Brett</p>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-4 col-sm-6">
                            <div class="bg-dark rounded text-center py-5 px-3">
                                <h6 class="text-uppercase text-light mb-3">5:30 PM - 7:30PM</h6>
                                <h5 class="text-uppercase text-primary2">Senior Side Training</h5>
                                <p class="text-uppercase text-secondary mb-0">Coach Devan</p>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-4 col-sm-6">
                            <div class="bg-dark rounded text-center py-5 px-3">
                                <h6 class="text-uppercase text-light mb-3">5:30 PM - 7:30PM</h6>
                                <h5 class="text-uppercase text-primary2">Masters Training</h5>
                                <p class="text-uppercase text-secondary mb-0">Coach Peter</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="tab-3" class="tab-pane fade p-0">
                    <div class="row g-5">
                       <div id="calendar"></div>
					   <div id="legend"></div>
					  
                    </div>
                </div>
            </div>
        </div>
    </div>
	<a href="schedule.php" class="btn btn-primary py-md-3 px-md-5 d-none d-lg-block">See Full Schedule</a>
    <!-- Class Timetable Start -->

    <!-- Team Start -->
    <div class="container-fluid p-5">
        <div class="mb-5 text-center">
            <h5 class="text-primary text-uppercase">The Team</h5>
            <h1 class="display-3 text-uppercase mb-0">Our Coaches</h1>
        </div>
        <div class="row g-5">
            <div class="col-lg-3 col-md-6">
                <div class="team-item position-relative">
                    <div class="position-relative overflow-hidden rounded">
                        <img class="img-fluid w-100" src="img/brett.png" alt="">
                        <div class="team-overlay">
                            <<div class="d-flex align-items-center justify-content-start">
                                <h6 class="text-uppercase text-light mb-3">Coach Brett believes in our motto of PIRATES ROCKS and uses this philosophy everyday in training.</h6>
                            </div>
                        </div>
                    </div>
                    <div class="position-absolute start-0 bottom-0 w-100 rounded-bottom text-center p-4" style="background: rgba(34, 36, 41, .9);">
                        <h5 class="text-uppercase text-light">Coach Brett</h5>
                        <p class="text-uppercase text-secondary m-0">U/15 Head Coach</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6">
                <div class="team-item position-relative">
                    <div class="position-relative overflow-hidden rounded">
                        <img class="img-fluid w-100" src="img/josh.png" alt="">
                        <div class="team-overlay">
                            <div class="d-flex align-items-center justify-content-start">
                               <h6 class="text-uppercase text-light mb-3">Coach Josh hails from Detroit, USA where he played baseball throughout his youth, all the way up to the college level and brings with him a wealth of baseball knowledge.</h6>
                            </div>
                        </div>
                    </div>
                    <div class="position-absolute start-0 bottom-0 w-100 rounded-bottom text-center p-4" style="background: rgba(34, 36, 41, .9);">
                        <h5 class="text-uppercase text-light">Coach Josh</h5>
                        <p class="text-uppercase text-secondary m-0">U/12 Head coach</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6">
                <div class="team-item position-relative">
                    <div class="position-relative overflow-hidden rounded">
                        <img class="img-fluid w-100" src="img/jacques.png" alt="">
                        <div class="team-overlay">
                            <div class="d-flex align-items-center justify-content-start">
                              <h6 class="text-uppercase text-light mb-3">Coach Jacques has the hardest job of them all, coaching the youngest of our players, ranging from 8 to 10 it can be like hearding cats, but he wouldnt change it for anything as developing our young players into future stars is his passion.</h6>
                            </div>
                        </div>
                    </div>
                    <div class="position-absolute start-0 bottom-0 w-100 rounded-bottom text-center p-4" style="background: rgba(34, 36, 41, .9);">
                        <h5 class="text-uppercase text-light">Coach Jacques</h5>
                        <p class="text-uppercase text-secondary m-0">U/10 Head Coach</p>
                    </div>
                </div>
            </div>
			 <div class="col-lg-3 col-md-6">
                <div class="team-item position-relative">
                    <div class="position-relative overflow-hidden rounded">
                        <img class="img-fluid w-100" src="img/justin.png" alt="">
                        <div class="team-overlay">
                            <div class="d-flex align-items-center justify-content-start">
                              <h6 class="text-uppercase text-light mb-3">Coach Justin is one of the longest active Pirates, he started back when he himself was a junior, and now over 30 years later plays and coaches for our senior side	.</h6>
                            </div>
                        </div>
                    </div>
                    <div class="position-absolute start-0 bottom-0 w-100 rounded-bottom text-center p-4" style="background: rgba(34, 36, 41, .9);">
                        <h5 class="text-uppercase text-light">Coach Justin</h5>
                        <p class="text-uppercase text-secondary m-0">Seniors Head Coach</p>
                    </div>
                </div>
            </div>
			<div class="col-lg-3 col-md-6">
                <div class="team-item position-relative">
                    <div class="position-relative overflow-hidden rounded">
                        <img class="img-fluid w-100" src="img/devan.png" alt="">
                        <div class="team-overlay">
                            <div class="d-flex align-items-center justify-content-start">
                              <h6 class="text-uppercase text-light mb-3">Coach Devan is also there to assist with the seniors</h6>
                            </div>
                        </div>
                    </div>
                    <div class="position-absolute start-0 bottom-0 w-100 rounded-bottom text-center p-4" style="background: rgba(34, 36, 41, .9);">
                        <h5 class="text-uppercase text-light">Coach Devan</h5>
                        <p class="text-uppercase text-secondary m-0">Seniors Coach</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Team End -->
    

    <!-- Testimonial Start-->
    <div class="container-fluid p-0 my-5">
        <div class="row g-0">
            <div class="col-lg-6" style="min-height: 500px;">
                <div class="position-relative h-100">
                    <img class="position-absolute w-100 h-100" src="img/testimonial.jpg" style="object-fit: cover;">
                </div>
            </div>
            <div class="col-lg-6 bg-dark p-5">
                <div class="mb-5">
                    <h5 class="text-primary text-uppercase">Want to watch our games?</h5>
                    <h1 class="display-3 text-uppercase text-light mb-0">Join us at Radloff Park!</h1>
                </div>
                <div class="owl-carousel testimonial-carousel">
                    <div class="testimonial-item">
                        <p class="fs-4 fw-normal text-light mb-4"><i class="fa fa-quote-left text-primary me-3"></i>All home games are open to the public, free of charge, with a tuckshop and braai facilities.</p>
                      
                    </div>
                   
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Testimonial End -->


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
                    <h4 class="text-uppercase text-white mb-4">Our Sponsors</h4>
                    <!--<h6 class="text-uppercase text-white">Thanks goes out to our sponsors</h6>-->
                    <!--<p class="text-light">He</p>-->
                    <div class="container-fluid p-0 mb-5">
        <div id="header-carousel" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
                <div class="carousel-item active">
                    <a href = "https://www.jdwglass.co.za/"> <img class="w-100" src="img/jdw.jpg" alt="Image"></a>
                </div>
                <div class="carousel-item">
                   <a href = "https://purecoatings.co.za/"> <img class="w-100" src="img/pure_coating.png" alt="Image"></a>
                </div>
				<div class="carousel-item">
                    <a href = "https://www.sundancepools.co.za/"><img class="w-80" src="img/sundance.jpg" alt="Image"></a>
                </div>
				<div class="carousel-item">
                    <a href = "https://www.archo.co.za/"><img class="w-50" src="img/archo_black_logo.png" alt="Image"></a>
                </div>
            </div>
        </div>
    </div>
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
    document.addEventListener('DOMContentLoaded', async () => {
      const calendarEl = document.getElementById('calendar');
      const legendEl = document.getElementById('legend');

      try {
        const res = await fetch("feeds.json?t=" + new Date().getTime());
        const feeds = await res.json();

       const calendar = new FullCalendar.Calendar(calendarEl, {
  initialView: 'listWeek',
     displayEventEnd: false,
   timeZone: 'UTC', // ✅ Force GMT/UTC timezone
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,listWeek'
  },
        eventTimeFormat: { // ✅ Only show start time
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
      },
  views: {
    listWeek: { buttonText: 'Week' }
  },
  height: "auto"
});
calendar.render();

// ✅ Fix squashed month view by forcing a resize after render
setTimeout(() => {
  calendar.updateSize();
}, 100);


        const sourceMap = {};

        feeds.forEach(feed => {
          const item = document.createElement('div');
          item.className = "legend-item";

          const colorBox = document.createElement('div');
          colorBox.className = "legend-color";
          colorBox.style.backgroundColor = feed.color;

          const label = document.createElement('span');
          label.textContent = feed.name || feed.url;

          item.appendChild(colorBox);
          item.appendChild(label);
          legendEl.appendChild(item);

          const source = {
            id: feed.name,
            url: "ics-to-json.php?url=" + encodeURIComponent(feed.url),
            color: feed.color,
            textColor: "#fff"
          };
          calendar.addEventSource(source);
          sourceMap[feed.name] = source;

          item.addEventListener('click', () => {
            if (item.classList.contains("inactive")) {
              calendar.addEventSource(sourceMap[feed.name]);
              item.classList.remove("inactive");
            } else {
              const evSource = calendar.getEventSourceById(feed.name);
              if (evSource) evSource.remove();
              item.classList.add("inactive");
            }
          });
        });

      } catch (e) {
        console.error("Error loading feeds:", e);
        calendarEl.innerHTML = "<p style='color:red;'>Failed to load calendar feeds.</p>";
      }
    });
  </script>
	
</body>

</html>