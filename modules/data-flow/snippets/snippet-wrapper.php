<?php

namespace Elementor\Modules\DataFlow\Snippets;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Snippet_Wrapper {
	const REGISTRATION_CALL = 'window.elementorDataFlow.registerSnippet';

	public static function wrap( string $name, array $handlers ): string {
		$entries = array_map(
			fn( $handler ) => sprintf( "\t%s: (%s\n)", wp_json_encode( $handler['event'] ), $handler['code'] ),
			$handlers
		);

		return sprintf( "%s(%s, {\n%s\n});\n", self::REGISTRATION_CALL, wp_json_encode( $name ), implode( ",\n", $entries ) );
	}
}
