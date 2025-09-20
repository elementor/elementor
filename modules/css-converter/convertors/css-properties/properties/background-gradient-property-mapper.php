<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Background_Gradient_Property_Mapper extends Property_Mapper_Base {
	const SUPPORTED_PROPERTIES = [ 'background', 'background-image' ];

	public function supports( string $property, $value ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true ) && 
			   is_string( $value ) && 
			   $this->is_gradient( $value );
	}

	public function map_to_schema( string $property, $value ): array {
		$parsed = $this->parse_gradient( $value );
		
		return [
			$property => [
				'$$type' => 'background-gradient-overlay',
				'value' => $parsed,
			],
		];
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function get_v4_property_name( string $css_property ): string {
		return 'background';
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports( $property, $value ) ) {
			return null;
		}

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

		return $this->create_v4_property_with_type( 
			$property, 
			'background', 
			$background_value 
		);
	}

	private function is_gradient( string $value ): bool {
		return preg_match( '/(?:linear|radial|conic)-gradient\s*\(/', $value );
	}

	private function parse_gradient_to_elementor_format( string $value ): array {
		// Parse linear-gradient(45deg, #667eea, #764ba2)
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

	private function parse_gradient( string $value ): array {
		// Parse linear-gradient(45deg, #667eea, #764ba2)
		if ( preg_match( '/linear-gradient\s*\(\s*([^,]+),\s*(.+)\s*\)/', $value, $matches ) ) {
			$angle_part = trim( $matches[1] );
			$colors_part = trim( $matches[2] );

			// Extract angle (default to 0 if not specified)
			$angle = 0;
			if ( preg_match( '/(\d+)deg/', $angle_part, $angle_matches ) ) {
				$angle = (int) $angle_matches[1];
			}

			// Parse color stops - return as string for transformer compatibility
			$stops_string = $this->parse_color_stops_as_string( $colors_part );

			return [
				'type' => 'linear',
				'angle' => $angle,
				'positions' => 'center center', // Default for linear
				'stops' => $stops_string,
			];
		}

		// Parse radial-gradient
		if ( preg_match( '/radial-gradient\s*\(\s*(.+)\s*\)/', $value, $matches ) ) {
			$content = trim( $matches[1] );
			
			// For now, simple parsing - can be enhanced later
			$stops_string = $this->parse_color_stops_as_string( $content );

			return [
				'type' => 'radial',
				'angle' => 0,
				'positions' => 'center center',
				'stops' => $stops_string,
			];
		}

		// Fallback - shouldn't reach here if is_gradient() worked correctly
		return [
			'type' => 'linear',
			'angle' => 0,
			'positions' => 'center center',
			'stops' => [],
		];
	}

	private function parse_color_stops( string $colors_part ): array {
		// Split by comma, but be careful of rgba() values that contain commas
		$color_strings = $this->split_color_stops( $colors_part );
		$stops = [];
		$position = 0;
		$increment = count( $color_strings ) > 1 ? 100 / ( count( $color_strings ) - 1 ) : 0;

		foreach ( $color_strings as $color_string ) {
			$color_string = trim( $color_string );
			
			// Extract color (remove any position info for now)
			$color = $this->extract_color_from_stop( $color_string );
			
			if ( $color ) {
				$stops[] = [
					'$$type' => 'color-stop',
					'value' => [
						'color' => [
							'$$type' => 'color',
							'value' => $color,
						],
						'offset' => $position,
					],
				];
			}
			
			$position += $increment;
		}

		return $stops;
	}

	private function parse_color_stops_elementor_format( string $colors_part ): array {
		// Split by comma, but be careful of rgba() values that contain commas
		$color_strings = $this->split_color_stops( $colors_part );
		$stops = [];
		$position = 0;
		$increment = count( $color_strings ) > 1 ? 100 / ( count( $color_strings ) - 1 ) : 0;

		foreach ( $color_strings as $color_string ) {
			$color_string = trim( $color_string );
			
			// Extract color (remove any position info for now)
			$color = $this->extract_color_from_stop( $color_string );
			
			if ( $color ) {
				$stops[] = [
					'$$type' => 'color-stop',
					'value' => [
						'color' => [
							'$$type' => 'color',
							'value' => $color,
						],
						'offset' => [
							'$$type' => 'number',
							'value' => $position,
						],
					],
				];
			}
			
			$position += $increment;
		}

		return $stops;
	}

	private function parse_color_stops_as_string( string $colors_part ): string {
		// Split by comma, but be careful of rgba() values that contain commas
		$color_strings = $this->split_color_stops( $colors_part );
		$stops_array = [];
		$position = 0;
		$increment = count( $color_strings ) > 1 ? 100 / ( count( $color_strings ) - 1 ) : 0;

		foreach ( $color_strings as $color_string ) {
			$color_string = trim( $color_string );
			
			// Extract color (remove any position info for now)
			$color = $this->extract_color_from_stop( $color_string );
			
			if ( $color ) {
				// Format as "color position%" for CSS gradient
				$stops_array[] = $color . ' ' . $position . '%';
			}
			
			$position += $increment;
		}

		return implode( ', ', $stops_array );
	}

	private function split_color_stops( string $colors_part ): array {
		// Simple split by comma - can be enhanced to handle rgba() properly
		$parts = explode( ',', $colors_part );
		$result = [];
		$buffer = '';

		foreach ( $parts as $part ) {
			$buffer .= $part;
			
			// Check if we have balanced parentheses
			if ( substr_count( $buffer, '(' ) === substr_count( $buffer, ')' ) ) {
				$result[] = trim( $buffer );
				$buffer = '';
			} else {
				$buffer .= ','; // Add back the comma we split on
			}
		}

		// Add any remaining buffer
		if ( ! empty( $buffer ) ) {
			$result[] = trim( $buffer );
		}

		return $result;
	}

	private function extract_color_from_stop( string $color_stop ): ?string {
		// Remove percentage positions like "50%" from the end
		$color_stop = preg_replace( '/\s+\d+%\s*$/', '', $color_stop );
		
		// Return the cleaned color
		return trim( $color_stop ) ?: null;
	}
}
