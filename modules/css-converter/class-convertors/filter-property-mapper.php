<?php
namespace Elementor\Modules\CssConverter\ClassConvertors;

require_once __DIR__ . '/unified-property-mapper-base.php';

class Filter_Property_Mapper extends Unified_Property_Mapper_Base {
	const SUPPORTED_PROPERTIES = [ 'filter' ];
	const FILTER_FUNCTIONS = [
		'blur',
		'brightness',
		'contrast',
		'drop-shadow',
		'grayscale',
		'hue-rotate',
		'invert',
		'opacity',
		'saturate',
		'sepia',
	];

	public function supports( string $property, $value ): bool {
		return $property === 'filter' && is_string( $value ) && strlen( trim( $value ) ) > 0;
	}

	public function map_to_schema( string $property, $value ): array {
		$parsed = $this->parse_filter( $value );
		return [
			'filter' => [
				'$$type' => 'filter',
				'value' => $parsed,
			],
		];
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	private function parse_filter( string $value ): array {
		$filters = [];
		preg_match_all( '/([a-z-]+)\(([^)]+)\)/i', $value, $matches, PREG_SET_ORDER );
		foreach ( $matches as $match ) {
			$func = strtolower( $match[1] );
			$raw = trim( $match[2] );

			// Parse the argument based on function type
			$args = $this->parse_filter_args( $func, $raw );

			$filters[] = [
				'$$type' => 'css-filter-func',
				'value' => [
					'func' => [
						'$$type' => 'string',
						'value' => $func,
					],
					'args' => $args,
				],
			];
		}
		return $filters;
	}

	private function parse_filter_args( string $func, string $raw ) {
		switch ( $func ) {
			case 'blur':
				// Parse as blur filter type
				if ( preg_match( '/^(-?\d*\.?\d+)([a-z%]*)$/', $raw, $m ) ) {
					return [
						'$$type' => 'blur',
						'value' => [
							'size' => [
								'$$type' => 'size',
								'value' => [
									'size' => (float) $m[1],
									'unit' => $m[2] ?: 'px',
								],
							],
						],
					];
				}
				return [
					'$$type' => 'blur',
					'value' => [
						'size' => [
							'$$type' => 'size',
							'value' => [
								'size' => 0,
								'unit' => 'px',
							],
						],
					],
				];

			case 'brightness':
			case 'contrast':
			case 'grayscale':
			case 'invert':
			case 'saturate':
			case 'sepia':
				// Parse as intensity filter type
				if ( preg_match( '/^(-?\d*\.?\d+)%?$/', $raw, $m ) ) {
					$val = (float) $m[1];
					// Convert percentage to decimal if needed
					if ( strpos( $raw, '%' ) !== false ) {
						$val = $val / 100;
					}
					return [
						'$$type' => 'intensity',
						'value' => [
							'size' => [
								'$$type' => 'size',
								'value' => [
									'size' => $val,
									'unit' => '',
								],
							],
						],
					];
				}
				return [
					'$$type' => 'intensity',
					'value' => [
						'size' => [
							'$$type' => 'size',
							'value' => [
								'size' => 1.0,
								'unit' => '',
							],
						],
					],
				];

			case 'hue-rotate':
				// Parse as hue-rotate filter type
				if ( preg_match( '/^(-?\d*\.?\d+)(deg|rad|turn)?$/', $raw, $m ) ) {
					return [
						'$$type' => 'hue-rotate',
						'value' => [
							'size' => [
								'$$type' => 'size',
								'value' => [
									'size' => (float) $m[1],
									'unit' => $m[2] ?: 'deg',
								],
							],
						],
					];
				}
				return [
					'$$type' => 'hue-rotate',
					'value' => [
						'size' => [
							'$$type' => 'size',
							'value' => [
								'size' => 0,
								'unit' => 'deg',
							],
						],
					],
				];

			default:
				// Fallback: return as intensity type
				return [
					'$$type' => 'intensity',
					'value' => [
						'size' => [
							'$$type' => 'size',
							'value' => [
								'size' => 1.0,
								'unit' => '',
							],
						],
					],
				];
		}
	}
}
