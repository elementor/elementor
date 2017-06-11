<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

get_header();

while ( have_posts() ) {
	the_post();
	the_content();
}

get_footer();
