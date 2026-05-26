<?php

namespace Elementor\Modules\Mcp\Abilities\Services;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Post_Template_Resolver {

	private const DEFAULT_NEW_POST_TEMPLATE = 'elementor_canvas';

	public static function resolve( array $input, bool $is_new_post ): ?string {
		if ( array_key_exists( 'post_template', $input ) ) {
			$value = $input['post_template'];

			return is_string( $value ) ? $value : '';
		}

		return $is_new_post ? self::DEFAULT_NEW_POST_TEMPLATE : null;
	}
}
