<?php

namespace Elementor\Modules\EditorOne\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Elementor_One_Language_Mapper {

	public static function map_wordpress_locale_to_elementor_one_language( string $wordpress_locale ): string {
		if ( '' === $wordpress_locale ) {
			return 'en';
		}

		$segments = explode( '_', $wordpress_locale, 2 );

		if ( ! isset( $segments[1] ) ) {
			return $segments[0];
		}

		return $segments[0] . '-' . $segments[1];
	}

	public static function get_top_bar_language_codes( string $wordpress_locale ): array {
		$user_language = self::map_wordpress_locale_to_elementor_one_language( $wordpress_locale );
		$language_codes = [ 'en' ];

		if ( 'en' !== $user_language ) {
			$language_codes[] = $user_language;
		}

		return $language_codes;
	}
}
