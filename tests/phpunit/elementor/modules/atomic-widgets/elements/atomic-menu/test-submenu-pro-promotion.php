<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Elements\AtomicMenu;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu_Submenu_Promotion\Atomic_Menu_Submenu_Promotion;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu_Submenu_Trigger_Promotion\Atomic_Menu_Submenu_Trigger_Promotion;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Submenu_Entitlement;
use Elementor\Modules\AtomicWidgets\Elements\Promotions\Pro_Promotion_Data_Preservation;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Submenu_Pro_Promotion extends Elementor_Test_Base {

	private $original_element_types;

	public function set_up() {
		parent::set_up();

		$this->act_as_admin();
		$this->original_element_types = $this->get_element_types_property()->getValue( Plugin::$instance->elements_manager );
	}

	public function tear_down() {
		$this->get_element_types_property()->setValue( Plugin::$instance->elements_manager, $this->original_element_types );
		Plugin::$instance->experiments->set_feature_default_state( Atomic_Widgets_Module::EXPERIMENT_NAV_MENU, Experiments_Manager::STATE_INACTIVE );
		remove_all_filters( 'elementor/document/save/data' );
		remove_all_filters( 'elementor/atomic-widgets/menu/submenu/upgrade_url' );
		remove_all_filters( 'elementor/atomic-widgets/menu/submenu/is_locked' );

		parent::tear_down();
	}

	private function get_element_types_property(): \ReflectionProperty {
		$property = new \ReflectionProperty( Plugin::$instance->elements_manager, '_element_types' );
		$property->setAccessible( true );

		return $property;
	}

	private function register_elements_with_experiment( string $state ) {
		Plugin::$instance->experiments->set_feature_default_state( Atomic_Widgets_Module::EXPERIMENT_NAV_MENU, $state );
		$this->get_element_types_property()->setValue( Plugin::$instance->elements_manager, null );
		Plugin::$instance->elements_manager->get_element_types();
	}

	public function test_placeholders_register_with_the_pro_types_when_pro_is_off() {
		// Act.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		// Assert.
		$types = Plugin::$instance->elements_manager->get_element_types();
		$this->assertInstanceOf( Atomic_Menu_Submenu_Promotion::class, $types['e-menu-submenu'] );
		$this->assertInstanceOf( Atomic_Menu_Submenu_Trigger_Promotion::class, $types['e-menu-submenu-trigger'] );
	}

	public function test_a_later_registration_replaces_the_placeholder() {
		// Arrange.
		$pro_submenu = new class() extends Atomic_Menu_Submenu_Promotion {};
		add_action(
			'elementor/elements/elements_registered',
			fn ( $elements_manager ) => $elements_manager->register_element_type( $pro_submenu )
		);

		// Act.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		// Assert.
		$types = Plugin::$instance->elements_manager->get_element_types();
		$this->assertSame( $pro_submenu, $types['e-menu-submenu'] );
		$this->assertInstanceOf( Atomic_Menu_Submenu_Trigger_Promotion::class, $types['e-menu-submenu-trigger'] );
	}

	public function test_placeholders_are_not_registered_when_the_experiment_is_inactive() {
		// Act.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_INACTIVE );

		// Assert.
		$types = Plugin::$instance->elements_manager->get_element_types();
		$this->assertArrayNotHasKey( 'e-menu-submenu', $types );
		$this->assertArrayNotHasKey( 'e-menu-submenu-trigger', $types );
	}

	public function test_placeholders_are_hidden_from_the_panel_and_flagged_as_promotion() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		foreach ( [ 'e-menu-submenu', 'e-menu-submenu-trigger' ] as $type ) {
			// Act.
			$element = Plugin::$instance->elements_manager->get_element_types( $type );
			$should_show = new \ReflectionMethod( $element, 'should_show_in_panel' );
			$should_show->setAccessible( true );

			// Assert.
			$this->assertFalse( $should_show->invoke( $element ), $type );
			$this->assertTrue( (bool) $element->get_meta_item( 'is_pro_promotion' ), $type );
		}
	}

	public function test_placeholders_render_nothing() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		foreach ( [ 'e-menu-submenu', 'e-menu-submenu-trigger' ] as $type ) {
			$class = get_class( Plugin::$instance->elements_manager->get_element_types( $type ) );
			$element = new $class( [ 'id' => 'abc123', 'elType' => $type ] );

			// Act.
			ob_start();
			$element->print_element();
			$html = trim( ob_get_clean() );

			// Assert.
			$this->assertSame( '', $html, $type );
		}
	}

	public function test_entry_accepts_the_submenu_types_as_children() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		// Act.
		$allowed = Plugin::$instance->elements_manager->get_element_types( 'e-menu-entry' )->get_config()['allowed_child_types'] ?? [];

		// Assert.
		$this->assertContains( 'e-menu-submenu', $allowed );
		$this->assertContains( 'e-menu-submenu-trigger', $allowed );
	}

	public function test_lock_matrix() {
		$this->assertTrue( Submenu_Entitlement::is_locked_for( false, false ), 'Free' );
		$this->assertTrue( Submenu_Entitlement::is_locked_for( false, true ), 'Pro deactivated' );
		$this->assertTrue( Submenu_Entitlement::is_locked_for( true, false ), 'Pro without the Submenu types' );
		$this->assertFalse( Submenu_Entitlement::is_locked_for( true, true ), 'Pro with the Submenu types' );
	}

	public function test_is_locked_is_decided_by_pro_through_a_filter() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );
		add_filter( 'elementor/atomic-widgets/menu/submenu/is_locked', '__return_false' );

		// Act & Assert.
		$this->assertFalse( Submenu_Entitlement::is_locked() );
	}

	public function test_upgrade_url_is_sanitized() {
		// Arrange.
		add_filter( 'elementor/atomic-widgets/menu/submenu/upgrade_url', fn () => 'javascript:alert(1)' );

		// Act & Assert.
		$this->assertSame( '', Submenu_Entitlement::get_upgrade_url() );
	}

	public function test_is_locked_without_pro() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		// Assert.
		$this->assertTrue( Submenu_Entitlement::is_locked() );
	}

	public function test_promotion_copy_and_single_configurable_url() {
		// Arrange.
		add_filter( 'elementor/atomic-widgets/menu/submenu/upgrade_url', fn () => 'https://go.example/submenu' );

		// Act.
		$promotion = Submenu_Entitlement::get_promotion();

		// Assert.
		$this->assertSame( 'Mega Menu', $promotion['title'] );
		$this->assertSame( 'Create rich navigation menus with custom layouts, images, and interactive content.', $promotion['content'] );
		$this->assertSame( 'https://go.example/submenu', $promotion['ctaUrl'] );
	}

	public function test_entry_exposes_the_entitlement_to_the_editor() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		// Act.
		$meta = Plugin::$instance->elements_manager->get_element_types( 'e-menu-entry' )->get_config()['meta']['submenu_entitlement'];

		// Assert.
		$this->assertTrue( $meta['locked'] );
		$this->assertSame( 'Mega Menu', $meta['promotion']['title'] );
	}

	public function test_submenu_data_survives_a_save_while_pro_is_off() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );
		( new Pro_Promotion_Data_Preservation() )->register_hooks();

		$item = [ 'id' => 'item001', 'elType' => 'e-menu-item', 'settings' => [], 'elements' => [] ];
		$trigger = [ 'id' => 'trig001', 'elType' => 'e-menu-submenu-trigger', 'settings' => [], 'elements' => [] ];
		$inner_entry = [ 'id' => 'ientry1', 'elType' => 'e-menu-entry', 'settings' => [], 'elements' => [
			[ 'id' => 'iitem001', 'elType' => 'e-menu-item', 'settings' => [], 'elements' => [] ],
			[ 'id' => 'isub0001', 'elType' => 'e-menu-submenu', 'settings' => [], 'elements' => [] ],
		] ];
		$submenu = [
			'id' => 'sub0001',
			'elType' => 'e-menu-submenu',
			'settings' => [ 'classes' => [ '$$type' => 'classes', 'value' => [ 'keep-me' ] ] ],
			'elements' => [
				[ 'id' => 'par0001', 'elType' => 'widget', 'widgetType' => 'e-paragraph', 'settings' => [], 'elements' => [] ],
				[
					'id' => 'nested1',
					'elType' => 'e-menu',
					'settings' => [],
					'elements' => [ [ 'id' => 'nitems1', 'elType' => 'e-menu-items', 'settings' => [], 'elements' => [ $inner_entry ] ] ],
				],
			],
		];
		$entry = [ 'id' => 'entry01', 'elType' => 'e-menu-entry', 'settings' => [], 'elements' => [ $item, $trigger, $submenu ] ];
		$menu = [ 'id' => 'menu001', 'elType' => 'e-menu', 'settings' => [], 'elements' => [ [ 'id' => 'items01', 'elType' => 'e-menu-items', 'settings' => [], 'elements' => [ $entry ] ] ] ];

		$document = $this->factory()->documents->create_and_get();
		$document->save( [ 'elements' => [ $menu ], 'settings' => [] ] );

		// Act - the editor re-saves with the placeholder's content stripped.
		$stripped = $menu;
		$stripped['elements'][0]['elements'][0]['elements'][1]['settings'] = [];
		$stripped['elements'][0]['elements'][0]['elements'][2]['elements'] = [];
		$stripped['elements'][0]['elements'][0]['elements'][2]['settings'] = [];
		$document->save( [ 'elements' => [ $stripped ], 'settings' => [] ] );

		// Assert.
		$saved_entry = $document->get_elements_data()[0]['elements'][0]['elements'][0];
		$saved_trigger = $saved_entry['elements'][1];
		$saved_submenu = $saved_entry['elements'][2];

		$this->assertSame( 'e-menu-submenu-trigger', $saved_trigger['elType'] );
		$this->assertSame( 'trig001', $saved_trigger['id'] );
		$this->assertSame( 'e-menu-submenu', $saved_submenu['elType'] );
		$this->assertSame( [ 'keep-me' ], $saved_submenu['settings']['classes']['value'] );
		$this->assertSame( 'par0001', $saved_submenu['elements'][0]['id'] );
		$this->assertSame( 'nested1', $saved_submenu['elements'][1]['id'] );
		$this->assertSame( 'isub0001', $saved_submenu['elements'][1]['elements'][0]['elements'][0]['elements'][1]['id'] );
	}

	public function test_childless_trigger_and_empty_submenu_settings_survive_a_save_while_pro_is_off() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );
		( new Pro_Promotion_Data_Preservation() )->register_hooks();

		$trigger_settings = [
			'show-indicator' => [ '$$type' => 'boolean', 'value' => false ],
			'closed-angle' => [ '$$type' => 'number', 'value' => 90 ],
			'open-angle' => [ '$$type' => 'number', 'value' => -90 ],
			'label-open' => [ '$$type' => 'string', 'value' => 'Show products' ],
			'label-close' => [ '$$type' => 'string', 'value' => 'Hide products' ],
		];
		$submenu_settings = [
			'position-relative-to' => [ '$$type' => 'string', 'value' => 'viewport' ],
			'horizontal-alignment' => [ '$$type' => 'string', 'value' => 'end' ],
		];
		$entry = [
			'id' => 'entry01',
			'elType' => 'e-menu-entry',
			'settings' => [ 'submenu' => [ '$$type' => 'boolean', 'value' => true ] ],
			'elements' => [
				[ 'id' => 'item001', 'elType' => 'e-menu-item', 'settings' => [], 'elements' => [] ],
				[ 'id' => 'trig001', 'elType' => 'e-menu-submenu-trigger', 'settings' => $trigger_settings, 'elements' => [] ],
				[ 'id' => 'sub0001', 'elType' => 'e-menu-submenu', 'settings' => $submenu_settings, 'elements' => [] ],
			],
		];
		$menu = [ 'id' => 'menu001', 'elType' => 'e-menu', 'settings' => [], 'elements' => [ [ 'id' => 'items01', 'elType' => 'e-menu-items', 'settings' => [], 'elements' => [ $entry ] ] ] ];

		// Act.
		$document = $this->factory()->documents->create_and_get();
		$document->save( [ 'elements' => [ $menu ], 'settings' => [] ] );

		// Assert.
		$saved_entry = $document->get_elements_data()[0]['elements'][0]['elements'][0];

		$this->assertTrue( $saved_entry['settings']['submenu']['value'] );
		$this->assertSame( $trigger_settings, $saved_entry['elements'][1]['settings'] );
		$this->assertSame( $submenu_settings, $saved_entry['elements'][2]['settings'] );
	}

	public function test_menu_item_controls_serialize_with_the_submenu_toggle() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		// Act.
		$json = wp_json_encode( Plugin::$instance->elements_manager->get_element_types( 'e-menu-item' )->get_config()['atomic_controls'] );

		// Assert.
		$this->assertIsString( $json );
		$this->assertStringContainsString( '"type":"submenu-toggle"', $json );
	}
}
