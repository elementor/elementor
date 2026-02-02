<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Body_Styles_Processor implements Css_Processor_Interface {

	private $specificity_calculator;

	public function __construct() {
		$this->specificity_calculator = new Css_Specificity_Calculator();
	}

	public function get_processor_name(): string {
		return 'body-styles';
	}

	public function get_priority(): int {
		return 11;
	}

	public function supports_context( Css_Processing_Context $context ): bool {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		return ! empty( $css_rules );
	}

	public function process( Css_Processing_Context $context ): Css_Processing_Context {
		$css_rules = $context->get_metadata( 'css_rules', [] );

		if ( empty( $css_rules ) ) {
			return $context;
		}

		$body_styles = $this->extract_body_styles( $css_rules );
		$context->set_metadata( 'body_styles', $body_styles );

		if ( ! empty( $body_styles ) ) {
		}

		return $context;
	}

	public function get_statistics_keys(): array {
		return [ 'body_styles_extracted' ];
	}

	private function extract_body_styles( array $css_rules ): array {
		$body_rules = [];
		$html_rules = [];


		$found_1140_selectors = [];
		foreach ( $css_rules as $rule ) {
			$selector = trim( $rule['selector'] ?? '' );
			if ( strpos( $selector, 'elementor-page-1140' ) !== false ) {
				$found_1140_selectors[] = $selector;
			}
		}
		if ( ! empty( $found_1140_selectors ) ) {
		}

		foreach ( $css_rules as $rule ) {
			$selector = trim( $rule['selector'] ?? '' );
			$properties = $rule['properties'] ?? [];

			if ( empty( $properties ) ) {
				continue;
			}

			$properties = $this->expand_margin_padding_shorthand( $properties );

			if ( strpos( $selector, 'body' ) !== false || strpos( $selector, 'elementor-page-' ) !== false ) {
				if ( strpos( $selector, 'elementor-page-1140' ) !== false ) {
				}
			}

			if ( $this->is_body_selector( $selector ) ) {
				$important = false;
				foreach ( $properties as $prop ) {
					if ( ! empty( $prop['important'] ) ) {
						$important = true;
						break;
					}
				}
				$specificity = $this->specificity_calculator->calculate_specificity( $selector, $important );
				$body_rules[] = [
					'selector' => $selector,
					'properties' => $properties,
					'specificity' => $specificity,
				];
			}

			if ( $this->is_html_selector( $selector ) ) {
				$important = false;
				foreach ( $properties as $prop ) {
					if ( ! empty( $prop['important'] ) ) {
						$important = true;
						break;
					}
				}
				$specificity = $this->specificity_calculator->calculate_specificity( $selector, $important );
				$html_rules[] = [
					'selector' => $selector,
					'properties' => $properties,
					'specificity' => $specificity,
				];
			}
		}

		$merged_rules = array_merge( $body_rules, $html_rules );

		if ( empty( $merged_rules ) ) {
			return [];
		}

		usort( $merged_rules, function( $a, $b ) {
			return $a['specificity'] <=> $b['specificity'];
		} );

		$resolved_styles = $this->resolve_conflicting_styles( $merged_rules );

		$elementor_format = $this->convert_to_elementor_format( $resolved_styles );
		if ( isset( $elementor_format['margin'] ) ) {
			$margin = $elementor_format['margin'];
		}
		if ( isset( $elementor_format['padding'] ) ) {
			$padding = $elementor_format['padding'];
		}

		return $elementor_format;
	}

	private function is_body_selector( string $selector ): bool {
		$normalized = trim( strtolower( $selector ) );
		
		if ( $normalized === 'body' ) {
			return true;
		}
		
		if ( preg_match( '/^body\s*[>,\s\.#:]/', $normalized ) ) {
			return true;
		}
		
		if ( preg_match( '/,\s*body\s*[>,\s\.#:]|,\s*body$/', $normalized ) ) {
			return true;
		}
		
		if ( preg_match( '/^body\.[a-zA-Z0-9_-]+/', $normalized ) ) {
			return true;
		}
		
		if ( preg_match( '/^body\s*:not\(/', $normalized ) ) {
			return true;
		}
		
		if ( preg_match( '/^body\s*>/', $normalized ) ) {
			return true;
		}
		
		if ( preg_match( '/^body\.elementor-page-[a-zA-Z0-9_-]+/', $normalized ) ) {
			return true;
		}
		
		if ( preg_match( '/^body\.elementor-page-[a-zA-Z0-9_-]+\s*:not\(/', $normalized ) ) {
			return true;
		}
		
		$parts = preg_split( '/\s*,\s*/', $normalized );
		foreach ( $parts as $part ) {
			$part = trim( $part );
			if ( strpos( $part, 'body' ) === 0 ) {
				if ( preg_match( '/^body(\.[a-zA-Z0-9_-]+|:not\(|>|\s|$)/', $part ) ) {
					return true;
				}
				if ( preg_match( '/^body\.elementor-page-[a-zA-Z0-9_-]+/', $part ) ) {
					return true;
				}
				if ( preg_match( '/^body\.elementor-page-[a-zA-Z0-9_-]+\s*:not\(/', $part ) ) {
					return true;
				}
				if ( preg_match( '/^body\.elementor-page-[a-zA-Z0-9_-]+\s*>/', $part ) ) {
					return true;
				}
			}
		}
		
		return false;
	}

	private function is_html_selector( string $selector ): bool {
		$normalized = trim( strtolower( $selector ) );
		if ( $normalized === 'html' ) {
			return true;
		}
		if ( preg_match( '/^html\s*[>,\s\.#:]/', $normalized ) ) {
			return true;
		}
		if ( preg_match( '/,\s*html\s*[>,\s\.#:]|,\s*html$/', $normalized ) ) {
			return true;
		}
		return false;
	}

	private function resolve_conflicting_styles( array $rules ): array {
		$resolved = [];

		foreach ( $rules as $rule ) {
			foreach ( $rule['properties'] as $property ) {
				$property_name = $property['property'] ?? '';
				$property_value = $property['value'] ?? '';
				$important = $property['important'] ?? false;

				if ( empty( $property_name ) || empty( $property_value ) ) {
					continue;
				}

				$key = $this->get_property_key( $property_name );

				if ( ! isset( $resolved[ $key ] ) ) {
					$resolved[ $key ] = [
						'property' => $property_name,
						'value' => $property_value,
						'important' => $important,
						'specificity' => $rule['specificity'],
					];
					continue;
				}

				$existing_important = $resolved[ $key ]['important'] ?? false;
				$existing_specificity = $resolved[ $key ]['specificity'] ?? 0;

				if ( $important && ! $existing_important ) {
					$resolved[ $key ] = [
						'property' => $property_name,
						'value' => $property_value,
						'important' => true,
						'specificity' => $rule['specificity'],
					];
				} elseif ( ! $important && $existing_important ) {
					continue;
				} elseif ( $rule['specificity'] > $existing_specificity ) {
					$resolved[ $key ] = [
						'property' => $property_name,
						'value' => $property_value,
						'important' => $important,
						'specificity' => $rule['specificity'],
					];
				}
			}
		}

		return $resolved;
	}

	private function get_property_key( string $property_name ): string {
		$normalized = strtolower( trim( $property_name ) );

		if ( $normalized === 'background' || strpos( $normalized, 'background-' ) === 0 ) {
			return 'background';
		}

		return $normalized;
	}

	private function convert_to_elementor_format( array $resolved_styles ): array {
		$elementor_settings = [];

		if ( isset( $resolved_styles['background'] ) ) {
			$background_settings = $this->convert_background( $resolved_styles['background']['value'] );
			if ( ! empty( $background_settings ) ) {
				$elementor_settings = array_merge( $elementor_settings, $background_settings );
			}
		}

		$has_margin = false;
		foreach ( $resolved_styles as $key => $style ) {
			if ( strpos( $key, 'margin-' ) === 0 ) {
				$has_margin = true;
				break;
			}
		}

		if ( $has_margin ) {
			$margin_settings = $this->convert_margin_padding_from_resolved( $resolved_styles, 'margin' );
			if ( ! empty( $margin_settings ) ) {
				$elementor_settings['margin'] = $margin_settings;
			}
		}

		$has_padding = false;
		foreach ( $resolved_styles as $key => $style ) {
			if ( strpos( $key, 'padding-' ) === 0 ) {
				$has_padding = true;
				break;
			}
		}

		if ( $has_padding ) {
			$padding_settings = $this->convert_margin_padding_from_resolved( $resolved_styles, 'padding' );
			if ( ! empty( $padding_settings ) ) {
				$elementor_settings['padding'] = $padding_settings;
			}
		}

		return $elementor_settings;
	}

	private function convert_background( string $css_value ): array {
		$css_value = trim( $css_value );

		if ( $this->is_gradient( $css_value ) ) {
			return $this->convert_gradient( $css_value );
		}

		if ( $this->is_color( $css_value ) ) {
			return [
				'background_background' => 'classic',
				'background_color' => $this->normalize_color( $css_value ),
			];
		}

		return [];
	}

	private function is_gradient( string $value ): bool {
		return false !== strpos( $value, 'gradient(' );
	}

	private function is_color( string $value ): bool {
		if ( str_starts_with( $value, '#' ) ) {
			return true;
		}

		if ( preg_match( '/^(rgb|rgba|hsl|hsla)\s*\(/', $value ) ) {
			return true;
		}

		$named_colors = [
			'transparent', 'black', 'white', 'red', 'green', 'blue', 'yellow',
			'cyan', 'magenta', 'gray', 'grey', 'orange', 'purple', 'pink',
			'brown', 'navy', 'teal', 'lime', 'olive', 'maroon', 'silver',
			'aqua', 'fuchsia', 'lightgray',
		];

		return in_array( strtolower( $value ), $named_colors, true );
	}

	private function normalize_color( string $color ): string {
		$color = trim( $color );
		return $color;
	}

	private function convert_gradient( string $css_value ): array {
		if ( false !== strpos( $css_value, 'linear-gradient' ) ) {
			return $this->convert_linear_gradient( $css_value );
		}

		if ( false !== strpos( $css_value, 'radial-gradient' ) ) {
			return $this->convert_radial_gradient( $css_value );
		}

		return [];
	}

	private function convert_linear_gradient( string $css_value ): array {
		if ( ! preg_match( '/linear-gradient\s*\(\s*([^)]+)\s*\)/', $css_value, $matches ) ) {
			return [];
		}

		$gradient_content = trim( $matches[1] );
		$parts = preg_split( '/,\s*(?![^()]*\))/', $gradient_content );

		if ( empty( $parts ) || count( $parts ) < 2 ) {
			return [];
		}

		$angle = $this->extract_gradient_angle( $parts[0] );
		$stops = $this->extract_gradient_stops( array_slice( $parts, 1 ) );

		if ( empty( $stops ) || count( $stops ) < 2 ) {
			return [];
		}

		$color_a = $stops[0]['color'] ?? '#000000';
		$color_b = $stops[ count( $stops ) - 1 ]['color'] ?? '#ffffff';
		$color_a_stop = $stops[0]['offset'] ?? 0;
		$color_b_stop = $stops[ count( $stops ) - 1 ]['offset'] ?? 100;

		return [
			'background_background' => 'gradient',
			'background_color' => $color_a,
			'background_color_b' => $color_b,
			'background_color_stop' => [
				'size' => $color_a_stop,
				'unit' => '%',
			],
			'background_color_b_stop' => [
				'size' => $color_b_stop,
				'unit' => '%',
			],
			'background_gradient_type' => 'linear',
			'background_gradient_angle' => [
				'size' => $angle,
				'unit' => 'deg',
			],
		];
	}

	private function convert_radial_gradient( string $css_value ): array {
		if ( ! preg_match( '/radial-gradient\s*\(\s*([^)]+)\s*\)/', $css_value, $matches ) ) {
			return [];
		}

		$gradient_content = trim( $matches[1] );
		$parts = preg_split( '/,\s*(?![^()]*\))/', $gradient_content );

		if ( empty( $parts ) || count( $parts ) < 2 ) {
			return [];
		}

		$position = 'center center';
		$stops_start_index = 0;

		if ( preg_match( '/^(at|circle|ellipse)/', trim( $parts[0] ) ) ) {
			$position = $this->extract_radial_position( $parts[0] );
			$stops_start_index = 1;
		}

		$stops = $this->extract_gradient_stops( array_slice( $parts, $stops_start_index ) );

		if ( empty( $stops ) || count( $stops ) < 2 ) {
			return [];
		}

		$color_a = $stops[0]['color'] ?? '#000000';
		$color_b = $stops[ count( $stops ) - 1 ]['color'] ?? '#ffffff';
		$color_a_stop = $stops[0]['offset'] ?? 0;
		$color_b_stop = $stops[ count( $stops ) - 1 ]['offset'] ?? 100;

		return [
			'background_background' => 'gradient',
			'background_color' => $color_a,
			'background_color_b' => $color_b,
			'background_color_stop' => [
				'size' => $color_a_stop,
				'unit' => '%',
			],
			'background_color_b_stop' => [
				'size' => $color_b_stop,
				'unit' => '%',
			],
			'background_gradient_type' => 'radial',
			'background_gradient_position' => $position,
		];
	}

	private function extract_gradient_angle( string $first_part ): float {
		$first_part = trim( $first_part );

		if ( preg_match( '/(\d+(?:\.\d+)?)\s*deg/', $first_part, $matches ) ) {
			return (float) $matches[1];
		}

		$direction_map = [
			'to top' => 0,
			'to right' => 90,
			'to bottom' => 180,
			'to left' => 270,
			'to top right' => 45,
			'to bottom right' => 135,
			'to bottom left' => 225,
			'to top left' => 315,
		];

		foreach ( $direction_map as $direction => $angle ) {
			if ( false !== strpos( $first_part, $direction ) ) {
				return $angle;
			}
		}

		return 180.0;
	}

	private function extract_radial_position( string $position_part ): string {
		if ( preg_match( '/at\s+([^,]+)/', $position_part, $matches ) ) {
			$position = trim( $matches[1] );
			$position_map = [
				'center center' => 'center center',
				'center' => 'center center',
				'top center' => 'top center',
				'bottom center' => 'bottom center',
				'center left' => 'center left',
				'center right' => 'center right',
				'top left' => 'top left',
				'top right' => 'top right',
				'bottom left' => 'bottom left',
				'bottom right' => 'bottom right',
			];

			return $position_map[ $position ] ?? 'center center';
		}

		return 'center center';
	}

	private function extract_gradient_stops( array $stop_parts ): array {
		$stops = [];

		foreach ( $stop_parts as $index => $stop_part ) {
			$stop_part = trim( $stop_part );
			$parts = preg_split( '/\s+/', $stop_part, 2 );

			if ( empty( $parts ) ) {
				continue;
			}

			$color = trim( $parts[0] );
			$position_str = isset( $parts[1] ) ? trim( $parts[1] ) : null;

			if ( ! $this->is_color( $color ) ) {
				continue;
			}

			$offset = 0;
			if ( $position_str && preg_match( '/(\d+(?:\.\d+)?)%/', $position_str, $matches ) ) {
				$offset = (float) $matches[1];
			} elseif ( count( $stop_parts ) > 1 ) {
				$offset = ( $index / ( count( $stop_parts ) - 1 ) ) * 100;
			}

			$stops[] = [
				'color' => $this->normalize_color( $color ),
				'offset' => $offset,
			];
		}

		return $stops;
	}

	private function convert_margin_padding_from_resolved( array $resolved_styles, string $property_prefix ): array {
		$top_value = null;
		$right_value = null;
		$bottom_value = null;
		$left_value = null;

		foreach ( $resolved_styles as $key => $style ) {
			if ( $key === $property_prefix ) {
				continue;
			}
			if ( strpos( $key, $property_prefix . '-' ) === 0 ) {
				$direction = str_replace( $property_prefix . '-', '', $key );
				if ( $direction === 'top' ) {
					$top_value = $style['value'] ?? null;
				} elseif ( $direction === 'right' ) {
					$right_value = $style['value'] ?? null;
				} elseif ( $direction === 'bottom' ) {
					$bottom_value = $style['value'] ?? null;
				} elseif ( $direction === 'left' ) {
					$left_value = $style['value'] ?? null;
				}
			}
		}

		if ( $top_value === null && $right_value === null && $bottom_value === null && $left_value === null ) {
			return [];
		}

		$top_parts = $this->parse_dimension( $top_value ?? '0' );
		$right_parts = $this->parse_dimension( $right_value ?? $top_value ?? '0' );
		$bottom_parts = $this->parse_dimension( $bottom_value ?? $top_value ?? '0' );
		$left_parts = $this->parse_dimension( $left_value ?? $right_value ?? $top_value ?? '0' );

		$unit = $top_parts['unit'];

		return [
			'top' => (string) $top_parts['size'],
			'right' => (string) $right_parts['size'],
			'bottom' => (string) $bottom_parts['size'],
			'left' => (string) $left_parts['size'],
			'unit' => $unit,
			'isLinked' => false,
		];
	}

	private function convert_dimensions( string $css_value, string $property_prefix ): array {
		$css_value = trim( $css_value );
		$values = preg_split( '/\s+/', $css_value );

		if ( empty( $values ) ) {
			return [];
		}

		$top = $values[0] ?? '0';
		$right = $values[1] ?? $top;
		$bottom = $values[2] ?? $top;
		$left = $values[3] ?? $right;

		$top_parts = $this->parse_dimension( $top );
		$right_parts = $this->parse_dimension( $right );
		$bottom_parts = $this->parse_dimension( $bottom );
		$left_parts = $this->parse_dimension( $left );

		return [
			"{$property_prefix}_top" => $top_parts['size'],
			"{$property_prefix}_top_unit" => $top_parts['unit'],
			"{$property_prefix}_right" => $right_parts['size'],
			"{$property_prefix}_right_unit" => $right_parts['unit'],
			"{$property_prefix}_bottom" => $bottom_parts['size'],
			"{$property_prefix}_bottom_unit" => $bottom_parts['unit'],
			"{$property_prefix}_left" => $left_parts['size'],
			"{$property_prefix}_left_unit" => $left_parts['unit'],
		];
	}

	private function parse_dimension( string $value ): array {
		$value = trim( $value );

		if ( $value === '0' || $value === 'auto' ) {
			return [
				'size' => $value === 'auto' ? '' : 0,
				'unit' => 'px',
			];
		}

		if ( preg_match( '/^(-?\d+(?:\.\d+)?)(px|%|em|rem|vw|vh|pt|pc|in|cm|mm|ex|ch|vmin|vmax)?$/', $value, $matches ) ) {
			return [
				'size' => (float) $matches[1],
				'unit' => $matches[2] ?? 'px',
			];
		}

		return [
			'size' => 0,
			'unit' => 'px',
		];
	}

	private function expand_margin_padding_shorthand( array $properties ): array {
		$expanded = [];
		$margin_value = null;
		$padding_value = null;

		foreach ( $properties as $property ) {
			$property_name = $property['property'] ?? '';
			$property_value = $property['value'] ?? '';
			$important = $property['important'] ?? false;

			if ( $property_name === 'margin' ) {
				$margin_value = $property_value;
				continue;
			}

			if ( $property_name === 'padding' ) {
				$padding_value = $property_value;
				continue;
			}

			if ( strpos( $property_name, 'margin-' ) === 0 || strpos( $property_name, 'padding-' ) === 0 ) {
				$expanded[] = $property;
			} else {
				$expanded[] = $property;
			}
		}

		if ( $margin_value !== null ) {
			$margin_parts = preg_split( '/\s+/', trim( $margin_value ) );
			$top = $margin_parts[0] ?? '0';
			$right = $margin_parts[1] ?? $top;
			$bottom = $margin_parts[2] ?? $top;
			$left = $margin_parts[3] ?? $right;

			$expanded[] = [
				'property' => 'margin-top',
				'value' => $top,
				'important' => false,
			];
			$expanded[] = [
				'property' => 'margin-right',
				'value' => $right,
				'important' => false,
			];
			$expanded[] = [
				'property' => 'margin-bottom',
				'value' => $bottom,
				'important' => false,
			];
			$expanded[] = [
				'property' => 'margin-left',
				'value' => $left,
				'important' => false,
			];
		}

		if ( $padding_value !== null ) {
			$padding_parts = preg_split( '/\s+/', trim( $padding_value ) );
			$top = $padding_parts[0] ?? '0';
			$right = $padding_parts[1] ?? $top;
			$bottom = $padding_parts[2] ?? $top;
			$left = $padding_parts[3] ?? $right;

			$expanded[] = [
				'property' => 'padding-top',
				'value' => $top,
				'important' => false,
			];
			$expanded[] = [
				'property' => 'padding-right',
				'value' => $right,
				'important' => false,
			];
			$expanded[] = [
				'property' => 'padding-bottom',
				'value' => $bottom,
				'important' => false,
			];
			$expanded[] = [
				'property' => 'padding-left',
				'value' => $left,
				'important' => false,
			];
		}

		return $expanded;
	}
}

