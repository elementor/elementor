<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$mu_plugin = trailingslashit( WPMU_PLUGIN_DIR ) . 'elementor-pw-custom-icons.php';

if ( file_exists( $mu_plugin ) ) {
	unlink( $mu_plugin );
}
