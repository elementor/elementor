<?php

namespace Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes;

use Elementor\Modules\CssConverter\Convertors\AtomicProperties\Implementations\Atomic_Prop_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Url_Prop_Type_Mapper extends Atomic_Prop_Mapper_Base {
	protected $supported_properties = [
		'background-image'
	];

	protected $atomic_prop_type = 'url';

	protected $supported_css_units = [];

	public function map_css_to_atomic( string $css_value ): ?array {
		$css_value = trim( $css_value );
		
		if ( empty( $css_value ) || 'none' === $css_value ) {
			return null;
		}

		$url = $this->extract_url_from_css( $css_value );
		if ( empty( $url ) ) {
			return null;
		}

		return $this->create_atomic_prop( $url );
	}

	private function extract_url_from_css( string $css_value ): string {
		if ( preg_match( '/url\s*\(\s*["\']?([^"\']+)["\']?\s*\)/', $css_value, $matches ) ) {
			return $matches[1];
		}
		return '';
	}
}
