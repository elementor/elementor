<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Elements\AtomicMenu;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
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

	private function render_menu( array $settings = [], ?array $first_item_link = null ): string {
		$seq = 0;
		$children = $this->get_config( 'e-menu' )['default_children'];

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

		$this->assertSame( [ 'e-menu-items' ], $this->get_config( 'e-menu' )['allowed_child_types'] );
		$this->assertSame( [ 'e-menu-entry' ], $this->get_config( 'e-menu-items' )['allowed_child_types'] );
		$this->assertSame( [ 'e-menu-item' ], $this->get_config( 'e-menu-entry' )['allowed_child_types'] );
		$this->assertSame( [], $this->get_config( 'e-menu-item' )['allowed_child_types'] );
	}

	public function test_only_elements_with_restricted_children_enforce_them_in_the_editor() {
		$this->register_elements_with_experiment( Experiments_Manager::STATE_ACTIVE );

		foreach ( [ 'e-menu', 'e-menu-items', 'e-menu-entry' ] as $type ) {
			$this->assertTrue( $this->get_config( $type )['meta']['enforce_allowed_children'], $type );
		}

		$this->assertArrayNotHasKey( 'enforce_allowed_children', $this->get_config( 'e-menu-item' )['meta'] );
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

		$this->assertSame( [ 'e-menu-items' ], array_column( $children, 'elType' ) );

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
}
