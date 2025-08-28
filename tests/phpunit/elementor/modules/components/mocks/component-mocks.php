<?php

namespace Elementor\Testing\Modules\Components\Mocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Mocks {

	/**
	 * Get mock data for component 1 (Header with title and image)
	 *
	 * @return array
	 */
	public static function get_component_1_data(): array {
		$json_file = __DIR__ . '/component-1.json';
		$json_content = file_get_contents( $json_file );
		
		return json_decode( $json_content, true );
	}

	/**
	 * Get mock data for component 2 (Card with title, text, and button)
	 *
	 * @return array
	 */
	public static function get_component_2_data(): array {
		$json_file = __DIR__ . '/component-2.json';
		$json_content = file_get_contents( $json_file );
		
		return json_decode( $json_content, true );
	}

	/**
	 * Get mock data for invalid component (for testing error handling)
	 *
	 * @return array
	 */
	public static function get_invalid_component_data(): array {
		$json_file = __DIR__ . '/invalid-component.json';
		$json_content = file_get_contents( $json_file );
		
		return json_decode( $json_content, true );
	}

	/**
	 * Get all available mock components
	 *
	 * @return array
	 */
	public static function get_all_components(): array {
		return [
			'component-1' => self::get_component_1_data(),
			'component-2' => self::get_component_2_data(),
			'invalid-component' => self::get_invalid_component_data(),
		];
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
