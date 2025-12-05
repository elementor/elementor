<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Migratable_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Html_Prop_Type extends String_Prop_Type implements Migratable_Prop_Type {
	public static function get_key(): string {
		return 'html';
	}

	protected function validate_value( $value ): bool {
		return is_string( $value );
	}

	protected function sanitize_value( $value ) {
		return preg_replace_callback( '/^(\s*)(.*?)(\s*)$/', function ( $matches ) {
			[, $leading, $value, $trailing ] = $matches;

			$allowed_tags = [
				'b'           => [],
				'i'           => [],
				'em'          => [],
				'u'           => [],
				'ul'          => [],
				'ol'          => [],
				'li'          => [],
				'blockquote'  => [],
				'a'           => [ 'href' => true ],
				'del'         => [],
				'span'        => [],
				'br'          => [],
				'strong'      => [],
			];

			$sanitized = wp_kses( $value, $allowed_tags );

			return $leading . $sanitized . $trailing;
		}, $value );
	}

	public function get_compatible_type_keys(): array {
		return [ String_Prop_Type::get_key() ];
	}
}
