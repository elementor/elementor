<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Elements\AtomicMenu;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu\Atomic_Menu;
use Elementor\Modules\AtomicWidgets\Elements\TemplateRenderer\Template_Renderer;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Atomic_Menu extends Elementor_Test_Base {

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
		$this->assertSame( [ 'e-menu-item' ], $this->get_config( 'e-menu-entry' )['allowed_child_types'] );
		$this->assertSame( [], $this->get_config( 'e-menu-item' )['allowed_child_types'] );
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
}
