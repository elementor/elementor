<?php

namespace Elementor\Modules\Agents\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Post_Title {

	public static function to_plain_text( string $title ): string {
		return html_entity_decode( wp_strip_all_tags( $title ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	}
}
