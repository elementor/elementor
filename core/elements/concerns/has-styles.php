<?php

namespace Elementor\Core\Elements\Concerns;

use Elementor\Core\Elements\Atomic_Element;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Parsers\Style_Parser;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Atomic_Element
 */
trait Has_Styles {
	private function parse_atomic_styles( array $styles ): array {
		$style_parser = Style_Parser::make( Style_Schema::get() );

		foreach ( $styles as $style_id => $style ) {
			$result = $style_parser->parse( $style );

			if ( ! $result->is_valid() ) {
				throw new \Exception( esc_html( "Styles validation failed for style `$style_id`. " . $result->errors()->to_string() ) );
			}

			$styles[ $style_id ] = $result->unwrap();
		}

		return $styles;
	}
}
