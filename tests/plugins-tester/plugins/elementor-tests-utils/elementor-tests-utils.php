<?php

/**
 * Plugin Name: Elementor Tests Utilities
 * Description: Few utilities that helps automated tests
 */

// Auto login to WordPress as administrator
add_action('init', function () {
	if ( ! is_user_logged_in() ) {
		$user = get_user_by( 'login', 'admin' );
		wp_set_current_user( $user->ID );
		wp_set_auth_cookie( $user->ID );

		if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) {
			wp_safe_redirect( remove_query_arg( false ) );
			die;
		}
	}
});

add_action( 'wp_head', function () {
    // hide admin bar
    if ( is_user_logged_in() ) {
       show_admin_bar( false );
    }
});
// Log to console when the editor is ready.
add_action('elementor/editor/after_enqueue_scripts', function () {
	ob_start();
	?>
	<script>
		window.addEventListener("elementor:init", () => {
			// Backstop will run the tests based on the log, without waiting for a specific selector.
			elementor.on("document:loaded", () => {
				setTimeout(() => console.log("Elementor is ready!"), 1000);
			});
		});
	</script>
	<?php
	$script = ob_get_clean();
	// The script is wrapped with <script> tags for DX
	$script = str_replace( [ '<script>', '</script>' ], '', $script );
	wp_add_inline_script( 'elementor-editor', $script );
});

/**
 * Don't use Google Fonts. Sometimes they are not loaded and cause the tests to fail.
 */

// Avoid loading Google Fonts on the editor preview
add_action('elementor/editor/after_enqueue_scripts', function () {
	ob_start();
	?>
	<script>
		window.addEventListener("elementor:init", () => {
			elementor.helpers.enqueueFont = () => {};
		});
	</script>
	<?php
	$script = ob_get_clean();
	// The script is wrapped with <script> tags for DX
	$script = str_replace( [ '<script>', '</script>' ], '', $script );
	wp_add_inline_script( 'elementor-editor', $script );
});

// Avoid loading Google Fonts on the frontend
add_filter( 'elementor/frontend/print_google_fonts', '__return_false' );

// Avoid loading Google Fonts on 3rd plugins
function dequeue_fonts( $href ) {
	if ( false !== strpos( $href, 'https://fonts.google' ) ) {
		return false;
	}

	return $href;
}

add_filter( 'style_loader_src', 'dequeue_fonts' );
