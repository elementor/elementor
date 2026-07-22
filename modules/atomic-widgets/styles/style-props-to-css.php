<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Style_Props_To_Css {

	/**
	 * Resolve a map of style PropValue envelopes into a flat `{cssProp: cssValue}` map.
	 * Null/empty resolved values are filtered out.
	 *
	 * @param array<string, mixed> $props Style props as stored (PropValue envelopes).
	 * @return array<string, string>
	 */
	public static function to_map( array $props ): array {
		if ( empty( $props ) ) {
			return [];
		}

		$resolved = Render_Props_Resolver::for_styles()->resolve( Style_Schema::get(), $props );

		return array_filter( $resolved, fn( $value ) => null !== $value && '' !== $value );
	}
}
