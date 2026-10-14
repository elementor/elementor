<?php

namespace Elementor\Modules\DataFlow\Snippets;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Snippet_Access {
	public static function can_manage(): bool {
		return current_user_can( 'manage_options' ) && current_user_can( 'unfiltered_html' );
	}

	public static function can_view_code(): bool {
		return current_user_can( 'unfiltered_html' );
	}
}
