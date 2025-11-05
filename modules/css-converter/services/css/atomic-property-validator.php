<?php
namespace Elementor\Modules\CssConverter\Services\Css;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Property_Validator {

	private $supported_properties = [];

	public function __construct() {
		$this->init_supported_properties();
	}

	public function is_property_supported( string $property ): bool {
		return isset( $this->supported_properties[ $property ] );
	}

	public function is_value_supported( string $property, string $value ): bool {
		if ( ! $this->is_property_supported( $property ) ) {
			return false;
		}

		$property_config = $this->supported_properties[ $property ];

		if ( $property === 'align-self' ) {
			$log_file = WP_CONTENT_DIR . '/align-self-debug.log';
			file_put_contents( $log_file, "\n  🔍 VALIDATOR::is_value_supported()\n", FILE_APPEND );
			file_put_contents( $log_file, "    Property: {$property}\n", FILE_APPEND );
			file_put_contents( $log_file, "    Value to check: '{$value}'\n", FILE_APPEND );
			file_put_contents( $log_file, "    Property type: {$property_config['type']}\n", FILE_APPEND );
		}

		if ( $property_config['type'] === 'enum' ) {
			$is_supported = in_array( $value, $property_config['values'], true );
			
			if ( $property === 'align-self' ) {
				$log_file = WP_CONTENT_DIR . '/align-self-debug.log';
				file_put_contents( $log_file, "    Type is ENUM - checking against allowed values...\n", FILE_APPEND );
				file_put_contents( $log_file, "    Allowed values: " . implode( ', ', $property_config['values'] ) . "\n", FILE_APPEND );
				file_put_contents( $log_file, "    Is '{$value}' in array? " . ( $is_supported ? 'YES ✅' : 'NO ❌' ) . "\n", FILE_APPEND );
			}
			
			return $is_supported;
		}

		if ( $property_config['type'] === 'any' ) {
			return true;
		}

		if ( $property_config['type'] === 'size' ) {
			return $this->is_valid_size_value( $value );
		}

		if ( $property_config['type'] === 'color' ) {
			return $this->is_valid_color_value( $value );
		}

		return false;
	}

	public function get_unsupported_reason( string $property, string $value ): string {
		if ( ! $this->is_property_supported( $property ) ) {
			return "Property '{$property}' not in atomic schema";
		}

		$property_config = $this->supported_properties[ $property ];

		if ( $property_config['type'] === 'enum' ) {
			$allowed_values = implode( ', ', $property_config['values'] );
			return "Value '{$value}' not supported for '{$property}' (allowed: {$allowed_values})";
		}

		return "Value '{$value}' not valid for '{$property}' type '{$property_config['type']}'";
	}

	private function init_supported_properties(): void {
		$this->supported_properties = [
			// Layout Properties
			'display' => [
				'type' => 'enum',
				'values' => [
					'block',
					'inline',
					'inline-block',
					'flex',
					'inline-flex',
					'grid',
					'inline-grid',
					'flow-root',
					'none',
					'contents',
				],
			],
			'flex-direction' => [
				'type' => 'enum',
				'values' => [
					'row',
					'row-reverse',
					'column',
					'column-reverse',
				],
			],
			'flex-wrap' => [
				'type' => 'enum',
				'values' => [
					'wrap',
					'nowrap',
					'wrap-reverse',
				],
			],

			// Alignment Properties
			'justify-content' => [
				'type' => 'enum',
				'values' => [
					'center',
					'start',
					'end',
					'flex-start',
					'flex-end',
					'left',
					'right',
					'normal',
					'space-between',
					'space-around',
					'space-evenly',
					'stretch',
				],
			],
			'align-content' => [
				'type' => 'enum',
				'values' => [
					'center',
					'start',
					'end',
					'space-between',
					'space-around',
					'space-evenly',
				],
			],
			'align-items' => [
				'type' => 'enum',
				'values' => [
					'normal',
					'stretch',
					'center',
					'start',
					'end',
					'flex-start',
					'flex-end',
					'self-start',
					'self-end',
					'anchor-center',
				],
			],
			'align-self' => [
				'type' => 'enum',
				'values' => [
					'auto',
					'normal',
					'center',
					'start',
					'end',
					'self-start',
					'self-end',
					'flex-start',
					'flex-end',
					'anchor-center',
					'baseline',
					'first baseline',
					'last baseline',
					'stretch',
				],
			],

			// Size Properties
			'width' => [ 'type' => 'size' ],
			'height' => [ 'type' => 'size' ],
			'min-width' => [ 'type' => 'size' ],
			'min-height' => [ 'type' => 'size' ],
			'max-width' => [ 'type' => 'size' ],
			'max-height' => [ 'type' => 'size' ],
			'overflow' => [
				'type' => 'enum',
				'values' => [
					'visible',
					'hidden',
					'auto',
				],
			],

			// Position Properties
			'position' => [
				'type' => 'enum',
				'values' => [
					'static',
					'relative',
					'absolute',
					'fixed',
					'sticky',
				],
			],
			'inset-block-start' => [ 'type' => 'size' ],
			'inset-inline-end' => [ 'type' => 'size' ],
			'inset-block-end' => [ 'type' => 'size' ],
			'inset-inline-start' => [ 'type' => 'size' ],
			'z-index' => [ 'type' => 'any' ],

			// Spacing Properties
			'margin' => [ 'type' => 'any' ],
			'margin-top' => [ 'type' => 'size' ],
			'margin-right' => [ 'type' => 'size' ],
			'margin-bottom' => [ 'type' => 'size' ],
			'margin-left' => [ 'type' => 'size' ],
			'margin-block-start' => [ 'type' => 'size' ],
			'margin-block-end' => [ 'type' => 'size' ],
			'margin-inline-start' => [ 'type' => 'size' ],
			'margin-inline-end' => [ 'type' => 'size' ],
			'padding' => [ 'type' => 'any' ],
			'padding-top' => [ 'type' => 'size' ],
			'padding-right' => [ 'type' => 'size' ],
			'padding-bottom' => [ 'type' => 'size' ],
			'padding-left' => [ 'type' => 'size' ],
			'padding-block-start' => [ 'type' => 'size' ],
			'padding-block-end' => [ 'type' => 'size' ],
			'padding-inline-start' => [ 'type' => 'size' ],
			'padding-inline-end' => [ 'type' => 'size' ],

			// Typography Properties
			'font-family' => [ 'type' => 'any' ],
			'font-size' => [ 'type' => 'size' ],
			'font-weight' => [ 'type' => 'any' ],
			'font-style' => [ 'type' => 'any' ],
			'line-height' => [ 'type' => 'any' ],
			'letter-spacing' => [ 'type' => 'size' ],
			'word-spacing' => [ 'type' => 'size' ],
			'text-align' => [ 'type' => 'any' ],
			'text-decoration' => [ 'type' => 'any' ],
			'text-transform' => [ 'type' => 'any' ],
			'text-shadow' => [ 'type' => 'any' ],
			'color' => [ 'type' => 'color' ],

			// Background Properties
			'background' => [ 'type' => 'any' ],
			'background-color' => [ 'type' => 'color' ],
			'background-image' => [ 'type' => 'any' ],
			'background-size' => [ 'type' => 'any' ],
			'background-position' => [ 'type' => 'any' ],
			'background-repeat' => [ 'type' => 'any' ],
			'background-attachment' => [ 'type' => 'any' ],

			// Border Properties
			'border' => [ 'type' => 'any' ],
			'border-top' => [ 'type' => 'any' ],
			'border-right' => [ 'type' => 'any' ],
			'border-bottom' => [ 'type' => 'any' ],
			'border-left' => [ 'type' => 'any' ],
			'border-width' => [ 'type' => 'any' ],
			'border-style' => [ 'type' => 'any' ],
			'border-color' => [ 'type' => 'color' ],
			'border-radius' => [ 'type' => 'any' ],

			// Effects Properties
			'opacity' => [ 'type' => 'any' ],
			'box-shadow' => [ 'type' => 'any' ],
			'filter' => [ 'type' => 'any' ],
			'backdrop-filter' => [ 'type' => 'any' ],
			'transform' => [ 'type' => 'any' ],
			'transition' => [ 'type' => 'any' ],
			'mix-blend-mode' => [
				'type' => 'enum',
				'values' => [
					'normal',
					'multiply',
					'screen',
					'overlay',
					'darken',
					'lighten',
					'color-dodge',
					'saturation',
					'color',
					'difference',
					'exclusion',
					'hue',
					'luminosity',
					'soft-light',
					'hard-light',
					'color-burn',
				],
			],

			// Flexbox Properties
			'flex' => [ 'type' => 'any' ],
			'flex-grow' => [ 'type' => 'any' ],
			'flex-shrink' => [ 'type' => 'any' ],
			'flex-basis' => [ 'type' => 'size' ],
			'gap' => [ 'type' => 'any' ],
			'row-gap' => [ 'type' => 'size' ],
			'column-gap' => [ 'type' => 'size' ],
			'order' => [ 'type' => 'any' ],

			// Other Properties
			'aspect-ratio' => [ 'type' => 'any' ],
			'object-fit' => [
				'type' => 'enum',
				'values' => [
					'fill',
					'cover',
					'contain',
					'none',
					'scale-down',
				],
			],
			'object-position' => [ 'type' => 'any' ],
		];
	}

	private function is_valid_size_value( string $value ): bool {
		if ( in_array( $value, [ 'initial', 'inherit', 'unset', 'revert' ], true ) ) {
			return false;
		}
		
		// Allow 'auto' as a valid size value for dimensions
		if ( $value === 'auto' ) {
			return true;
		}
		
		// Reject problematic minimal values that cause layout collapse
		if ( $value === '1px' || $value === '0px' ) {
			return false;
		}

		if ( is_numeric( $value ) ) {
			return true;
		}

		$size_pattern = '/^-?\d*\.?\d+(px|em|rem|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/';
		return preg_match( $size_pattern, $value );
	}

	private function is_valid_color_value( string $value ): bool {
		if ( in_array( $value, [ 'initial', 'inherit', 'unset', 'revert' ], true ) ) {
			return false;
		}

		$color_patterns = [
			'/^#[0-9a-fA-F]{3,8}$/',
			'/^rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/',
			'/^rgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/',
			'/^hsl\s*\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/',
			'/^hsla\s*\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/',
			'/^var\s*\(\s*--[a-zA-Z0-9_-]+\s*\)$/',
		];

		foreach ( $color_patterns as $pattern ) {
			if ( preg_match( $pattern, $value ) ) {
				return true;
			}
		}

		$named_colors = [
			'transparent', 'currentColor', 'black', 'white', 'red', 'green', 'blue',
			'yellow', 'cyan', 'magenta', 'gray', 'grey', 'orange', 'purple', 'pink',
		];

		return in_array( strtolower( $value ), $named_colors, true );
	}

	public function is_css_keyword( string $value ): bool {
		$css_keywords = [ 'initial', 'inherit', 'unset', 'revert', 'revert-layer' ];
		return in_array( $value, $css_keywords, true );
	}
}
