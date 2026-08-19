<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Html_Prop_Type extends String_Prop_Type {
	public static function get_key(): string {
		return 'html';
	}

	protected function validate_value( $value ): bool {
		return is_string( $value );
	}

	protected function sanitize_value( $value ) {
		return preg_replace_callback( '/^(\s*)(.*?)(\s*)$/', function ( $matches ) {
			[, $leading, $value, $trailing ] = $matches;

			$sanitized = wp_kses( $value, static::get_base_allowed_tags() );

			return $leading . $sanitized . $trailing;
		}, $value );
	}

	public static function get_base_allowed_tags(): array {
		$allowed = [];
		$non_operational_attrs = self::get_allowed_non_operational_attrs();

		foreach ( Utils::get_allowed_html_wrapper_tags() as $tag ) {
			$allowed[ $tag ] = 'a' === $tag
				? array_merge(
					[
						'href'   => true,
						'target' => true,
					],
					$non_operational_attrs
				)
				: $non_operational_attrs;
		}

		return $allowed;
	}

	private static function get_allowed_non_operational_attrs(): array {
		return [
			'class'  => true,
			'id'     => true,
			'style'  => true,
			'title'  => true,
			'lang'   => true,
			'dir'    => true,
			'data-*' => true,
		];
	}

	public static function sanitize_allowed_html( string $value ): string {
		return wp_kses( $value, static::get_base_allowed_tags() );
	}
}
