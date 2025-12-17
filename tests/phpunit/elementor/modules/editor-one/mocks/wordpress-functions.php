<?php

if ( ! function_exists( 'current_user_can' ) ) {
	function current_user_can( $capability ) {
		global $mock_current_user_can_edit_posts, $mock_current_user_can_manage_options;

		if ( 'edit_posts' === $capability ) {
			return $mock_current_user_can_edit_posts ?? false;
		}

		if ( 'manage_options' === $capability ) {
			return $mock_current_user_can_manage_options ?? false;
		}

		return false;
	}
}

