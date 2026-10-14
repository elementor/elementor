<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Promotions;

use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\Promotions\Controls\Atomic_Promotion_Control;
use Elementor\Modules\Promotions\Module;
use Elementor\Modules\Promotions\PropTypes\Promotion_Prop_Type;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Testable_Promotions_Module extends Module {
	public function test_inject_atomic_promotion_control( array $element_controls, $atomic_element, array $config ): array {
		return $this->inject_atomic_promotion_control( $element_controls, $atomic_element, $config );
	}
}

class Test_Atomic_Promotions extends Elementor_Test_Base {
	private Testable_Promotions_Module $module;

	public function set_up() {
		parent::set_up();

		remove_all_filters( 'elementor/atomic-widgets/props-schema' );
		remove_all_filters( 'elementor/atomic-widgets/controls' );

		$original_module = Plugin::$instance->modules_manager->get_modules( 'promotions' );
		$this->module = new Testable_Promotions_Module();
	}

	public function test_inject_atomic_promotion_props__adds_all_promotion_props_to_schema() {
		// Arrange.
		$schema = [
			'existing-prop' => 'existing-value',
		];

		// Act.
		$result = $this->module->inject_atomic_promotion_props( $schema );

		// Assert.
		$this->assertArrayHasKey( 'attributes', $result, 'Attributes prop should be added to schema' );
		$this->assertArrayHasKey( 'display-conditions', $result, 'Display conditions prop should be added to schema' );
		$this->assertInstanceOf(
			Promotion_Prop_Type::class,
			$result['attributes'],
			'Attributes prop should be instance of Promotion_Prop_Type'
		);
		$this->assertInstanceOf(
			Promotion_Prop_Type::class,
			$result['display-conditions'],
			'Display conditions prop should be instance of Promotion_Prop_Type'
		);
		$this->assertArrayHasKey( 'existing-prop', $result, 'Existing props should be preserved' );
	}

	public function test_inject_atomic_promotion_props__does_not_override_existing_props() {
		// Arrange.
		$existing_attributes_prop = Promotion_Prop_Type::make( 'attributes' );
		$existing_display_conditions_prop = Promotion_Prop_Type::make( 'display-conditions' );
		$schema = [
			'attributes' => $existing_attributes_prop,
			'display-conditions' => $existing_display_conditions_prop,
		];

		// Act.
		$result = $this->module->inject_atomic_promotion_props( $schema );

		// Assert.
		$this->assertSame( $existing_attributes_prop, $result['attributes'], 'Existing attributes prop should not be overridden' );
		$this->assertSame( $existing_display_conditions_prop, $result['display-conditions'], 'Existing display conditions prop should not be overridden' );
	}

	public function test_inject_atomic_promotion_props__does_not_override_single_existing_prop() {
		// Arrange.
		$existing_prop = Promotion_Prop_Type::make( 'display-conditions' );
		$schema = [
			'display-conditions' => $existing_prop,
		];

		// Act.
		$result = $this->module->inject_atomic_promotion_props( $schema );

		// Assert.
		$this->assertSame( $existing_prop, $result['display-conditions'], 'Existing display conditions prop should not be overridden' );
		$this->assertArrayHasKey( 'attributes', $result, 'Missing attributes prop should still be added' );
	}

	public function test_inject_atomic_promotion_control__adds_controls_to_settings_section() {
		// Arrange.
		$mock_atomic_element = $this->create_mock_atomic_element_with_promotions();
		$settings_section = Section::make()
			->set_id( 'settings' )
			->set_label( 'Settings' );

		$element_controls = [ $settings_section ];

		$configs = [
			[
				'key' => 'attributes',
				'label'=> 'Attributes',
				'section'=> 'settings',
			],
			[
				'key'=> 'display-conditions',
				'label'=> 'Display Conditions',
				'section'=> 'settings',
			],
		];

		// Act.
		foreach ( $configs as $config ) {
			$this->module->test_inject_atomic_promotion_control( $element_controls, $mock_atomic_element, $config );
		}

		// Assert.
		$items = $settings_section->get_items();
		$found_controls = [];
		foreach ( $items as $item ) {
			if ( $item instanceof Atomic_Promotion_Control ) {
				$found_controls[] = $item->get_type();
			}
		}

		$this->assertContains( 'attributes', $found_controls, 'Attributes control should be added to settings section' );
		$this->assertContains( 'display-conditions', $found_controls, 'Display conditions control should be added to settings section' );
	}

	public function test_inject_atomic_promotion_control__ignores_non_matching_sections() {
		// Arrange.
		$mock_atomic_element = $this->create_mock_atomic_element_with_promotions();
		$style_section = Section::make()
			->set_id( 'style' )
			->set_label( 'Style' );

		$element_controls = [ $style_section ];
		$original_items_count = count( $style_section->get_items() );

		$config = [
			'key'     => 'display-conditions',
			'label'   => 'Display Conditions',
			'section' => 'settings',
		];

		// Act.
		$this->module->test_inject_atomic_promotion_control( $element_controls, $mock_atomic_element, $config );

		// Assert.
		$items = $style_section->get_items();
		$this->assertCount( $original_items_count, $items, 'Control should not be added to non-matching sections' );
	}

	private function create_mock_atomic_element_with_promotions() {
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
					'attributes' => Promotion_Prop_Type::make( 'attributes' ),
					'display-conditions' => Promotion_Prop_Type::make( 'display-conditions' ),
				];
			}

			protected function render(): void {}
		};
	}
}
