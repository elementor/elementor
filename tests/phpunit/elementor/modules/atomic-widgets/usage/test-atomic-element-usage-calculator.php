<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\Usage;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Usage\Atomic_Element_Usage_Calculator;
use Elementor\Plugin;
use Elementor\Widget_Base;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Atomic_Element_Usage_Calculator extends Elementor_Test_Base {

	private Atomic_Element_Usage_Calculator $calculator;

	public function setUp(): void {
		parent::setUp();

		$this->calculator = new Atomic_Element_Usage_Calculator();
	}

	public function test_can_calculate_returns_false_when_element_instance_is_null() {
		// Arrange.
		$element = [ 'elType' => 'widget', 'widgetType' => 'some-widget' ];

		// Act.
		$result = $this->calculator->can_calculate( $element, null );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_can_calculate_returns_false_for_non_atomic_widget() {
		// Arrange.
		$element = [ 'elType' => 'widget', 'widgetType' => 'button' ];

		$widget_instance = Plugin::$instance->widgets_manager->get_widget_types( 'button' );

		// Act.
		$result = $this->calculator->can_calculate( $element, $widget_instance );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_can_calculate_returns_true_for_atomic_widget() {
		// Arrange.
		$element = [
			'id' => 'abc123',
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'settings' => [],
		];

		$widget_instance = Plugin::$instance->widgets_manager->get_widget_types( 'e-heading' );

		// Act.
		$result = $this->calculator->can_calculate( $element, $widget_instance );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_calculate_initializes_usage_entry_for_new_element() {
		// Arrange.
		$element = [
			'id' => 'abc123',
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'settings' => [],
		];

		$widget_instance = Plugin::$instance->widgets_manager->get_widget_types( 'e-heading' );

		// Act.
		$usage = $this->calculator->calculate( $element, $widget_instance, [] );

		// Assert.
		$this->assertArrayHasKey( 'e-heading', $usage );
		$this->assertEquals( 1, $usage['e-heading']['count'] );
		$this->assertArrayHasKey( 'control_percent', $usage['e-heading'] );
		$this->assertArrayHasKey( 'controls', $usage['e-heading'] );
	}

	public function test_calculate_increments_count_for_existing_element() {
		// Arrange.
		$element = [
			'id' => 'abc123',
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'settings' => [],
		];

		$widget_instance = Plugin::$instance->widgets_manager->get_widget_types( 'e-heading' );

		$existing_usage = [
			'e-heading' => [
				'count' => 5,
				'control_percent' => 10,
				'controls' => [],
			],
		];

		// Act.
		$usage = $this->calculator->calculate( $element, $widget_instance, $existing_usage );

		// Assert.
		$this->assertEquals( 6, $usage['e-heading']['count'] );
	}

	public function test_calculate_tracks_general_props_under_general_tab() {
		// Arrange.
		$element = [
			'id' => 'abc123',
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'settings' => [
				'tag' => [
					'$$type' => 'string',
					'value' => 'h3',
				],
				'title' => [
					'$$type' => 'string',
					'value' => 'My Title',
				],
			],
		];

		$widget_instance = Plugin::$instance->widgets_manager->get_widget_types( 'e-heading' );

		// Act.
		$usage = $this->calculator->calculate( $element, $widget_instance, [] );

		// Assert.
		$this->assertArrayHasKey( 'General', $usage['e-heading']['controls'] );
		$general_controls = $usage['e-heading']['controls']['General'];
		$this->assertNotEmpty( $general_controls );

		$found_tag = false;
		$found_title = false;
		foreach ( $general_controls as $section => $controls ) {
			if ( isset( $controls['tag'] ) ) {
				$found_tag = true;
			}
			if ( isset( $controls['title'] ) ) {
				$found_title = true;
			}
		}
		$this->assertTrue( $found_tag, 'Tag prop should be tracked under General tab' );
		$this->assertTrue( $found_title, 'Title prop should be tracked under General tab' );
	}

	public function test_calculate_tracks_classes_under_style_tab() {
		// Arrange.
		$element = [
			'id' => 'abc123',
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'settings' => [
				'classes' => [
					'$$type' => 'classes',
					'value' => [ 'class-one', 'class-two' ],
				],
			],
		];

		$widget_instance = Plugin::$instance->widgets_manager->get_widget_types( 'e-heading' );

		// Act.
		$usage = $this->calculator->calculate( $element, $widget_instance, [] );

		// Assert.
		$this->assertArrayHasKey( 'Style', $usage['e-heading']['controls'] );
		$this->assertArrayHasKey( 'Styles', $usage['e-heading']['controls']['Style'] );
		$this->assertEquals( 1, $usage['e-heading']['controls']['Style']['Styles']['classes'] );
	}

	public function test_calculate_tracks_style_props_under_styles_section() {
		// Arrange.
		$element = [
			'id' => 'abc123',
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'settings' => [],
			'styles' => [
				'e-abc123-style' => [
					'id' => 'e-abc123-style',
					'label' => 'local',
					'type' => 'class',
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
							'props' => [
								'color' => [
									'$$type' => 'color',
									'value' => '#ff0000',
								],
								'background' => [
									'$$type' => 'background',
									'value' => [
										'color' => [
											'$$type' => 'color',
											'value' => '#00ff00',
										],
									],
								],
							],
						],
					],
				],
			],
		];

		$widget_instance = Plugin::$instance->widgets_manager->get_widget_types( 'e-heading' );

		// Act.
		$usage = $this->calculator->calculate( $element, $widget_instance, [] );

		// Assert.
		$this->assertArrayHasKey( 'Style', $usage['e-heading']['controls'] );
		$style_controls = $usage['e-heading']['controls']['Style'];

		$this->assertArrayHasKey( 'Styles', $style_controls );
		$styles_section = $style_controls['Styles'];

		$this->assertArrayHasKey( 'color', $styles_section );
		$this->assertArrayHasKey( 'background-color', $styles_section );
	}

	public function test_calculate_tracks_custom_css() {
		// Arrange.
		$element = [
			'id' => 'abc123',
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'settings' => [],
			'styles' => [
				'e-abc123-style' => [
					'id' => 'e-abc123-style',
					'label' => 'local',
					'type' => 'class',
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
							'props' => [],
							'custom_css' => [
								'raw' => 'YmFja2dyb3VuZC1jb2xvcjogcmVkOw==',
							],
						],
					],
				],
			],
		];

		$widget_instance = Plugin::$instance->widgets_manager->get_widget_types( 'e-heading' );

		// Act.
		$usage = $this->calculator->calculate( $element, $widget_instance, [] );

		// Assert.
		$this->assertArrayHasKey( 'Style', $usage['e-heading']['controls'] );
		$this->assertArrayHasKey( 'Styles', $usage['e-heading']['controls']['Style'] );
		$this->assertEquals( 1, $usage['e-heading']['controls']['Style']['Styles']['custom_css'] );
	}

	public function test_calculate_returns_usage_with_only_count_when_element_instance_is_null() {
		// Arrange.
		$element = [
			'id' => 'abc123',
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'settings' => [],
		];

		// Act.
		$usage = $this->calculator->calculate( $element, null, [] );

		// Assert.
		$this->assertArrayHasKey( 'e-heading', $usage );
		$this->assertEquals( 1, $usage['e-heading']['count'] );
		$this->assertEquals( 0, $usage['e-heading']['control_percent'] );
		$this->assertEmpty( $usage['e-heading']['controls'] );
	}

	public function test_calculate_control_percent_is_calculated_correctly() {
		// Arrange.
		$element = [
			'id' => 'abc123',
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'settings' => [
				'tag' => [
					'$$type' => 'string',
					'value' => 'h3',
				],
			],
			'styles' => [
				'e-abc123-style' => [
					'id' => 'e-abc123-style',
					'label' => 'local',
					'type' => 'class',
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
							'props' => [
								'color' => [
									'$$type' => 'color',
									'value' => '#ff0000',
								],
							],
						],
					],
				],
			],
		];

		$widget_instance = Plugin::$instance->widgets_manager->get_widget_types( 'e-heading' );

		// Act.
		$usage = $this->calculator->calculate( $element, $widget_instance, [] );

		// Assert.
		$this->assertIsInt( $usage['e-heading']['control_percent'] );
		$this->assertGreaterThan( 0, $usage['e-heading']['control_percent'] );
		$this->assertLessThanOrEqual( 100, $usage['e-heading']['control_percent'] );
	}

	public function test_calculate_skips_cssid_prop() {
		// Arrange.
		$element = [
			'id' => 'abc123',
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'settings' => [
				'_cssid' => 'some-css-id',
				'tag' => [
					'$$type' => 'string',
					'value' => 'h3',
				],
			],
		];

		$widget_instance = Plugin::$instance->widgets_manager->get_widget_types( 'e-heading' );

		// Act.
		$usage = $this->calculator->calculate( $element, $widget_instance, [] );

		// Assert.
		$general_controls = $usage['e-heading']['controls']['General'] ?? [];

		foreach ( $general_controls as $section => $controls ) {
			$this->assertArrayNotHasKey( '_cssid', $controls, '_cssid should not be tracked' );
		}
	}

	public function test_can_calculate_returns_true_for_e_flexbox_container() {
		// Arrange.
		$element = [
			'id' => 'bfad749',
			'elType' => 'e-flexbox',
			'settings' => [],
		];

		$element_instance = Plugin::$instance->elements_manager->get_element_types( 'e-flexbox' );

		// Act.
		$result = $this->calculator->can_calculate( $element, $element_instance );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_calculate_tracks_e_flexbox_container_with_styles() {
		// Arrange.
		$element = [
			'id' => 'bfad749',
			'elType' => 'e-flexbox',
			'settings' => [
				'classes' => [
					'$$type' => 'classes',
					'value' => [ 'e-bfad749-cbb32d6' ],
				],
			],
			'styles' => [
				'e-bfad749-cbb32d6' => [
					'id' => 'e-bfad749-cbb32d6',
					'label' => 'local',
					'type' => 'class',
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
							'props' => [
								'padding' => [
									'$$type' => 'size',
									'value' => [
										'size' => 20,
										'unit' => 'px',
									],
								],
								'background' => [
									'$$type' => 'background',
									'value' => [
										'background-overlay' => [
											'$$type' => 'background-overlay',
											'value' => [
												[
													'$$type' => 'background-image-overlay',
													'value' => [
														'image' => [
															'$$type' => 'image',
															'value' => [
																'src' => [
																	'$$type' => 'image-src',
																	'value' => [
																		'id' => null,
																		'url' => 'https://example.com/image.jpg',
																	],
																],
															],
														],
														'position' => [
															'$$type' => 'string',
															'value' => 'center center',
														],
														'repeat' => [
															'$$type' => 'string',
															'value' => 'no-repeat',
														],
														'size' => [
															'$$type' => 'string',
															'value' => 'cover',
														],
													],
												],
											],
										],
									],
								],
							],
						],
					],
				],
			],
		];

		$element_instance = Plugin::$instance->elements_manager->get_element_types( 'e-flexbox' );

		// Act.
		$usage = $this->calculator->calculate( $element, $element_instance, [] );

		// Assert.
		$this->assertArrayHasKey( 'e-flexbox', $usage );
		$this->assertEquals( 1, $usage['e-flexbox']['count'] );

		$this->assertArrayHasKey( 'Style', $usage['e-flexbox']['controls'] );
		$style_controls = $usage['e-flexbox']['controls']['Style'];

		$this->assertArrayHasKey( 'Styles', $style_controls );
		$styles_section = $style_controls['Styles'];

		$this->assertArrayHasKey( 'classes', $styles_section );
		$this->assertArrayHasKey( 'padding-size', $styles_section );
		$this->assertArrayHasKey( 'padding-unit', $styles_section );
		$this->assertArrayHasKey( 'background-background-overlay-background-image-overlay-position', $styles_section );
		$this->assertArrayHasKey( 'background-background-overlay-background-image-overlay-repeat', $styles_section );
		$this->assertArrayHasKey( 'background-background-overlay-background-image-overlay-size', $styles_section );
	}
}
