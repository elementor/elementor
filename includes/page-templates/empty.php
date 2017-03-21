<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?> class="no-js">
	<head>
		<meta charset="<?php bloginfo( 'charset' ); ?>">
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title><?php wp_title( '|', true, 'right' ); ?></title>
		<?php wp_head(); ?>
	</head>

	<body <?php body_class(); ?>>

	<?php
	while ( have_posts() ) {
		the_post();

		the_content();
	}

	wp_footer();
	?>
	</body>
</html>
