<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
?><!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<?php wp_head(); ?>
</head>
<body class="elementor-editor-active">
<noscript>You need to enable JavaScript to run this app.</noscript>
<div id="root"></div>
<?php wp_footer();
/** This action is documented in wp-admin/admin-footer.php */
do_action( 'admin_print_footer_scripts' );
?>
<script src="http://localhost:3000/static/js/bundle.js"></script>
</body>
</html>

