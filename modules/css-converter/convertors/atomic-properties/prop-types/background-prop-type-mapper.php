<?php

namespace Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes;

use Elementor\Modules\CssConverter\Convertors\AtomicProperties\Implementations\Atomic_Prop_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Background_Prop_Type_Mapper extends Atomic_Prop_Mapper_Base {
	protected $supported_properties = [
		'background',
		'background-image'
	];

	protected $atomic_prop_type = 'background';

	protected $supported_css_units = [];

	public function map_css_to_atomic( string $css_value ): ?array {
		$css_value = trim( $css_value );
		
		if ( empty( $css_value ) || 'none' === $css_value ) {
			return null;
		}

		$background_value = $this->parse_background_value( $css_value );
		if ( null === $background_value ) {
			return null;
		}

		return $this->create_atomic_prop( $background_value );
	}

	private function parse_background_value( string $css_value ): ?array {
		if ( $this->is_color_value( $css_value ) ) {
			$color = $this->normalize_color_value( $css_value );
			if ( null !== $color ) {
				return [
					'color' => [
						'$$type' => 'color',
						'value' => $color
					]
				];
			}
		}

		if ( $this->is_image_value( $css_value ) ) {
			return [
				'image' => [
					'$$type' => 'image',
					'value' => [
						'url' => $this->extract_url_from_css( $css_value ),
						'id' => null
					]
				]
			];
		}

		if ( $this->is_gradient_value( $css_value ) ) {
			return [
				'background-overlay' => [
					'$$type' => 'background-overlay',
					'value' => [
						[
							'$$type' => 'background-gradient-overlay',
							'value' => $this->parse_gradient_value( $css_value )
						]
					]
				]
			];
		}

		return null;
	}

	private function is_color_value( string $css_value ): bool {
		return null !== $this->normalize_color_value( $css_value );
	}

	private function is_image_value( string $css_value ): bool {
		return false !== strpos( $css_value, 'url(' );
	}

	private function is_gradient_value( string $css_value ): bool {
		return false !== strpos( $css_value, 'gradient(' );
	}

	private function extract_url_from_css( string $css_value ): string {
		if ( preg_match( '/url\s*\(\s*["\']?([^"\']+)["\']?\s*\)/', $css_value, $matches ) ) {
			return $matches[1];
		}
		return '';
	}

	private function parse_gradient_value( string $css_value ): array {
		if ( false !== strpos( $css_value, 'linear-gradient' ) ) {
			return $this->parse_linear_gradient( $css_value );
		}

		if ( false !== strpos( $css_value, 'radial-gradient' ) ) {
			return $this->parse_radial_gradient( $css_value );
		}

		return [
			'type' => 'linear',
			'angle' => [
				'$$type' => 'number',
				'value' => 0
			],
			'stops' => [
				'$$type' => 'gradient-color-stop',
				'value' => []
			]
		];
	}

	private function parse_linear_gradient( string $css_value ): array {
		$angle = 0;
		$stops = [];

		if ( preg_match( '/linear-gradient\s*\(\s*(\d+)deg/', $css_value, $matches ) ) {
			$angle = (float) $matches[1];
		}

		if ( preg_match_all( '/(#[a-f0-9]{3,6}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-z]+)\s*(?:(\d+(?:\.\d+)?%))?/', $css_value, $matches, PREG_SET_ORDER ) ) {
			foreach ( $matches as $match ) {
				$color = $this->normalize_color_value( $match[1] );
				$position = isset( $match[2] ) ? (float) str_replace( '%', '', $match[2] ) : null;

				if ( null !== $color ) {
					$stops[] = [
						'$$type' => 'color-stop',
						'value' => [
							'color' => [
								'$$type' => 'color',
								'value' => $color
							],
							'offset' => [
								'$$type' => 'number',
								'value' => $position ?? 0
							]
						]
					];
				}
			}
		}

		return [
			'type' => 'linear',
			'angle' => [
				'$$type' => 'number',
				'value' => $angle
			],
			'stops' => [
				'$$type' => 'gradient-color-stop',
				'value' => $stops
			]
		];
	}

	private function parse_radial_gradient( string $css_value ): array {
		return [
			'type' => 'radial',
			'angle' => [
				'$$type' => 'number',
				'value' => 0
			],
			'stops' => [
				'$$type' => 'gradient-color-stop',
				'value' => []
			]
		];
	}
}
