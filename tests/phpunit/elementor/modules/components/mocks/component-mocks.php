<?php

namespace Elementor\Testing\Modules\Components\Mocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Mocks {

	static array $component_1_data;
	static array $component_2_data;
	static array $invalid_component_data;

	/**
	 * Get mock data for component 1 (Header with title and image)
	 *
	 * @return array
	 */
	public static function get_component_1_data(): array {
		if ( ! isset( self::$component_1_data ) ) {
			$json_content = file_get_contents( __DIR__ . '/component-1.json' );

			self::$component_1_data = json_decode( $json_content, true );
		}

		return self::$component_1_data;
	}

	/**
	 * Get mock data for component 2 (Card with title, text, and button)
	 *
	 * @return array
	 */
	public static function get_component_2_data(): array {
		if ( ! isset( self::$component_2_data ) ) {
			$json_content = file_get_contents( __DIR__ . '/component-2.json' );

			self::$component_2_data = json_decode( $json_content, true );
		}

		return self::$component_2_data;
	}

	/**
	 * Get mock data for invalid component (for testing error handling)
	 *
	 * @return array
	 */
	public static function get_invalid_component_data(): array {
		if ( ! isset( self::$invalid_component_data ) ) {
			$json_content = file_get_contents( __DIR__ . '/invalid-component.json' );

			self::$invalid_component_data = json_decode( $json_content, true );
		}

		return self::$invalid_component_data;
	}

	/**
	 * Get expected styles for component 1
	 *
	 * @return array
	 */
	public static function get_component_1_expected_styles(): array {
		return [
			'component-1-wrapper-element-local-class-id' => [
				'id' => 'component-1-wrapper-element-local-class-id',
				'label' => 'local',
				'type' => 'class',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => null
						],
						'props' => [
							'width' => [
								'$$type' => 'size',
								'value' => [
									'size' => 350,
									'unit' => 'px'
								]
							],
							'background' => [
								'$$type' => 'background',
								'value' => [
									'color' => [
										'$$type' => 'color',
										'value' => '#ffffff'
									]
								]
							]
						],
						'custom_css' => null
					]
				]
			],
			'component-1-button-local-class-id' => [
				'id' => 'component-1-button-local-class-id',
				'label' => 'local',
				'type' => 'class',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => null
						],
						'props' => [
							'color' => [
								'$$type' => 'color',
								'value' => '#ffffff'
							]
						],
						'custom_css' => null
					],
					[
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => 'hover'
						],
						'props' => [
							'color' => [
								'$$type' => 'color',
								'value' => '#00064c'
							]
						],
						'custom_css' => null
					]
				]
			]
		];
	}

	/**
	 * Get expected styles for component 2
	 *
	 * @return array
	 */
	public static function get_component_2_expected_styles(): array {
		return [
			'component-2-wrapper-element-local-class-id' => [
				'id' => 'component-2-wrapper-element-local-class-id',
				'label' => 'local',
				'type' => 'class',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => null
						],
						'props' => [
							'background' => [
								'$$type' => 'background',
								'value' => [
									'color' => [
										'$$type' => 'color',
										'value' => '#f8f9fa'
									]
								]
							],
							'padding' => [
								'$$type' => 'size',
								'value' => [
									'size' => 40,
									'unit' => 'px'
								]
							]
						],
						'custom_css' => null
					]
				]
			],
			'component-2-heading-local-class-id' => [
				'id' => 'component-2-heading-local-class-id',
				'label' => 'local',
				'type' => 'class',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => null
						],
						'props' => [
							'font-family' => [
								'$$type' => 'string',
								'value' => 'Roboto'
							],
							'color' => [
								'$$type' => 'color',
								'value' => '#2c3e50'
							]
						],
						'custom_css' => null
					]
				]
			],
			'component-2-image-local-class-id' => [
				'id' => 'component-2-image-local-class-id',
				'label' => 'local',
				'type' => 'class',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => null
						],
						'props' => [
							'width' => [
								'$$type' => 'size',
								'value' => [
									'size' => 100,
									'unit' => '%'
								]
							]
						],
						'custom_css' => null
					]
				]
			]
		];
	}
}
