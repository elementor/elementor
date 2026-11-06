<?php
/**
 * Seeds raw Elementor data on a post, for elements MCP cannot create (V3 widgets, e-flexbox).
 * Run with: wp eval-file <path to this file> <post id> <base64-encoded JSON>
 *
 * The data travels base64-encoded as a positional argument because the Docker CLI splits commands on
 * whitespace without a shell, so `wp eval '<php>'` cannot carry it.
 */
if ( ! defined( 'WP_CLI' ) ) {
	exit;
}

[ $post_id, $data ] = $args;

update_post_meta( (int) $post_id, '_elementor_edit_mode', 'builder' );
update_post_meta( (int) $post_id, '_elementor_data', wp_slash( base64_decode( $data ) ) );
