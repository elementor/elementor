<?php

namespace Elementor\Modules\CssConverter\Services\AtomicWidgets;

use Elementor\Modules\AtomicWidgets\Elements\Widget_Builder;
use Elementor\Modules\AtomicWidgets\Elements\Element_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Widget_Service {
	private $prop_type_registry;
	private $supported_prop_types;

	public function __construct() {
		$this->initialize_supported_prop_types();
	}

	public function create_widget_with_props( string $widget_type, array $props ): ?array {
		if ( empty( $widget_type ) ) {
			return null;
		}

		$builder = Widget_Builder::make( $widget_type );
		$atomic_settings = [];

		foreach ( $props as $prop_name => $prop_value ) {
			$atomic_prop = $this->convert_to_atomic_prop( $prop_name, $prop_value );
			if ( null !== $atomic_prop ) {
				$atomic_settings[ $prop_name ] = $atomic_prop;
			}
		}

		if ( ! empty( $atomic_settings ) ) {
			$builder->settings( $atomic_settings );
		}

		return $builder->build();
	}

	public function create_element_with_props( string $element_type, array $props, array $children = [] ): ?array {
		if ( empty( $element_type ) ) {
			return null;
		}

		$builder = Element_Builder::make( $element_type );
		$atomic_settings = [];

		foreach ( $props as $prop_name => $prop_value ) {
			$atomic_prop = $this->convert_to_atomic_prop( $prop_name, $prop_value );
			if ( null !== $atomic_prop ) {
				$atomic_settings[ $prop_name ] = $atomic_prop;
			}
		}

		if ( ! empty( $atomic_settings ) ) {
			$builder->settings( $atomic_settings );
		}

		if ( ! empty( $children ) ) {
			$builder->children( $children );
		}

		return $builder->build();
	}

	public function validate_prop_structure( array $prop ): bool {
		if ( ! isset( $prop['$$type'] ) || ! isset( $prop['value'] ) ) {
			return false;
		}

		$prop_type = $prop['$$type'];
		return in_array( $prop_type, $this->get_supported_prop_types(), true );
	}

	public function get_supported_prop_types(): array {
		return $this->supported_prop_types;
	}

	public function convert_css_to_atomic_prop( string $property, string $css_value ): ?array {
		return $this->convert_to_atomic_prop( $property, $css_value );
	}

	private function convert_to_atomic_prop( string $prop_name, $prop_value ): ?array {
		if ( is_array( $prop_value ) && isset( $prop_value['$$type'] ) ) {
			return $this->validate_prop_structure( $prop_value ) ? $prop_value : null;
		}

		if ( ! is_string( $prop_value ) ) {
			return null;
		}

		return $this->map_css_property_to_atomic_prop( $prop_name, $prop_value );
	}

	private function map_css_property_to_atomic_prop( string $property, string $css_value ): ?array {
		switch ( $property ) {
			case 'font-size':
			case 'width':
			case 'height':
			case 'max-width':
			case 'min-width':
				return $this->create_size_prop( $css_value );

			case 'color':
			case 'background-color':
				return $this->create_color_prop( $css_value );

			case 'margin':
			case 'padding':
				return $this->create_dimensions_prop( $css_value );

			case 'box-shadow':
				return $this->create_box_shadow_prop( $css_value );

			case 'text-shadow':
				return $this->create_text_shadow_prop( $css_value );

			case 'border-radius':
				return $this->create_border_radius_prop( $css_value );

			case 'display':
			case 'position':
			case 'flex-direction':
			case 'align-items':
			case 'text-align':
				return $this->create_string_prop( $css_value );

			case 'opacity':
			case 'z-index':
				return $this->create_number_prop( $css_value );

			default:
				return $this->create_string_prop( $css_value );
		}
	}

	private function create_size_prop( string $css_value ): ?array {
		$parsed = $this->parse_size_value( $css_value );
		if ( null === $parsed ) {
			return null;
		}

		return [
			'$$type' => 'size',
			'value' => [
				'size' => (float) $parsed['size'],
				'unit' => $parsed['unit']
			]
		];
	}

	private function create_color_prop( string $css_value ): ?array {
		$normalized_color = $this->normalize_color_value( $css_value );
		if ( null === $normalized_color ) {
			return null;
		}

		return [
			'$$type' => 'color',
			'value' => $normalized_color
		];
	}

	private function create_dimensions_prop( string $css_value ): ?array {
		$parsed = $this->parse_dimensions_value( $css_value );
		if ( null === $parsed ) {
			return null;
		}

		return [
			'$$type' => 'dimensions',
			'value' => [
				'block-start' => [
					'$$type' => 'size',
					'value' => [
						'size' => (float) $parsed['top']['size'],
						'unit' => $parsed['top']['unit']
					]
				],
				'inline-end' => [
					'$$type' => 'size',
					'value' => [
						'size' => (float) $parsed['right']['size'],
						'unit' => $parsed['right']['unit']
					]
				],
				'block-end' => [
					'$$type' => 'size',
					'value' => [
						'size' => (float) $parsed['bottom']['size'],
						'unit' => $parsed['bottom']['unit']
					]
				],
				'inline-start' => [
					'$$type' => 'size',
					'value' => [
						'size' => (float) $parsed['left']['size'],
						'unit' => $parsed['left']['unit']
					]
				],
			]
		];
	}

	private function create_box_shadow_prop( string $css_value ): ?array {
		$parsed = $this->parse_box_shadow_value( $css_value );
		if ( null === $parsed ) {
			return null;
		}

		$shadows = [];
		foreach ( $parsed as $shadow ) {
			$shadows[] = [
				'$$type' => 'shadow',
				'value' => [
					'hOffset' => [
						'$$type' => 'size',
						'value' => [
							'size' => (float) $shadow['h_offset']['size'],
							'unit' => $shadow['h_offset']['unit']
						]
					],
					'vOffset' => [
						'$$type' => 'size',
						'value' => [
							'size' => (float) $shadow['v_offset']['size'],
							'unit' => $shadow['v_offset']['unit']
						]
					],
					'blur' => [
						'$$type' => 'size',
						'value' => [
							'size' => (float) $shadow['blur']['size'],
							'unit' => $shadow['blur']['unit']
						]
					],
					'spread' => [
						'$$type' => 'size',
						'value' => [
							'size' => (float) $shadow['spread']['size'],
							'unit' => $shadow['spread']['unit']
						]
					],
					'color' => [
						'$$type' => 'color',
						'value' => $shadow['color']
					],
					'position' => $shadow['inset'] ? 'inset' : null
				]
			];
		}

		return [
			'$$type' => 'box-shadow',
			'value' => $shadows
		];
	}

	private function create_text_shadow_prop( string $css_value ): ?array {
		$parsed = $this->parse_text_shadow_value( $css_value );
		if ( null === $parsed ) {
			return null;
		}

		return [
			'$$type' => 'shadow',
			'value' => [
				'hOffset' => [
					'$$type' => 'size',
					'value' => [
						'size' => (float) $parsed['h_offset']['size'],
						'unit' => $parsed['h_offset']['unit']
					]
				],
				'vOffset' => [
					'$$type' => 'size',
					'value' => [
						'size' => (float) $parsed['v_offset']['size'],
						'unit' => $parsed['v_offset']['unit']
					]
				],
				'blur' => [
					'$$type' => 'size',
					'value' => [
						'size' => (float) $parsed['blur']['size'],
						'unit' => $parsed['blur']['unit']
					]
				],
				'color' => [
					'$$type' => 'color',
					'value' => $parsed['color']
				],
			]
		];
	}

	private function create_border_radius_prop( string $css_value ): ?array {
		$parsed = $this->parse_border_radius_value( $css_value );
		if ( null === $parsed ) {
			return null;
		}

		return [
			'$$type' => 'border-radius',
			'value' => [
				'start-start' => [
					'$$type' => 'size',
					'value' => [
						'size' => (float) $parsed['top_left']['size'],
						'unit' => $parsed['top_left']['unit']
					]
				],
				'start-end' => [
					'$$type' => 'size',
					'value' => [
						'size' => (float) $parsed['top_right']['size'],
						'unit' => $parsed['top_right']['unit']
					]
				],
				'end-start' => [
					'$$type' => 'size',
					'value' => [
						'size' => (float) $parsed['bottom_left']['size'],
						'unit' => $parsed['bottom_left']['unit']
					]
				],
				'end-end' => [
					'$$type' => 'size',
					'value' => [
						'size' => (float) $parsed['bottom_right']['size'],
						'unit' => $parsed['bottom_right']['unit']
					]
				],
			]
		];
	}

	private function create_string_prop( string $css_value ): ?array {
		if ( empty( trim( $css_value ) ) ) {
			return null;
		}

		return [
			'$$type' => 'string',
			'value' => trim( $css_value )
		];
	}

	private function create_number_prop( string $css_value ): ?array {
		if ( ! is_numeric( $css_value ) ) {
			return null;
		}

		return [
			'$$type' => 'number',
			'value' => (float) $css_value
		];
	}

	private function parse_size_value( string $css_value ): ?array {
		$css_value = trim( $css_value );
		
		if ( 'auto' === $css_value ) {
			return [ 'size' => '', 'unit' => 'auto' ];
		}

		if ( preg_match( '/^(-?\d*\.?\d+)(px|em|rem|%|vh|vw|vmin|vmax|ch|ex)$/i', $css_value, $matches ) ) {
			return [
				'size' => $matches[1],
				'unit' => strtolower( $matches[2] )
			];
		}

		if ( is_numeric( $css_value ) ) {
			return [
				'size' => $css_value,
				'unit' => 'px'
			];
		}

		return null;
	}

	private function normalize_color_value( string $css_value ): ?string {
		$css_value = trim( $css_value );
		
		if ( preg_match( '/^#([a-f0-9]{3}|[a-f0-9]{6})$/i', $css_value ) ) {
			return strtolower( $css_value );
		}

		if ( preg_match( '/^rgba?\([^)]+\)$/i', $css_value ) ) {
			return $css_value;
		}

		if ( preg_match( '/^hsla?\([^)]+\)$/i', $css_value ) ) {
			return $css_value;
		}

		$named_colors = [
			'transparent', 'black', 'white', 'red', 'green', 'blue',
			'yellow', 'cyan', 'magenta', 'gray', 'grey'
		];

		if ( in_array( strtolower( $css_value ), $named_colors, true ) ) {
			return strtolower( $css_value );
		}

		return null;
	}

	private function parse_dimensions_value( string $css_value ): ?array {
		$values = preg_split( '/\s+/', trim( $css_value ) );
		$count = count( $values );

		if ( 0 === $count || $count > 4 ) {
			return null;
		}

		$parsed_values = [];
		foreach ( $values as $value ) {
			$parsed = $this->parse_size_value( $value );
			if ( null === $parsed ) {
				return null;
			}
			$parsed_values[] = $parsed;
		}

		switch ( $count ) {
			case 1:
				return [
					'top' => $parsed_values[0],
					'right' => $parsed_values[0],
					'bottom' => $parsed_values[0],
					'left' => $parsed_values[0],
				];
			case 2:
				return [
					'top' => $parsed_values[0],
					'right' => $parsed_values[1],
					'bottom' => $parsed_values[0],
					'left' => $parsed_values[1],
				];
			case 3:
				return [
					'top' => $parsed_values[0],
					'right' => $parsed_values[1],
					'bottom' => $parsed_values[2],
					'left' => $parsed_values[1],
				];
			case 4:
				return [
					'top' => $parsed_values[0],
					'right' => $parsed_values[1],
					'bottom' => $parsed_values[2],
					'left' => $parsed_values[3],
				];
		}

		return null;
	}

	private function parse_box_shadow_value( string $css_value ): ?array {
		$css_value = trim( $css_value );
		
		if ( 'none' === $css_value ) {
			return [];
		}

		$pattern = '/(?:^|,)\s*(inset\s+)?(-?\d+(?:\.\d+)?(?:px|em|rem|%)?)\s+(-?\d+(?:\.\d+)?(?:px|em|rem|%)?)\s+(-?\d+(?:\.\d+)?(?:px|em|rem|%)?)\s*(-?\d+(?:\.\d+)?(?:px|em|rem|%)?)\s*([^,]*?)(?=,|$)/';
		
		if ( ! preg_match_all( $pattern, $css_value, $matches, PREG_SET_ORDER ) ) {
			return null;
		}

		$shadows = [];
		foreach ( $matches as $match ) {
			$inset = ! empty( trim( $match[1] ) );
			$h_offset = $this->parse_size_value( $match[2] );
			$v_offset = $this->parse_size_value( $match[3] );
			$blur = $this->parse_size_value( $match[4] );
			$spread = isset( $match[5] ) && ! empty( trim( $match[5] ) ) ? $this->parse_size_value( $match[5] ) : [ 'size' => 0, 'unit' => 'px' ];
			$color = isset( $match[6] ) && ! empty( trim( $match[6] ) ) ? $this->normalize_color_value( trim( $match[6] ) ) : '#000000';

			if ( null === $h_offset || null === $v_offset || null === $blur ) {
				continue;
			}

			$shadows[] = [
				'h_offset' => $h_offset,
				'v_offset' => $v_offset,
				'blur' => $blur,
				'spread' => $spread,
				'color' => $color,
				'inset' => $inset
			];
		}

		return empty( $shadows ) ? null : $shadows;
	}

	private function parse_text_shadow_value( string $css_value ): ?array {
		$css_value = trim( $css_value );
		
		if ( 'none' === $css_value ) {
			return null;
		}

		$pattern = '/(-?\d+(?:\.\d+)?(?:px|em|rem|%)?)\s+(-?\d+(?:\.\d+)?(?:px|em|rem|%)?)\s+(-?\d+(?:\.\d+)?(?:px|em|rem|%)?)\s*([^,]*?)$/';
		
		if ( ! preg_match( $pattern, $css_value, $matches ) ) {
			return null;
		}

		$h_offset = $this->parse_size_value( $matches[1] );
		$v_offset = $this->parse_size_value( $matches[2] );
		$blur = $this->parse_size_value( $matches[3] );
		$color = ! empty( trim( $matches[4] ) ) ? $this->normalize_color_value( trim( $matches[4] ) ) : '#000000';

		if ( null === $h_offset || null === $v_offset || null === $blur ) {
			return null;
		}

		return [
			'h_offset' => $h_offset,
			'v_offset' => $v_offset,
			'blur' => $blur,
			'color' => $color
		];
	}

	private function parse_border_radius_value( string $css_value ): ?array {
		$values = preg_split( '/\s+/', trim( $css_value ) );
		$count = count( $values );

		if ( 0 === $count || $count > 4 ) {
			return null;
		}

		$parsed_values = [];
		foreach ( $values as $value ) {
			$parsed = $this->parse_size_value( $value );
			if ( null === $parsed ) {
				return null;
			}
			$parsed_values[] = $parsed;
		}

		switch ( $count ) {
			case 1:
				return [
					'top_left' => $parsed_values[0],
					'top_right' => $parsed_values[0],
					'bottom_right' => $parsed_values[0],
					'bottom_left' => $parsed_values[0],
				];
			case 2:
				return [
					'top_left' => $parsed_values[0],
					'top_right' => $parsed_values[1],
					'bottom_right' => $parsed_values[0],
					'bottom_left' => $parsed_values[1],
				];
			case 3:
				return [
					'top_left' => $parsed_values[0],
					'top_right' => $parsed_values[1],
					'bottom_right' => $parsed_values[2],
					'bottom_left' => $parsed_values[1],
				];
			case 4:
				return [
					'top_left' => $parsed_values[0],
					'top_right' => $parsed_values[1],
					'bottom_right' => $parsed_values[2],
					'bottom_left' => $parsed_values[3],
				];
		}

		return null;
	}

	private function initialize_supported_prop_types(): void {
		$this->supported_prop_types = [
			'size',
			'color',
			'dimensions',
			'box-shadow',
			'shadow',
			'border-radius',
			'string',
			'number',
			'background',
			'flex',
			'position',
			'filter',
			'transform',
			'transition'
		];
	}
}
