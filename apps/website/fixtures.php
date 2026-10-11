<?php
// The fixtures page is maintained by someone outside this repo. Their file is
// kept unchanged in fixtures/schedule.html so a new version can be copied over
// it as is. This page serves it with our additions: a favicon, a link back to
// the main site, and the crest loaded from img/ instead of a 200 KB inline copy.
// Each addition is skipped if their markup changes, so the page always loads.

$page = file_get_contents(__DIR__ . '/fixtures/schedule.html');

$headAdditions = <<<'HTML'
<link href="img/favicon.jpg" rel="icon">
<style>
  .back-link {
    position: relative;
    z-index: 1;
    display: inline-block;
    margin-bottom: 20px;
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
  }
  .back-link:hover,
  .back-link:focus-visible {
    color: #fff;
    text-decoration: underline;
  }
</style>
HTML;

$backLink = '<a class="back-link" href="index.php">&larr; Back to the Pirates website</a>';

$page = str_replace('</head>', $headAdditions . "\n</head>", $page);

// Put the link at the top of their hero banner, or at the top of the page if
// the banner is gone (it is styled for the dark banner, so give it a dark bar)
if (strpos($page, '<header class="hero">') !== false) {
    $page = str_replace('<header class="hero">', '<header class="hero">' . "\n  " . $backLink, $page);
} else {
    $page = preg_replace(
        '/<body[^>]*>/',
        '$0<div style="background:#273581;padding:12px 16px 0">' . $backLink . '</div>',
        $page,
        1
    );
}

$page = preg_replace(
    '/<div class="crest-mark"><img src="data:image\/[a-z]+;base64,[^"]+"/',
    '<div class="crest-mark"><img src="img/Logo.png"',
    $page,
    1
);

echo $page;
