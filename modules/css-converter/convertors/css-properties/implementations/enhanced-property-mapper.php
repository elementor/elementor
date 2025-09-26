<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// TODO: Replace with atomic widgets approach
// Needs atomic mapper update: Replace entire Enhanced_Property_Mapper with atomic widget-based mappers
class Enhanced_Property_Mapper {
	private string $property;

	public function __construct( string $property ) {
		$this->property = $property;
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports( $property ) ) {
			return null;
		}

		// Needs atomic mapper update: Replace with atomic widget research and implementation
		$atomic_result = $this->get_atomic_result( $property, $value );
		if ( ! $atomic_result ) {
			return null;
		}

		// For v4 atomic format, we need to return ['property' => 'name', 'value' => atomic_result]
		// But we need to map the property name to the schema property name
		$schema_property = $this->get_schema_property_name( $property );
		
		$result = [
			'property' => $schema_property,
			'value' => $atomic_result
		];
		
		return $result;
	}

	private function get_atomic_result( string $property, $value ): ?array {
		// Needs atomic mapper update: Replace switch statement with atomic widget prop type research
		switch ( $property ) {
			case 'color':
				// Needs atomic mapper update: Use Color_Prop_Type from atomic widgets
				return $this->create_color_property( $value );
			
			case 'background-color':
				// Needs atomic mapper update: Use Background_Prop_Type from atomic widgets
				return $this->create_background_property( $value );
			
			case 'background':
				// Needs atomic mapper update: Use Background_Prop_Type from atomic widgets
				return $this->create_background_property( $value );
			
			case 'font-size':
			case 'width':
			case 'height':
			case 'border-radius':
			case 'line-height':
				// Needs atomic mapper update: Use Size_Prop_Type from atomic widgets
				return $this->create_size_property( $value );
			
			case 'padding':
			case 'margin':
				// Needs atomic mapper update: Use Dimensions_Prop_Type from atomic widgets
				return $this->create_shorthand_size_property( $property, $value );
			
			case 'margin-top':
			case 'margin-right':
			case 'margin-bottom':
			case 'margin-left':
			case 'padding-top':
			case 'padding-right':
			case 'padding-bottom':
			case 'padding-left':
				// Needs atomic mapper update: Use Size_Prop_Type from atomic widgets
				return $this->create_size_property( $value );
			
			case 'font-weight':
				// Needs atomic mapper update: Use String_Prop_Type from atomic widgets
				return $this->create_font_weight_property( $value );
			
			case 'opacity':
			case 'z-index':
				// Needs atomic mapper update: Use Number_Prop_Type from atomic widgets
				return $this->create_number_property( $value );
			
			case 'display':
			case 'position':
			case 'flex-direction':
			case 'align-items':
			case 'justify-content':
			case 'text-align':
				// Needs atomic mapper update: Use String_Prop_Type from atomic widgets
				return $this->create_string_property( $value );
			
			default:
				// Needs atomic mapper update: Research atomic widget for this property
				return $this->create_string_property( $value );
		}
	}

	private function create_color_property( $value ): array {
		// Needs atomic mapper update: Use Color_Prop_Type structure from atomic widgets
		return [
			'$$type' => 'color',
			'value' => $this->normalize_color_value( $value )
		];
	}

	private function create_size_property( $value ): array {
		// Needs atomic mapper update: Use Size_Prop_Type structure from atomic widgets
		$parsed = $this->parse_size_value( $value );
		return [
			'$$type' => 'size',
			'value' => [
				'size' => $parsed['size'],
				'unit' => $parsed['unit']
			]
		];
	}

	private function create_number_property( $value ): array {
		// Needs atomic mapper update: Use Number_Prop_Type structure from atomic widgets
		return [
			'$$type' => 'number',
			'value' => $this->parse_numeric_value( $value )
		];
	}

	private function create_string_property( $value ): array {
		// Needs atomic mapper update: Use String_Prop_Type structure from atomic widgets
		return [
			'$$type' => 'string',
			'value' => (string) $value
		];
	}

	private function create_shorthand_size_property( string $property, $value ): array {
		// Needs atomic mapper update: Use Dimensions_Prop_Type structure from atomic widgets
		$value = trim( $value );
		$parts = preg_split( '/\s+/', $value );
		
		if ( count( $parts ) === 1 ) {
			// Single value: margin: 10px
			return $this->create_size_property( $value );
		}
		
		// For shorthand, we'll use the first value as the primary size
		// This is a simplified approach - in a full implementation, you might want to use dimensions type
		$first_value = $parts[0];
		return $this->create_size_property( $first_value );
	}

	private function create_background_property( $value ): array {
		// Needs atomic mapper update: Use Background_Prop_Type structure from atomic widgets
		$value = trim( $value );
		
		// Check if it's a gradient
		if ( preg_match( '/^(linear-gradient|radial-gradient|conic-gradient)\s*\(/', $value ) ) {
			return $this->create_background_gradient_property( $value );
		}
		
		// Handle solid colors (background-color or background: #color)
		if ( preg_match( '/^#[0-9a-fA-F]{3,6}$|^rgba?\(|^[a-zA-Z]+$/', $value ) ) {
			// Elementor expects 'background' prop type with direct color value
			return [
				'$$type' => 'background',
				'value' => [
					'color' => $this->normalize_color_value( $value )
				]
			];
		}
		
		// For other background values (images, etc.), store as string
		return [
			'$$type' => 'string',
			'value' => $value
		];
	}

	private function create_font_weight_property( $value ): array {
		// Needs atomic mapper update: Use String_Prop_Type structure from atomic widgets
		$weight_mappings = [
			'normal' => '400',
			'bold' => '700',
			'bolder' => '900',
			'lighter' => '300'
		];
		
		$string_value = $weight_mappings[ strtolower( trim( $value ) ) ] ?? (string) $value;
		
		return [
			'$$type' => 'string',
			'value' => $string_value
		];
	}

	private function normalize_color_value( $value ): string {
		$value = trim( $value );
		
		// Handle hex colors
		if ( preg_match( '/^#[0-9a-fA-F]{3,6}$/', $value ) ) {
			return strtolower( $value );
		}
		
		// Handle rgb/rgba colors
		if ( preg_match( '/^rgba?\(/', $value ) ) {
			return $value;
		}
		
		// Handle named colors
		$named_colors = [
			'red' => '#ff0000',
			'blue' => '#0000ff',
			'green' => '#008000',
			'black' => '#000000',
			'white' => '#ffffff',
			'transparent' => 'transparent'
		];
		
		return $named_colors[ strtolower( $value ) ] ?? $value;
	}

	private function parse_size_value( $value ): array {
		$value = trim( $value );
		
		if ( preg_match( '/^(-?\d*\.?\d+)(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)?$/i', $value, $matches ) ) {
			$size = (float) $matches[1];
			$unit = $matches[2] ?? '';
			
			// For unitless values (like line-height: 1.6), don't add px
			if ( empty( $unit ) && is_numeric( $value ) && (float) $value > 0 && (float) $value < 10 ) {
				// Likely a unitless line-height or similar
				$unit = '';
			} else if ( empty( $unit ) ) {
				// Default to px for other unitless values
				$unit = 'px';
			}
			
			return [
				'size' => $size,
				'unit' => strtolower( $unit )
			];
		}
		
		// Handle special values
		if ( in_array( strtolower( $value ), [ 'auto', 'inherit', 'initial', 'unset' ], true ) ) {
			return [
				'size' => 0.0,
				'unit' => 'px'
			];
		}
		
		return [
			'size' => 0.0,
			'unit' => 'px'
		];
	}

	private function parse_numeric_value( $value ) {
		$value = trim( $value );
		
		// Handle numeric values with precision fix
		if ( is_numeric( $value ) ) {
			$numeric = (float) $value;
			// Fix floating point precision issues
			return round( $numeric, 10 );
		}
		
		// Extract numeric part from values like "bold" -> 700
		$numeric_mappings = [
			'normal' => 400,
			'bold' => 700,
			'bolder' => 900,
			'lighter' => 300
		];
		
		$mapped_value = $numeric_mappings[ strtolower( $value ) ] ?? (float) $value;
		return round( $mapped_value, 10 );
	}

	public function map_to_schema( string $property, $value ): ?array {
		// Needs atomic mapper update: Replace with atomic widget schema mapping
		$atomic_result = $this->get_atomic_result( $property, $value );
		
		if ( ! $atomic_result ) {
			return null;
		}
		
		// Map CSS property names to Elementor schema property names
		$schema_property = $this->get_schema_property_name( $property );
		
		// Return in schema format expected by global class conversion
		return [ $schema_property => $atomic_result ];
	}

	private function get_schema_property_name( string $css_property ): string {
		// Needs atomic mapper update: Use atomic widget property name mapping
		$property_mappings = [
			'background-color' => 'background',  // CSS background-color -> Elementor background
		];
		
		return $property_mappings[ $css_property ] ?? $css_property;
	}

	private function create_background_gradient_property( $value ): array {
		// Needs atomic mapper update: Use Background_Prop_Type gradient structure from atomic widgets
		$gradient_data = $this->parse_gradient_to_elementor_format( $value );

		// Create the proper nested Elementor background structure
		$background_value = [
			'background-overlay' => [
				'$$type' => 'background-overlay',
				'value' => [
					[
						'$$type' => 'background-gradient-overlay',
						'value' => $gradient_data,
					],
				],
			],
		];

		return [
			'$$type' => 'background',
			'value' => $background_value
		];
	}

	private function parse_gradient_to_elementor_format( string $value ): array {
		// Needs atomic mapper update: Use atomic widget gradient parsing
		if ( preg_match( '/linear-gradient\s*\(\s*([^,]+),\s*(.+)\s*\)/', $value, $matches ) ) {
			$angle_part = trim( $matches[1] );
			$colors_part = trim( $matches[2] );

			// Extract angle (default to 0 if not specified)
			$angle = 0;
			if ( preg_match( '/(\d+)deg/', $angle_part, $angle_matches ) ) {
				$angle = (int) $angle_matches[1];
			}

			// Parse color stops in Elementor format
			$stops = $this->parse_color_stops_elementor_format( $colors_part );

			return [
				'type' => [
					'$$type' => 'string',
					'value' => 'linear',
				],
				'angle' => [
					'$$type' => 'number',
					'value' => $angle,
				],
				'stops' => [
					'$$type' => 'gradient-color-stop',
					'value' => $stops,
				],
			];
		}

		// Parse radial-gradient
		if ( preg_match( '/radial-gradient\s*\(\s*(.+)\s*\)/', $value, $matches ) ) {
			$content = trim( $matches[1] );
			
			// For now, simple parsing - can be enhanced later
			$stops = $this->parse_color_stops_elementor_format( $content );

			return [
				'type' => [
					'$$type' => 'string',
					'value' => 'radial',
				],
				'angle' => [
					'$$type' => 'number',
					'value' => 0,
				],
				'stops' => [
					'$$type' => 'gradient-color-stop',
					'value' => $stops,
				],
			];
		}

		// Fallback - shouldn't reach here if is_gradient() worked correctly
		return [
			'type' => [
				'$$type' => 'string',
				'value' => 'linear',
			],
			'angle' => [
				'$$type' => 'number',
				'value' => 0,
			],
			'stops' => [
				'$$type' => 'gradient-color-stop',
				'value' => [],
			],
		];
	}

	private function parse_color_stops_elementor_format( string $colors_part ): array {
		// Needs atomic mapper update: Use atomic widget color stop parsing
		$colors = [];
		$current_color = '';
		$paren_count = 0;
		
		for ( $i = 0; $i < strlen( $colors_part ); $i++ ) {
			$char = $colors_part[ $i ];
			
			if ( $char === '(' ) {
				$paren_count++;
			} elseif ( $char === ')' ) {
				$paren_count--;
			} elseif ( $char === ',' && $paren_count === 0 ) {
				$colors[] = trim( $current_color );
				$current_color = '';
				continue;
			}
			
			$current_color .= $char;
		}
		
		// Add the last color
		if ( ! empty( $current_color ) ) {
			$colors[] = trim( $current_color );
		}

		$stops = [];
		foreach ( $colors as $index => $color ) {
			$color = trim( $color );
			
			// Extract color and position
			$position = $index * ( 100 / ( count( $colors ) - 1 ) ); // Default even distribution
			
			// Check if position is specified (e.g., "#ff0000 25%")
			if ( preg_match( '/^(.+?)\s+(\d+)%$/', $color, $matches ) ) {
				$color = trim( $matches[1] );
				$position = (int) $matches[2];
			}

			$stops[] = [
				'$$type' => 'color-stop',
				'value' => [
					'color' => [
						'$$type' => 'color',
						'value' => $this->normalize_color_value( $color ),
					],
					'offset' => [
						'$$type' => 'number',
						'value' => $position,
					],
				],
			];
		}

		return $stops;
	}

	public function supports( string $property, $value = null ): bool {
		return $this->property === $property;
	}

	public function get_supported_properties(): array {
		return [ $this->property ];
	}

	public function get_property(): string {
		return $this->property;
	}
}
