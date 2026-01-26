<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Promotions;

use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\Promotions\Controls\Display_Conditions_Promotion_Control;
use Elementor\Modules\Promotions\Module;
use Elementor\Modules\Promotions\PropTypes\Display_Conditions_Prop_Type;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Display_Conditions_Promotion extends Elementor_Test_Base {
	private Module $module;

	public function set_up() {
		parent::set_up();

		remove_all_filters( 'elementor/atomic-widgets/props-schema' );
		remove_all_filters( 'elementor/atomic-widgets/controls' );

		$this->module = Plugin::$instance->modules_manager->get_modules( 'promotions' );
	}

	public function test_inject_display_conditions_promo_prop__adds_prop_to_schema() {
		// Arrange.
		$schema = [
			'existing-prop' => 'existing-value',
		];

		// Act.
		$result = $this->module->inject_display_conditions_promo_prop( $schema );

		// Assert.
		$prop_key = Display_Conditions_Prop_Type::get_key();
		$this->assertArrayHasKey( $prop_key, $result, 'Display conditions prop should be added to schema' );
		$this->assertInstanceOf(
			Display_Conditions_Prop_Type::class,
			$result[ $prop_key ],
			'Display conditions prop should be instance of Display_Conditions_Prop_Type'
		);
		$this->assertArrayHasKey( 'existing-prop', $result, 'Existing props should be preserved' );
	}

	public function test_inject_display_conditions_promo_prop__does_not_override_existing_prop() {
		// Arrange.
		$existing_prop = Display_Conditions_Prop_Type::make();
		$prop_key = Display_Conditions_Prop_Type::get_key();
		$schema = [
			$prop_key => $existing_prop,
		];

		// Act.
		$result = $this->module->inject_display_conditions_promo_prop( $schema );

		// Assert.
		$this->assertSame( $existing_prop, $result[ $prop_key ], 'Existing display conditions prop should not be overridden' );
	}

	public function test_inject_display_conditions_promo_control__adds_control_to_settings_section() {
		// Arrange.
		$mock_atomic_element = $this->create_mock_atomic_element();
		$settings_section = Section::make()
			->set_id( 'settings' )
			->set_label( 'Settings' );

		$element_controls = [ $settings_section ];

		// Act.
		$this->module->inject_display_conditions_promo_control( $element_controls, $mock_atomic_element );

		// Assert.
		$items = $settings_section->get_items();
		$found_display_conditions = false;
		foreach ( $items as $item ) {
			if ( $item instanceof Display_Conditions_Promotion_Control ) {
				$found_display_conditions = true;
				break;
			}
		}

		$this->assertTrue( $found_display_conditions, 'Display conditions control should be added to settings section' );
	}

	public function test_inject_display_conditions_promo_control__does_not_add_control_when_prop_not_in_schema() {
		// Arrange.
		$mock_atomic_element_without_prop = $this->create_mock_atomic_element_without_display_conditions();
		$settings_section = Section::make()
			->set_id( 'settings' )
			->set_label( 'Settings' );

		$element_controls = [ $settings_section ];
		$original_items_count = count( $settings_section->get_items() );

		// Act.
		$this->module->inject_display_conditions_promo_control( $element_controls, $mock_atomic_element_without_prop );

		// Assert.
		$items = $settings_section->get_items();
		$this->assertCount( $original_items_count, $items, 'No control should be added when prop is not in schema' );
	}

	public function test_inject_display_conditions_promo_control__ignores_non_settings_sections() {
		// Arrange.
		$mock_atomic_element = $this->create_mock_atomic_element();
		$style_section = Section::make()
			->set_id( 'style' )
			->set_label( 'Style' );

		$element_controls = [ $style_section ];
		$original_items_count = count( $style_section->get_items() );

		// Act.
		$this->module->inject_display_conditions_promo_control( $element_controls, $mock_atomic_element );

		// Assert.
		$items = $style_section->get_items();
		$this->assertCount( $original_items_count, $items, 'Control should not be added to non-settings sections' );
	}

	public function test_inject_display_conditions_promo_control__handles_empty_controls_array() {
		// Arrange.
		$mock_atomic_element = $this->create_mock_atomic_element();
		$element_controls = [];

		// Act.
		$result = $this->module->inject_display_conditions_promo_control( $element_controls, $mock_atomic_element );

		// Assert.
		$this->assertEmpty( $result, 'Result should be empty when no controls provided' );
	}

	private function create_mock_atomic_element() {
		return new class extends Atomic_Widget_Base {
			public static function get_type(): string {
				return 'mock-atomic-element';
			}

			public function get_atomic_controls(): array {
				return [];
			}

			public function define_atomic_controls(): array {
				return [];
			}

			public static function get_element_type(): string {
				return 'mock-atomic-element';
			}

			protected static function define_props_schema(): array {
				return [
					Display_Conditions_Prop_Type::get_key() => Display_Conditions_Prop_Type::make(),
				];
			}

			protected function render(): void {}
		};
	}

	private function create_mock_atomic_element_without_display_conditions() {
		return new class extends Atomic_Widget_Base {
			public static function get_type(): string {
				return 'mock-atomic-element-no-dc';
			}

			public function get_atomic_controls(): array {
				return [];
			}

			public function define_atomic_controls(): array {
				return [];
			}

			public static function get_element_type(): string {
				return 'mock-atomic-element-no-dc';
			}

			protected static function define_props_schema(): array {
				return [];
			}

			protected function render(): void {}
		};
	}
}
