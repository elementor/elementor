<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Elements\AtomicMenu;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu\Atomic_Menu;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu_Entry\Atomic_Menu_Entry;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu_Item\Atomic_Menu_Item;
use Elementor\Modules\AtomicWidgets\Elements\TemplateRenderer\Template_Renderer;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\AtomicWidgets\Styles\Style_States;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use ElementorEditorTesting\Traits\Breakpoints_Trait;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Atomic_Menu extends Elementor_Test_Base {
	use Breakpoints_Trait;


	const LOCKED_TYPES = [
		'e-menu-items',
		'e-menu-entry',
		'e-menu-item',
		'e-menu-toggle',
		'e-menu-toggle-closed',
		'e-menu-toggle-open',
	];

	private $original_element_types;

	public function set_up() {
		parent::set_up();

		$this->original_element_types = $this->get_element_types_property()->getValue( Plugin::$instance->elements_manager );
	}

	public function tear_down() {
		$this->get_element_types_property()->setValue( Plugin::$instance->elements_manager, $this->original_element_types );
		Plugin::$instance->experiments->set_feature_default_state( Atomic_Widgets_Module::EXPERIMENT_NAV_MENU, Experiments_Manager::STATE_INACTIVE );
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

	private function get_config( string $type ): array {
		return Plugin::$instance->elements_manager->get_element_types( $type )->get_config();
	}

	private function expand( array $node, int &$seq ): array {
		$node['id'] = 'menuunit' . ( ++$seq );

		$children = [];
		foreach ( $node['elements'] ?? [] as $child ) {
			$children[] = $this->expand( $child, $seq );
		}
		$node['elements'] = $children;

		return $node;
	}

	private function render_menu( array $settings = [], ?array $first_item_link = null, bool $empty_first_item = false ): string {
		$seq = 0;
		$children = $this->get_config( 'e-menu' )['default_children'];

		if ( $empty_first_item ) {
			$children[0]['elements'][0]['elements'] = [];
		}


		if ( null !== $first_item_link ) {
			$children[0]['elements'][0]['elements'][0]['settings']['link'] = $first_item_link;
		}

		$tree = $this->expand( [
			'elType' => 'e-menu',
			'settings' => $settings,
			'elements' => $children,
		], $seq );

		$instance = Plugin::$instance->elements_manager->create_element_instance( $tree );
		$this->assertNotNull( $instance );

		ob_start();
		$instance->print_element();

		return ob_get_clean();
	}

	public function test_no_type_is_registered_when_experiment_is_inactive() {
		$this->register_elements_with_experiment( Experiments_Manager::STATE_INACTIVE );

		foreach ( array_merge( [ 'e-menu' ], self::LOCKED_TYPES ) as $type ) {
			$this->assertNull( Plugin::$instance->elements_manager->get_element_types( $type ), $type );
		}
	}

	public function test_all_types_are_registered_when_experiment_is_active() {
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		foreach ( array_merge( [ 'e-menu' ], self::LOCKED_TYPES ) as $type ) {
			$this->assertNotNull( Plugin::$instance->elements_manager->get_element_types( $type ), $type );
		}
	}

	public function test_only_menu_is_shown_in_panel_and_locked_types_are_permanently_locked() {
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		$this->assertTrue( $this->get_config( 'e-menu' )['show_in_panel'] );
		$this->assertArrayNotHasKey( 'permanently_locked', $this->get_config( 'e-menu' )['meta'] );

		foreach ( self::LOCKED_TYPES as $type ) {
			$config = $this->get_config( $type );

			$this->assertFalse( $config['show_in_panel'], $type );
			$this->assertTrue( $config['meta']['permanently_locked'], $type );
		}
	}

	public function test_allowed_child_types() {
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		$this->assertSame( [ 'e-menu-items', 'e-menu-toggle' ], $this->get_config( 'e-menu' )['allowed_child_types'] );
		$this->assertSame( [ 'e-menu-toggle-closed', 'e-menu-toggle-open' ], $this->get_config( 'e-menu-toggle' )['allowed_child_types'] );
		$this->assertSame( [], $this->get_config( 'e-menu-toggle-closed' )['allowed_child_types'] );
		$this->assertSame( [], $this->get_config( 'e-menu-toggle-open' )['allowed_child_types'] );
		$this->assertSame( [ 'e-menu-entry' ], $this->get_config( 'e-menu-items' )['allowed_child_types'] );
		$this->assertSame( [ 'e-menu-item', 'e-menu-submenu-trigger', 'e-menu-submenu' ], $this->get_config( 'e-menu-entry' )['allowed_child_types'] );
		$this->assertSame( [], $this->get_config( 'e-menu-item' )['allowed_child_types'] );
	}

	public function test_entry_submenu_defaults_to_off() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		// Act.
		$prop = Atomic_Menu_Entry::get_props_schema()[ Atomic_Menu_Entry::SUBMENU_PROP ];

		// Assert.
		$this->assertSame( 'submenu', Atomic_Menu_Entry::SUBMENU_PROP );
		$this->assertSame( [
			'$$type' => 'boolean',
			'value' => false,
		], $prop->get_default() );
	}

	public function test_get_config__entry_declares_submenu_children_dependencies() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		// Act.
		$dependencies = $this->get_config( 'e-menu-entry' )['children_dependencies'];

		// Assert.
		$this->assertSame( [ 'e-menu-submenu-trigger', 'e-menu-submenu' ], array_column( $dependencies, 'child_type' ) );
		$this->assertSame(
			[
				[
					'kind' => 'after_type',
					'value' => 'e-menu-item',
				],
				[
					'kind' => 'after_type',
					'value' => 'e-menu-submenu-trigger',
				],
			],
			array_column( $dependencies, 'position' )
		);

		foreach ( $dependencies as $dependency ) {
			$this->assertTrue( $dependency['stash'] );
			$this->assertSame( 'eq', $dependency['when']['terms'][0]['operator'] );
			$this->assertSame( [ 'submenu' ], $dependency['when']['terms'][0]['path'] );
			$this->assertTrue( $dependency['when']['terms'][0]['value'] );
			$this->assertSame( $dependency['child_type'], $dependency['default_model']['elType'] );
			$this->assertTrue( $dependency['default_model']['isLocked'] );
			$this->assertTrue( $dependency['default_model']['hydrateDefaultChildren'] );
		}
	}

	public function test_default_content__no_entry_enables_submenu_when_locked() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		// Act.
		$entries = $this->get_config( 'e-menu' )['default_children'][0]['elements'];

		// Assert.
		foreach ( $entries as $entry ) {
			$this->assertArrayNotHasKey( Atomic_Menu_Entry::SUBMENU_PROP, $entry['settings'] ?? [] );
		}
	}

	public function test_default_content__products_entry_enables_submenu_when_unlocked() {
		// Arrange.
		add_filter( 'elementor/atomic-widgets/menu/submenu/is_locked', '__return_false' );
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		// Act.
		$entries = $this->get_config( 'e-menu' )['default_children'][0]['elements'];

		// Assert.
		$enabled = array_map(
			fn( $entry ) => $entry['settings'][ Atomic_Menu_Entry::SUBMENU_PROP ]['value'] ?? false,
			$entries
		);
		$this->assertSame( [ false, true, false, false ], $enabled );
		$this->assertSame( 'boolean', $entries[1]['settings'][ Atomic_Menu_Entry::SUBMENU_PROP ]['$$type'] );
		$this->assertSame( [ 'e-menu-item' ], array_column( $entries[1]['elements'], 'elType' ) );
	}

	public function test_menu_entries_size_to_their_content_instead_of_the_full_width_container_default() {
		// Arrange
		$entry = new \Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu_Entry\Atomic_Menu_Entry();

		// Act
		$styles = $entry->get_base_styles();
		$props = reset( $styles )['variants'][0]['props'];

		// Assert
		$this->assertSame( 'auto', $props['width']['value']['unit'] );
	}

	public function test_get_config__menu_item_exposes_its_style_states() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		// Act.
		$item_config = $this->get_config( 'e-menu-item' );

		// Assert.
		$this->assertSame(
			Atomic_Menu_Item::STYLE_STATES,
			array_column( $item_config['atomic_style_states'], 'value' )
		);

		foreach ( [ 'e-menu', 'e-menu-items', 'e-menu-entry' ] as $type ) {
			$this->assertSame( [], $this->get_config( $type )['atomic_style_states'], $type );
		}
	}

	public function test_get_selector_with_state__scopes_each_menu_item_state() {
		// Act & Assert.
		foreach ( Atomic_Menu_Item::STYLE_STATES as $state ) {
			$this->assertTrue( Style_States::is_valid_state( $state ), $state );
			$this->assertSame( ".menu-item.{$state}", Style_States::get_selector_with_state( '.menu-item', $state ), $state );
		}
	}

	public function test_get_config__exposes_style_tab_requirements_for_all_menu_layers() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		foreach ( array_merge( [ 'e-menu' ], self::LOCKED_TYPES ) as $type ) {
			// Act.
			$config = $this->get_config( $type );

			// Assert.
			$this->assertArrayNotHasKey( 'hide_design_tabs', $config['meta'], $type );
			$this->assertArrayHasKey( 'classes', $config['atomic_props_schema'], $type );
			$this->assertNotEmpty( $config['base_styles'], $type );
		}
	}

	public function test_get_config__has_id_control_and_render_outputs_custom_attributes_for_all_menu_layers() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		foreach ( array_merge( [ 'e-menu' ], self::LOCKED_TYPES ) as $type ) {
			// Act.
			$config = $this->get_config( $type );

			// Assert.
			$this->assertArrayHasKey( 'attributes', $config['atomic_props_schema'], $type );

			$settings_section = array_values( array_filter(
				$config['atomic_controls'],
				fn( $section ) => 'settings' === $section->get_id()
			) );
			$binds = array_map( fn( $item ) => $item->get_bind(), $settings_section[0]->get_items() ?? [] );
			$this->assertContains( '_cssid', $binds, $type );
			$this->assertCount( 1, $settings_section, $type );
		}

		$renderer = Template_Renderer::instance();
		$renderer->register( 'elementor/macros', ELEMENTOR_PATH . 'modules/atomic-widgets/elements/base/_macros.html.twig' );

		foreach ( [
			'menu' => 'atomic-menu/atomic-menu/atomic-menu.html.twig',
			'toggle' => 'atomic-menu/atomic-menu-toggle/atomic-menu-toggle.html.twig',
			'locked' => 'atomic-menu/base/atomic-menu-locked-element.html.twig',
		] as $name => $path ) {
			$renderer->register( "test/{$name}", ELEMENTOR_PATH . 'modules/atomic-widgets/elements/' . $path );

			$html = $renderer->render( "test/{$name}", [
				'id' => 'abc',
				'type' => 'e-menu',
				'tag' => 'div',
				'settings' => [ 'attributes' => 'data-test-attr="yes"' ],
				'base_styles' => [],
				'interactions' => [],
			] );

			$this->assertStringContainsString( 'data-test-attr="yes"', $html, $name );
		}
	}

	public function test_menu_registers_the_current_handler_without_alpine() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );
		$menu = Plugin::$instance->elements_manager->get_element_types( 'e-menu' );

		// Act.
		$menu->register_frontend_handlers();
		$registered = wp_scripts()->registered['elementor-menu-current-handler'] ?? null;

		// Assert.
		$this->assertContains( 'elementor-menu-current-handler', $menu->get_script_depends() );
		$this->assertNotNull( $registered );
		$this->assertStringContainsString( 'js/menu-current-handler', $registered->src );
		$this->assertNotContains( 'elementor-alpinejs', $registered->deps );
	}

	public function test_menu_registers_the_current_preview_handler_without_alpine() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );
		$menu = Plugin::$instance->elements_manager->get_element_types( 'e-menu' );

		// Act.
		$menu->register_frontend_handlers();
		$registered = wp_scripts()->registered['elementor-menu-current-preview-handler'] ?? null;

		// Assert.
		$this->assertNotNull( $registered );
		$this->assertStringContainsString( 'js/menu-current-preview-handler', $registered->src );
		$this->assertNotContains( 'elementor-alpinejs', $registered->deps );
	}

	public function test_rendered_menu_has_no_current_state_on_the_server() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );
		$item = Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'menuitem1',
			'elType' => 'e-menu-item',
			'settings' => [
				'link' => [
					'$$type' => 'link',
					'value' => [
						'destination' => [ '$$type' => 'url', 'value' => home_url( '/' ) ],
						'isTargetBlank' => [ '$$type' => 'boolean', 'value' => false ],
					],
				],
			],
			'elements' => [],
		] );

		// Act.
		ob_start();
		$item->print_element();
		$html = ob_get_clean();

		// Assert.
		$this->assertStringNotContainsString( 'e--current', $html );
		$this->assertStringNotContainsString( 'aria-current', $html );
	}

	public function test_default_content() {
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		$children = $this->get_config( 'e-menu' )['default_children'];

		$this->assertSame( [ 'e-menu-items', 'e-menu-toggle' ], array_column( $children, 'elType' ) );

		$toggle = $children[1];
		$this->assertSame( [ 'e-menu-toggle-closed', 'e-menu-toggle-open' ], array_column( $toggle['elements'], 'elType' ) );
		$this->assertTrue( $toggle['elements'][0]['hydrateDefaultChildren'] );
		$this->assertTrue( $toggle['elements'][1]['hydrateDefaultChildren'] );

		$closed_children = $this->get_config( 'e-menu-toggle-closed' )['default_children'];
		$open_children = $this->get_config( 'e-menu-toggle-open' )['default_children'];
		$this->assertSame( 'icon', $closed_children[0]['settings']['svg']['$$type'] );
		$this->assertSame( 'fa-solid fa-bars', $closed_children[0]['settings']['svg']['value']['value']['value'] );
		$this->assertSame( 'fa-solid', $closed_children[0]['settings']['svg']['value']['library']['value'] );
		$this->assertSame( 'fa-solid fa-xmark', $open_children[0]['settings']['svg']['value']['value']['value'] );

		$entries = $children[0]['elements'];
		$this->assertCount( 4, $entries );
		$this->assertSame(
			[ 'Home', 'Products', 'About', 'Contact' ],
			array_map( fn( $entry ) => $entry['editor_settings']['title'], $entries )
		);

		foreach ( $entries as $entry ) {
			$this->assertSame( 'e-menu-entry', $entry['elType'] );
			$this->assertCount( 1, $entry['elements'] );
			$this->assertSame( 'e-menu-item', $entry['elements'][0]['elType'] );
			$this->assertCount( 1, $entry['elements'][0]['elements'] );
			$this->assertSame( 'e-paragraph', $entry['elements'][0]['elements'][0]['widgetType'] );
			$this->assertSame(
				$entry['editor_settings']['title'],
				$entry['elements'][0]['elements'][0]['settings']['paragraph']['value']
			);
		}

	}

	public function test_menu_name_defaults_to_menu() {
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		$schema = $this->get_config( 'e-menu' )['atomic_props_schema'];

		$this->assertSame( 'Menu', $schema['menu-name']->get_default()['value'] );
	}

	public function test_rendered_html_structure() {
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		$html = $this->render_menu();

		$document = new \DOMDocument();
		libxml_use_internal_errors( true );
		$document->loadHTML( '<?xml encoding="utf-8" ?>' . $html );
		$xpath = new \DOMXPath( $document );

		$navs = $xpath->query( '//nav' );
		$this->assertSame( 1, $navs->length );
		$this->assertSame( 'Menu', $navs->item( 0 )->getAttribute( 'aria-label' ) );

		$this->assertSame( 1, $xpath->query( '//nav/ul' )->length );
		$this->assertSame( 4, $xpath->query( '//nav/ul/li' )->length );
		$this->assertSame( 4, $xpath->query( '//nav/ul/li/span' )->length );

		$texts = [];
		foreach ( $xpath->query( '//nav/ul/li/span' ) as $span ) {
			$texts[] = trim( $span->textContent );
		}
		$this->assertSame( [ 'Home', 'Products', 'About', 'Contact' ], $texts );

	}

	public function test_entry_without_item_content_is_not_rendered_on_the_frontend() {
		// Arrange
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		// Act
		$html = $this->render_menu( [], null, true );

		// Assert
		$this->assertSame( 3, substr_count( $html, '<li' ) );
		$this->assertStringNotContainsString( 'Home', $html );
	}

	public function test_is_empty__ignores_submenu_layers_and_counts_only_item_content() {
		// Arrange
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );
		$entry = Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'entry1',
			'elType' => Atomic_Menu::ELEMENT_TYPE_ENTRY,
			'settings' => [],
			'elements' => [],
		] );
		$children_property = new \ReflectionProperty( \Elementor\Element_Base::class, 'children' );
		$children_property->setAccessible( true );
		$is_empty = new \ReflectionMethod( $entry, 'is_empty' );
		$is_empty->setAccessible( true );
		$item = fn ( array $children ) => $this->make_child_stub( Atomic_Menu::ELEMENT_TYPE_ITEM, $children );
		$layers = [
			$this->make_child_stub( Atomic_Menu::ELEMENT_TYPE_SUBMENU_TRIGGER, [ 'content' ] ),
			$this->make_child_stub( Atomic_Menu::ELEMENT_TYPE_SUBMENU, [ 'content' ] ),
		];

		// Act
		$children_property->setValue( $entry, array_merge( [ $item( [] ) ], $layers ) );
		$empty_item_with_layers = $is_empty->invoke( $entry );
		$children_property->setValue( $entry, array_merge( [ $item( [ 'content' ] ) ], $layers ) );
		$filled_item_with_layers = $is_empty->invoke( $entry );

		// Assert
		$this->assertTrue( $empty_item_with_layers );
		$this->assertFalse( $filled_item_with_layers );
	}

	private function make_child_stub( string $el_type, array $children ) {
		$stub = $this->createMock( \Elementor\Element_Base::class );
		$stub->method( 'get_data' )->willReturnCallback( fn ( $key = null ) => 'elType' === $key ? $el_type : null );
		$stub->method( 'get_children' )->willReturn( $children );

		return $stub;
	}

	public function test_entry_without_item_content_is_rendered_in_the_editor() {
		// Arrange
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );
		Plugin::$instance->editor->set_edit_mode( true );

		// Act
		$html = $this->render_menu( [], null, true );

		// Assert
		Plugin::$instance->editor->set_edit_mode( false );
		$this->assertSame( 4, substr_count( $html, '<li' ) );
	}

	public function test_rendered_aria_label_uses_menu_name() {
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		$html = $this->render_menu( [
			'menu-name' => [
				'$$type' => 'string',
				'value' => 'Main "navigation"',
			],
		] );

		$document = new \DOMDocument();
		libxml_use_internal_errors( true );
		$document->loadHTML( '<?xml encoding="utf-8" ?>' . $html );
		$nav = $document->getElementsByTagName( 'nav' )->item( 0 );

		$this->assertSame( 'Main "navigation"', $nav->getAttribute( 'aria-label' ) );
	}

	private function load_html( string $html ): \DOMXPath {
		$document = new \DOMDocument();
		libxml_use_internal_errors( true );
		$document->loadHTML( '<?xml encoding="utf-8" ?>' . $html );

		return new \DOMXPath( $document );
	}

	public function test_menu_item_renders_as_anchor_with_url_destination() {
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		$xpath = $this->load_html( $this->render_menu( [], [
			'$$type' => 'link',
			'value' => [
				'destination' => [
					'$$type' => 'url',
					'value' => 'https://example.com/home',
				],
				'isTargetBlank' => [
					'$$type' => 'boolean',
					'value' => true,
				],
			],
		] ) );

		$anchors = $xpath->query( '//nav/ul/li/a' );
		$this->assertSame( 1, $anchors->length );
		$this->assertSame( 'https://example.com/home', $anchors->item( 0 )->getAttribute( 'href' ) );
		$this->assertSame( '_blank', $anchors->item( 0 )->getAttribute( 'target' ) );
		$this->assertSame( 3, $xpath->query( '//nav/ul/li/span' )->length );
	}

	public function test_menu_item_link_to_a_page_resolves_to_its_permalink() {
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		$page_id = self::factory()->post->create( [
			'post_type' => 'page',
			'post_title' => 'About us',
			'post_status' => 'publish',
		] );

		$xpath = $this->load_html( $this->render_menu( [], [
			'$$type' => 'link',
			'value' => [
				'destination' => [
					'$$type' => 'query',
					'value' => [
						'id' => [
							'$$type' => 'number',
							'value' => $page_id,
						],
					],
				],
			],
		] ) );

		$anchors = $xpath->query( '//nav/ul/li/a' );
		$this->assertSame( 1, $anchors->length );
		$this->assertSame( get_permalink( $page_id ), $anchors->item( 0 )->getAttribute( 'href' ) );
	}

	public function test_menu_item_without_link_stays_a_span() {
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		$xpath = $this->load_html( $this->render_menu() );

		$this->assertSame( 0, $xpath->query( '//nav//a' )->length );
	}

	public function test_menu_settings_defaults() {
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		$schema = $this->get_config( 'e-menu' )['atomic_props_schema'];

		$this->assertSame( 'click', $schema['open-submenus-on']->get_default()['value'] );
		$this->assertSame( 'tablet', $schema['collapse-breakpoint']->get_default()['value'] );
		$this->assertSame( 'one-per-level', $schema['collapsed-submenus']->get_default()['value'] );
		$this->assertSame( 'overlay', $schema['collapsed-position']->get_default()['value'] );
	}

	public function test_default_collapse_breakpoint_is_tablet_or_the_lowest_active_one() {
		$this->assertSame( 'tablet', Atomic_Menu::resolve_default_collapse_breakpoint( [ 'mobile', 'tablet', 'laptop' ] ) );
		$this->assertSame( 'mobile', Atomic_Menu::resolve_default_collapse_breakpoint( [ 'mobile', 'laptop' ] ) );
		$this->assertSame( 'tablet', Atomic_Menu::resolve_default_collapse_breakpoint( [] ) );
	}

	public function test_new_menu_stores_the_resolved_collapse_breakpoint_so_later_site_changes_do_not_move_it() {
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		$base_settings = $this->get_config( 'e-menu' )['base_settings'];

		$this->assertSame( 'string', $base_settings['collapse-breakpoint']['$$type'] );
		$this->assertSame( Atomic_Menu::get_default_collapse_breakpoint(), $base_settings['collapse-breakpoint']['value'] );
		$this->assertArrayNotHasKey( 'collapsed-position', $base_settings );
	}

	public function test_collapse_css_hides_the_toggle_by_default_and_collapses_at_each_active_breakpoint() {
		$css = Atomic_Menu::get_collapse_css();
		$tablet = Plugin::$instance->breakpoints->get_active_breakpoints( 'tablet' )->get_value();

		$this->assertStringContainsString( '.e-menu[data-e-collapse] > .e-menu-toggle-base{display:none}', $css );
		$this->assertStringContainsString( "@media(scripting:enabled) and (max-width:{$tablet}px){.e-menu[data-e-collapse=\"tablet\"]", $css );
		$this->assertStringContainsString( '[data-e-collapsed-position="overlay"] > .e-menu-items-base{position:absolute', $css );
	}

	public function test_collapse_breakpoint_schema__accepts_desktop_and_none() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );
		$prop_type = $this->get_config( 'e-menu' )['atomic_props_schema']['collapse-breakpoint'];

		// Act & Assert.
		$this->assertTrue( $prop_type->validate( [ '$$type' => 'string', 'value' => 'desktop' ] ) );
		$this->assertTrue( $prop_type->validate( [ '$$type' => 'string', 'value' => 'none' ] ) );
		$this->assertTrue( $prop_type->validate( [ '$$type' => 'string', 'value' => 'tablet' ] ) );
		$this->assertFalse( $prop_type->validate( [ '$$type' => 'string', 'value' => 'unknown' ] ) );
	}

	public function test_resolve_collapse_breakpoints__keeps_every_available_value() {
		// Act.
		$resolved = Atomic_Menu::resolve_collapse_breakpoints( [ 'mobile', 'tablet', 'laptop' ] );

		// Assert.
		$this->assertSame( 'mobile', $resolved['mobile'] );
		$this->assertSame( 'tablet', $resolved['tablet'] );
		$this->assertSame( 'laptop', $resolved['laptop'] );
		$this->assertSame( 'desktop', $resolved['desktop'] );
		$this->assertSame( 'none', $resolved['none'] );
	}

	public function test_resolve_collapse_breakpoints__a_removed_breakpoint_falls_to_the_next_smaller_one() {
		// Act.
		$resolved = Atomic_Menu::resolve_collapse_breakpoints( [ 'mobile', 'laptop' ] );

		// Assert.
		$this->assertSame( 'mobile', $resolved['mobile_extra'] );
		$this->assertSame( 'mobile', $resolved['tablet'] );
		$this->assertSame( 'mobile', $resolved['tablet_extra'] );
		$this->assertSame( 'laptop', $resolved['laptop'] );
	}

	public function test_resolve_collapse_breakpoints__falls_to_none_when_nothing_smaller_is_left() {
		// Act.
		$resolved = Atomic_Menu::resolve_collapse_breakpoints( [ 'tablet', 'laptop' ] );

		// Assert.
		$this->assertSame( 'none', $resolved['mobile'] );
		$this->assertSame( 'none', $resolved['mobile_extra'] );
		$this->assertSame( 'tablet', $resolved['tablet'] );
		$this->assertSame( 'desktop', $resolved['desktop'] );
	}

	public function test_resolve_collapse_breakpoints__with_no_active_breakpoints_only_desktop_and_none_remain() {
		// Act.
		$resolved = Atomic_Menu::resolve_collapse_breakpoints( [] );

		// Assert.
		$this->assertSame( 'none', $resolved['laptop'] );
		$this->assertSame( 'desktop', $resolved['desktop'] );
	}

	public function test_rendered_nav__keeps_desktop_and_none_as_the_collapse_breakpoint() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		foreach ( [ 'desktop', 'none' ] as $value ) {
			// Act.
			$html = $this->render_menu( [
				'collapse-breakpoint' => [
					'$$type' => 'string',
					'value' => $value,
				],
			] );

			// Assert.
			$this->assertSame( $value, $this->load_html( $html )->query( '//nav' )->item( 0 )->getAttribute( 'data-e-collapse' ) );
		}
	}

	public function test_rendered_nav__collapses_at_the_next_smaller_breakpoint_when_the_stored_one_is_no_longer_active() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );
		$this->assertArrayNotHasKey( 'laptop', Plugin::$instance->breakpoints->get_active_breakpoints() );

		foreach ( [
			'laptop' => 'tablet',
			'tablet_extra' => 'tablet',
			'mobile_extra' => 'mobile',
		] as $stored => $effective ) {
			// Act.
			$html = $this->render_menu( [
				'collapse-breakpoint' => [
					'$$type' => 'string',
					'value' => $stored,
				],
			] );

			// Assert.
			$this->assertSame( $effective, $this->load_html( $html )->query( '//nav' )->item( 0 )->getAttribute( 'data-e-collapse' ), $stored );
		}
	}

	public function test_rendered_nav__keeps_a_stored_extra_breakpoint_while_it_is_active() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );
		$this->activate_breakpoints( [ 'viewport_laptop' ] );

		try {
			// Act.
			$html = $this->render_menu( [
				'collapse-breakpoint' => [
					'$$type' => 'string',
					'value' => 'laptop',
				],
			] );
		} finally {
			$this->reset_breakpoints_to_default();
		}

		// Assert.
		$this->assertSame( 'laptop', $this->load_html( $html )->query( '//nav' )->item( 0 )->getAttribute( 'data-e-collapse' ) );
	}

	public function test_collapse_breakpoint_control__selects_the_resolved_option_for_a_breakpoint_that_is_no_longer_active() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		// Act.
		$props = $this->get_collapse_breakpoint_control_props();

		// Assert.
		$this->assertSame( 'tablet', $props['fallbackValues']['laptop'] );
		$this->assertSame( 'tablet', $props['fallbackValues']['tablet_extra'] );
		$this->assertSame( 'mobile', $props['fallbackValues']['mobile_extra'] );

		foreach ( [ 'mobile', 'tablet', 'desktop', 'none' ] as $kept ) {
			$this->assertArrayNotHasKey( $kept, $props['fallbackValues'] );
		}
	}

	public function test_collapse_breakpoint_control__lists_the_active_breakpoints_then_desktop_and_none() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );
		$this->activate_breakpoints( [ 'viewport_laptop' ] );

		try {
			// Act.
			$props = $this->get_collapse_breakpoint_control_props();
		} finally {
			$this->reset_breakpoints_to_default();
		}

		// Assert.
		$this->assertSame(
			[ 'mobile', 'tablet', 'laptop', 'desktop', 'none' ],
			array_column( $props['options'], 'value' )
		);
		$this->assertArrayNotHasKey( 'laptop', $props['fallbackValues'] );
	}

	private function get_collapse_breakpoint_control_props(): array {
		$menu = Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'menucontrols',
			'elType' => 'e-menu',
			'settings' => [],
			'elements' => [],
		] );

		$control = $this->find_control( $menu->get_atomic_controls(), 'collapse-breakpoint' );
		$this->assertNotNull( $control );

		return $control->get_props();
	}

	private function find_control( array $items, string $bind ) {
		foreach ( $items as $item ) {
			if ( method_exists( $item, 'get_bind' ) && $bind === $item->get_bind() ) {
				return $item;
			}

			if ( method_exists( $item, 'get_items' ) ) {
				$found = $this->find_control( $item->get_items(), $bind );

				if ( $found ) {
					return $found;
				}
			}
		}

		return null;
	}

	private function activate_breakpoints( array $keys ): void {
		$this->set_admin_user();

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit->set_settings( 'active_breakpoints', $keys );
		$kit->save( [ 'settings' => $kit->get_settings() ] );

		Plugin::$instance->documents->get( $kit->get_id(), false );
		Plugin::$instance->breakpoints->refresh();
	}

	public function test_get_config__stays_a_nested_templated_element_with_the_collapse_template_context() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		// Act.
		$config = $this->get_config( 'e-menu' );

		// Assert.
		$this->assertTrue( $config['support_nesting'] );
		$this->assertNotEmpty( $config['twig_main_template'] );
		$this->assertNotEmpty( $config['twig_templates'] );
		$this->assertArrayHasKey( 'collapse_breakpoints', $config['template_context'] );
	}

	public function test_resolve_collapse_breakpoints__widescreen_falls_to_desktop_unless_the_site_has_it() {
		// Act.
		$without = Atomic_Menu::resolve_collapse_breakpoints( [ 'mobile', 'tablet' ] );
		$with = Atomic_Menu::resolve_collapse_breakpoints( [ 'mobile', 'tablet', 'widescreen' ] );

		// Assert.
		$this->assertSame( 'desktop', $without['widescreen'] );
		$this->assertSame( 'widescreen', $with['widescreen'] );
		$this->assertSame( 'desktop', $with['desktop'] );
	}

	public function test_widescreen__is_offered_and_collapses_at_every_width_while_desktop_stops_where_it_starts() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );
		$this->activate_breakpoints( [ 'viewport_mobile', 'viewport_tablet', 'viewport_widescreen' ] );

		try {
			$widescreen_min = (int) Plugin::$instance->breakpoints->get_active_breakpoints( 'widescreen' )->get_value();

			// Act.
			$css = Atomic_Menu::get_collapse_css();
			$widths = Atomic_Menu::get_collapse_widths();
			$props = $this->get_collapse_breakpoint_control_props();
		} finally {
			$this->reset_breakpoints_to_default();
		}

		// Assert.
		$this->assertSame( [ 'mobile', 'tablet', 'desktop', 'widescreen' ], array_keys( $widths ) );
		$this->assertSame( $widescreen_min - 1, $widths['desktop'] );
		$this->assertNull( $widths['widescreen'] );
		$this->assertStringContainsString( '@media(scripting:enabled) and (max-width:' . ( $widescreen_min - 1 ) . 'px){.e-menu[data-e-collapse="desktop"]', $css );
		$this->assertStringContainsString( '@media(scripting:enabled){.e-menu[data-e-collapse="widescreen"]', $css );
		$this->assertSame( [ 'mobile', 'tablet', 'desktop', 'widescreen', 'none' ], array_column( $props['options'], 'value' ) );
	}

	public function test_widescreen__is_not_offered_when_the_site_does_not_have_it() {
		// Act.
		$widths = Atomic_Menu::get_collapse_widths();

		// Assert.
		$this->assertArrayNotHasKey( 'widescreen', $widths );
		$this->assertNull( $widths['desktop'] );
	}

	public function test_editor_canvas_and_frontend_resolve_the_collapse_breakpoint_the_same_way() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		$assert_both_agree = function ( array $expected ) {
			// The editor builds the canvas config once per load, so a changed breakpoint shows after a reload.
			$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

			$canvas_map = $this->get_config( 'e-menu' )['template_context']['collapse_breakpoints'];

			foreach ( $expected as $stored => $effective ) {
				$html = $this->render_menu( [
					'collapse-breakpoint' => [
						'$$type' => 'string',
						'value' => $stored,
					],
				] );

				// Assert.
				$this->assertSame( $effective, $canvas_map[ $stored ], "canvas: {$stored}" );
				$this->assertSame( $effective, $this->load_html( $html )->query( '//nav' )->item( 0 )->getAttribute( 'data-e-collapse' ), "frontend: {$stored}" );
			}
		};

		// Act & Assert.
		$assert_both_agree( [ 'laptop' => 'tablet', 'tablet' => 'tablet', 'mobile_extra' => 'mobile' ] );

		$this->activate_breakpoints( [ 'viewport_laptop', 'viewport_mobile_extra' ] );

		try {
			$assert_both_agree( [ 'laptop' => 'laptop', 'tablet' => 'tablet', 'mobile_extra' => 'mobile_extra' ] );
		} finally {
			$this->reset_breakpoints_to_default();
		}

		$assert_both_agree( [ 'laptop' => 'tablet', 'mobile_extra' => 'mobile' ] );
	}

	public function test_get_collapse_css__orders_the_blocks_from_the_smallest_breakpoint_to_desktop() {
		// Arrange.
		$this->activate_breakpoints( [ 'viewport_mobile_extra', 'viewport_tablet_extra', 'viewport_laptop' ] );

		try {
			// Act.
			$css = Atomic_Menu::get_collapse_css();
		} finally {
			$this->reset_breakpoints_to_default();
		}

		preg_match_all( '/\.e-menu\[data-e-collapse="(\w+)"\]:has\(> \.e-menu-toggle-base\)\{flex-wrap/', $css, $matches );

		// Assert.
		$this->assertSame(
			[ 'mobile', 'mobile_extra', 'tablet', 'tablet_extra', 'laptop', 'desktop' ],
			$matches[1]
		);
	}

	public function test_resolve_collapse_breakpoints__lists_the_keys_from_the_smallest_width_to_the_largest() {
		// Arrange.
		$default_widths = array_map(
			fn( array $config ) => $config['default_value'],
			Breakpoints_Manager::get_default_config()
		);

		// Act.
		$keys = array_diff( array_keys( Atomic_Menu::resolve_collapse_breakpoints( [] ) ), [ 'desktop', 'widescreen', 'none' ] );
		$widths = array_map( fn( string $key ) => $default_widths[ $key ], $keys );

		// Assert.
		$sorted = $widths;
		sort( $sorted );

		$this->assertSame( $sorted, $widths );
		$this->assertSame( [ 'desktop', 'widescreen', 'none' ], array_slice( array_keys( Atomic_Menu::resolve_collapse_breakpoints( [] ) ), -3 ) );
	}

	public function test_get_collapse_css__desktop_collapses_at_every_width_without_a_media_query() {
		// Act.
		$css = Atomic_Menu::get_collapse_css();

		// Assert.
		$scope = '.e-menu[data-e-collapse="desktop"]:has(> .e-menu-toggle-base)';
		$this->assertStringContainsString( "{$scope} > .e-menu-toggle-base{display:flex;", $css );
		$this->assertStringContainsString( "{$scope} > .e-menu-items-base{display:none}", $css );
		$this->assertStringContainsString( "{$scope}[data-e-open=\"true\"] > .e-menu-items-base{display:flex}", $css );
		$this->assertStringContainsString( '@media(scripting:enabled){' . $scope, $css );
	}

	public function test_get_collapse_css__none_never_collapses() {
		// Act.
		$css = Atomic_Menu::get_collapse_css();

		// Assert.
		$this->assertStringNotContainsString( 'data-e-collapse="none"', $css );
		$this->assertStringContainsString( '.e-menu[data-e-collapse] > .e-menu-toggle-base{display:none}', $css );
	}

	public function test_get_collapse_css__defaults_items_layout_in_every_collapsible_breakpoint_block() {
		// Act.
		$css = Atomic_Menu::get_collapse_css();

		// Assert.
		$blocks = substr_count( $css, '@media(scripting:enabled)' );
		$this->assertGreaterThan( 1, $blocks );
		$this->assertSame( $blocks, substr_count( $css, '> .e-menu-items-base){flex-direction:column;flex-basis:100%;width:100%}' ) );
	}

	public function test_get_collapse_css__uses_logical_properties_so_rtl_flips() {
		// Act.
		$css = Atomic_Menu::get_collapse_css();

		// Assert.
		$this->assertStringContainsString( 'inset-inline-start:0', $css );
		$this->assertDoesNotMatchRegularExpression( '/[{;](left|right|margin-left|margin-right|padding-left|padding-right):/', $css );
	}

	public function test_get_config__menu_items_base_style_keeps_the_skeleton_without_a_flex_direction() {
		// Arrange.
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		// Act.
		$config = $this->get_config( 'e-menu-items' );

		// Assert.
		$props = $config['base_styles']['e-menu-items-base']['variants'][0]['props'];
		$this->assertArrayNotHasKey( 'flex-direction', $props );
		$this->assertSame( 'flex', $props['display']['value'] );
		$this->assertSame( 'none', $props['list-style-type']['value'] );
		$this->assertSame( 16, $props['gap']['value']['size'] );
	}

	public function test_get_collapse_css__defaults_items_layout_with_zero_specificity() {
		// Act.
		$css = Atomic_Menu::get_collapse_css();

		// Assert.
		$this->assertStringNotContainsString( ':where(.e-menu-items-base)', $css );
		$this->assertStringContainsString( '{flex-direction:column;flex-basis:100%;width:100%}', $css );
		$this->assertMatchesRegularExpression( '/:where\([^{]*> \.e-menu-items-base\)\{flex-direction:column;flex-basis:100%;width:100%\}/', $css );
		$this->assertDoesNotMatchRegularExpression( '/> \.e-menu-items-base\{[^}]*flex-direction/', $css );
	}

	public function test_get_collapse_css__keeps_toggle_rules_forced() {
		// Act.
		$css = Atomic_Menu::get_collapse_css();

		// Assert.
		$this->assertStringContainsString( '> .e-menu-toggle-base{display:flex;order:-1;flex:0 0 auto;width:auto;', $css );
	}

	public function test_rendered_toggle_is_a_labelled_button_after_the_items() {
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		$xpath = $this->load_html( $this->render_menu() );

		$buttons = $xpath->query( '//nav/button[@type="button"]' );
		$this->assertSame( 1, $buttons->length );
		$this->assertSame( 'Open menu', $buttons->item( 0 )->getAttribute( 'aria-label' ) );
		$this->assertSame( 'Close menu', $buttons->item( 0 )->getAttribute( 'data-e-label-close' ) );
		$this->assertSame( 'false', $buttons->item( 0 )->getAttribute( 'aria-expanded' ) );
		$this->assertSame( 1, $xpath->query( '//nav/ul/following-sibling::button' )->length );
		$this->assertSame( 2, $xpath->query( '//nav/button/div' )->length );
	}

	public function test_rendered_nav_carries_the_collapse_settings() {
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		$html = $this->render_menu( [
			'collapse-breakpoint' => [
				'$$type' => 'string',
				'value' => 'mobile',
			],
			'collapsed-position' => [
				'$$type' => 'string',
				'value' => 'in-flow',
			],
		] );

		$nav = $this->load_html( $html )->query( '//nav' )->item( 0 );

		$this->assertSame( 'mobile', $nav->getAttribute( 'data-e-collapse' ) );
		$this->assertSame( 'in-flow', $nav->getAttribute( 'data-e-collapsed-position' ) );
	}

	public function test_menu_saved_without_a_toggle_renders_no_toggle() {
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		$seq = 0;
		$tree = $this->expand( [
			'elType' => 'e-menu',
			'settings' => [],
			'elements' => [ $this->get_config( 'e-menu' )['default_children'][0] ],
		], $seq );

		$instance = Plugin::$instance->elements_manager->create_element_instance( $tree );

		ob_start();
		$instance->print_element();
		$xpath = $this->load_html( ob_get_clean() );

		$this->assertSame( 0, $xpath->query( '//nav/button' )->length );
	}

	public function test_custom_aria_label_attribute_replaces_the_default_label() {
		// Arrange
		$dir = ELEMENTOR_PATH . 'modules/atomic-widgets/elements/atomic-menu/';
		$renderer = Template_Renderer::instance();
		$renderer->register( 'elementor/macros', ELEMENTOR_PATH . 'modules/atomic-widgets/elements/base/_macros.html.twig' );
		$renderer->register( 'test/toggle', $dir . 'atomic-menu-toggle/atomic-menu-toggle.html.twig' );

		// Act
		$html = $renderer->render( 'test/toggle', [
			'id' => 'abc',
			'type' => 'e-menu-toggle',
			'interaction_id' => 'abc',
			'base_styles' => [ 'base' => 'e-menu-toggle-base' ],
			'settings' => [
				'attributes' => 'aria-label="Site navigation"',
			],
		] );

		// Assert
		$button = $this->load_html( $html )->query( '//button' )->item( 0 );
		$this->assertSame( 'Site navigation', $button->getAttribute( 'aria-label' ) );
		$this->assertSame( 'true', $button->getAttribute( 'data-e-custom-label' ) );
		$this->assertSame( '', $button->getAttribute( 'data-e-label-open' ) );
	}

	public function test_render__falls_back_to_resolved_default_breakpoint_when_setting_missing() {
		// Arrange.
		$menu = new Atomic_Menu( [ 'id' => 'm1', 'settings' => [], 'elType' => 'e-menu' ] );

		// Act.
		ob_start();
		$menu->print_element();
		$html = ob_get_clean();

		// Assert.
		$this->assertStringContainsString( 'data-e-collapse="' . Atomic_Menu::get_default_collapse_breakpoint() . '"', $html );
	}

	public function test_collapse_css_only_collapses_menus_that_have_a_toggle() {
		// Act.
		$css = Atomic_Menu::get_collapse_css();
		$tablet = Plugin::$instance->breakpoints->get_active_breakpoints( 'tablet' )->get_value();

		// Assert.
		$this->assertStringContainsString( "@media(scripting:enabled) and (max-width:{$tablet}px){.e-menu[data-e-collapse=\"tablet\"]:has(> .e-menu-toggle-base)", $css );
		$this->assertStringNotContainsString( '.e-menu[data-e-collapse="tablet"] > .e-menu-items-base{display:none', $css );
		$this->assertStringContainsString( '.e-menu[data-e-collapse="tablet"]:has(> .e-menu-toggle-base) > .e-menu-items-base{display:none', $css );
	}

	public function test_collapse_css_applies_only_when_scripting_is_enabled() {
		// Act.
		$css = Atomic_Menu::get_collapse_css();

		// Assert.
		$this->assertStringNotContainsString( '@media(max-width', $css );
		$this->assertStringContainsString( '@media(scripting:enabled) and (max-width:', $css );
	}

	/**
	 * @dataProvider custom_label_attribute_provider
	 */
	public function test_custom_label_attribute_forms( string $attributes, bool $is_custom ) {
		// Arrange.
		$renderer = Template_Renderer::instance();
		$renderer->register( 'elementor/macros', ELEMENTOR_PATH . 'modules/atomic-widgets/elements/base/_macros.html.twig' );
		$renderer->register( 'test/toggle', ELEMENTOR_PATH . 'modules/atomic-widgets/elements/atomic-menu/atomic-menu-toggle/atomic-menu-toggle.html.twig' );

		// Act.
		$html = $renderer->render( 'test/toggle', [
			'id' => 'abc',
			'type' => 'e-menu-toggle',
			'interaction_id' => 'abc',
			'base_styles' => [ 'base' => 'e-menu-toggle-base' ],
			'settings' => [ 'attributes' => $attributes ],
		] );

		// Assert.
		$button = $this->load_html( $html )->query( '//button' )->item( 0 );
		$this->assertSame( $is_custom ? 'true' : '', $button->getAttribute( 'data-e-custom-label' ) );
	}

	public function custom_label_attribute_provider(): array {
		return [
			'plain' => [ 'aria-label="Site navigation"', true ],
			'upper case' => [ 'ARIA-LABEL="Site navigation"', true ],
			'spaced' => [ 'aria-label = "Site navigation"', true ],
			'labelledby' => [ 'aria-labelledby="heading"', true ],
			'after another attribute' => [ 'data-x="1" aria-label="Site"', true ],
			'unrelated attribute' => [ 'data-aria-label-x="1"', false ],
		];
	}

	public function test_entry_base_styles__lays_out_content_as_a_row() {
		// Arrange.
		$entry = new Atomic_Menu_Entry( [ 'id' => 'e1', 'elType' => 'e-menu-entry' ] );
		$method = new \ReflectionMethod( $entry, 'define_base_style_props' );
		$method->setAccessible( true );

		// Act.
		$styles = $method->invoke( $entry );

		// Assert.
		$this->assertSame( 'flex', $styles['display']['value'] );
		$this->assertSame( 'center', $styles['align-items']['value'] );
	}
}
