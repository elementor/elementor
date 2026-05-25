<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Prop_Converter_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Number_Converter extends Prop_Converter_Base {

	private const PROPERTIES = [
		'z-index',
		'order',
		'column-count',
	];

	public function get_supported_properties(): array {
		return self::PROPERTIES;
	}

	public function convert( array $declarations ): array {
		$props = [];
		$unconverted = [];

		foreach ( $declarations as $declaration ) {
			$value = trim( $declaration['value'] );

			if ( ! preg_match( '/^-?\d+$/', $value ) ) {
				$unconverted[] = $this->unconverted(
					$declaration['property'],
					$declaration['value'],
					'Value is not a valid integer; rendered via custom_css.'
				);
				continue;
			}

			$props[ $declaration['property'] ] = Number_Prop_Type::generate( (int) $value );
		}

		return [
			'props' => $props,
			'unconverted' => $unconverted,
		];
	}
}
