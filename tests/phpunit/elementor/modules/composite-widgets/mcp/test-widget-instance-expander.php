<?php

namespace Elementor\Testing\Modules\CompositeWidgets\Mcp;

use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Markers;
use Elementor\Modules\CompositeWidgets\ClosedStructure\Closed_Structure;
use Elementor\Modules\CompositeWidgets\Definitions\Widgets_Definitions_Registry;
use Elementor\Modules\CompositeWidgets\Instance\Widget_Instance_Factory;
use Elementor\Modules\CompositeWidgets\Mcp\Widget_Instance_Expander;
use Elementor\Modules\CompositeWidgets\Site\Site_Widgets_Access_Controller;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Tag_Expanders;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Widget_Type_Resolver;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Xml_Parser;
use Elementor\Modules\Mcp\Abilities\Build_Composition_Ability;
use Elementor\Modules\Mcp\Utils\Pro_Features_Discovery;
use Elementor\Plugin;
use Elementor\Testing\Modules\CompositeWidgets\Fixtures\Composite_Widgets_Registry_Factory;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__ . '/../fixtures/composite-widgets-registry-factory.php';

class Test_Widget_Instance_Expander extends Elementor_Test_Base {

	private Widgets_Definitions_Registry $registry;

	public function setUp(): void {
		parent::setUp();

		$this->registry = Composite_Widgets_Registry_Factory::make();
		add_filter( Tag_Expanders::FILTER, fn () => [ new Widget_Instance_Expander( fn () => $this->registry ) ], 20 );
	}

	public function tearDown(): void {
		remove_all_filters( Tag_Expanders::FILTER );
		remove_all_filters( Site_Widgets_Access_Controller::ACCESS_FILTER );

		parent::tearDown();
	}

	public function test_execute__inserts_a_widget_instance_with_part_settings_and_styles() {
		// Arrange.
		$this->act_as_admin();
		$post_id = $this->create_document();

		// Act.
		$result = $this->make_ability()->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-flexbox configuration-id="row"><e-widget configuration-id="card"/></e-flexbox>',
			'element_config' => [
				'card' => [ 'widget_id' => Composite_Widgets_Registry_Factory::CODE_WIDGET_ID ],
				'card.title' => [ 'title' => 'Hello widget' ],
			],
			'style' => [
				'card' => 'margin-top: 10px;',
				'card.title' => 'color: #ff0000;',
			],
		] );

		// Assert.
		$this->assertIsArray( $result, is_wp_error( $result ) ? $result->get_error_message() : '' );
		$this->assertArrayNotHasKey( 'warnings', $result );

		$root = $this->get_saved_elements( $post_id )[0]['elements'][0];
		[ $title, $slot ] = $root['elements'];

		$this->assertSame( [
			'id' => Composite_Widgets_Registry_Factory::CODE_WIDGET_ID,
			'version' => Composite_Widgets_Registry_Factory::WIDGET_VERSION,
		], $root[ Widget_Markers::WIDGET_KEY ] );
		$this->assertSame( 'root', $root[ Widget_Markers::PART_KEY ] );
		$this->assertSame( 'card', $root['editor_settings']['title'] );
		$this->assertStringContainsString( 'id="' . $root['id'] . '"', $result['resolved_xml'] );

		$this->assertSame( 'title', $title[ Widget_Markers::PART_KEY ] );
		$this->assertTrue( $title[ Widget_Instance_Factory::LOCKED_KEY ] );
		$this->assertStringContainsString( 'Hello widget', wp_json_encode( $title['settings']['title'] ) );
		$this->assertSame( [ 'color' ], $this->get_local_style_prop_names( $title ) );

		$this->assertTrue( $slot[ Widget_Markers::SLOT_KEY ] );

		$this->assertCount( 1, $root['styles'] );
		$this->assertSame( [ 'padding', 'margin' ], $this->get_local_style_prop_names( $root ) );
	}

	/**
	 * @dataProvider invalid_instances_provider
	 */
	public function test_execute__rejects_an_invalid_widget_instance( array $card_config, string $expected_message ) {
		// Arrange.
		$this->act_as_admin();
		$post_id = $this->create_document();
		$this->given_site_widget_access( Site_Widgets_Access_Controller::ACCESS_ACTIVE );

		// Act.
		$result = $this->make_ability()->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-widget configuration-id="card"/>',
			'element_config' => [ 'card' => $card_config ],
		] );

		// Assert.
		$this->assertWPError( $result );
		$this->assertSame( Widget_Instance_Expander::ERROR_CODE, $result->get_error_code() );
		$this->assertStringContainsString( '[card]', $result->get_error_message() );
		$this->assertStringContainsString( $expected_message, $result->get_error_message() );
		$this->assertSame( [], $this->get_saved_elements( $post_id ) );
	}

	public function invalid_instances_provider(): array {
		return [
			'missing widget id' => [ [], 'widget_id' ],
			'unknown widget' => [ [ 'widget_id' => 'test/missing' ], 'Unknown widget' ],
			'archived site widget' => [ [ 'widget_id' => Composite_Widgets_Registry_Factory::ARCHIVED_SITE_WIDGET_ID ], 'archived' ],
		];
	}

	/**
	 * @dataProvider site_widget_access_provider
	 */
	public function test_execute__skips_a_site_widget_without_an_active_license( string $access, bool $is_inserted ) {
		// Arrange.
		$this->act_as_admin();
		$post_id = $this->create_document();
		$this->given_site_widget_access( $access );

		// Act.
		$result = $this->make_ability()->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-flexbox configuration-id="row"><e-widget configuration-id="promo"/><e-heading configuration-id="heading"/></e-flexbox>',
			'element_config' => [ 'promo' => [ 'widget_id' => Composite_Widgets_Registry_Factory::SITE_WIDGET_ID ] ],
		] );

		// Assert.
		$this->assertIsArray( $result, is_wp_error( $result ) ? $result->get_error_message() : '' );

		$children = $this->get_saved_elements( $post_id )[0]['elements'];
		$expected_children = $is_inserted ? [ 'promo', 'heading' ] : [ 'heading' ];
		$this->assertSame( $expected_children, array_column( array_column( $children, 'editor_settings' ), 'title' ) );
		$this->assertSame( $is_inserted, empty( $result['pro_features_discovery'] ) );
	}

	public function site_widget_access_provider(): array {
		return [
			'active license' => [ Site_Widgets_Access_Controller::ACCESS_ACTIVE, true ],
			'expired license' => [ Site_Widgets_Access_Controller::ACCESS_EXPIRED, false ],
			'no license' => [ Site_Widgets_Access_Controller::ACCESS_NONE, false ],
		];
	}

	public function test_execute__reports_a_site_widget_alone_as_pro_required() {
		// Arrange.
		$this->act_as_admin();
		$post_id = $this->create_document();
		$this->given_site_widget_access( Site_Widgets_Access_Controller::ACCESS_NONE );

		// Act.
		$result = $this->make_ability()->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-widget configuration-id="promo"/>',
			'element_config' => [ 'promo' => [ 'widget_id' => Composite_Widgets_Registry_Factory::SITE_WIDGET_ID ] ],
		] );

		// Assert.
		$this->assertWPError( $result );
		$this->assertSame( Pro_Features_Discovery::ERROR_CODE, $result->get_error_code() );
	}

	public function test_execute__rejects_a_configuration_id_that_is_also_a_part_key() {
		// Arrange.
		$this->act_as_admin();
		$post_id = $this->create_document();

		// Act.
		$result = $this->make_ability()->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-flexbox configuration-id="row"><e-widget configuration-id="card"/><e-heading configuration-id="card.title"/></e-flexbox>',
			'element_config' => [ 'card' => [ 'widget_id' => Composite_Widgets_Registry_Factory::CODE_WIDGET_ID ] ],
		] );

		// Assert.
		$this->assertWPError( $result );
		$this->assertSame( Widget_Instance_Expander::ERROR_CODE, $result->get_error_code() );
		$this->assertStringContainsString( '[card.title]', $result->get_error_message() );
	}

	public function test_execute__rejects_a_widget_tag_without_a_configuration_id() {
		// Arrange.
		$this->act_as_admin();
		$post_id = $this->create_document();

		// Act.
		$result = $this->make_ability()->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-flexbox configuration-id="row"><e-widget/></e-flexbox>',
		] );

		// Assert.
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_missing_configuration_id', $result->get_error_code() );
	}

	public function test_execute__warns_about_keys_that_match_no_part() {
		// Arrange.
		$this->act_as_admin();
		$post_id = $this->create_document();

		// Act.
		$result = $this->make_ability()->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-widget configuration-id="card"/>',
			'element_config' => [ 'card' => [
				'widget_id' => Composite_Widgets_Registry_Factory::CODE_WIDGET_ID,
				'title' => 'Not a widget setting',
			] ],
			'style' => [ 'card.subtitle' => 'color: red;' ],
		] );

		// Assert.
		$this->assertIsArray( $result, is_wp_error( $result ) ? $result->get_error_message() : '' );
		$this->assertSame(
			[ Widget_Instance_Expander::KEY_IGNORED_WARNING, Widget_Instance_Expander::PART_NOT_FOUND_WARNING ],
			array_column( $result['warning_details'], 'code' )
		);
	}

	public function test_execute__rejects_children_inside_a_widget_tag() {
		// Arrange.
		$this->act_as_admin();
		$post_id = $this->create_document();

		// Act.
		$result = $this->make_ability()->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-widget configuration-id="card"><e-heading configuration-id="extra"/></e-widget>',
			'element_config' => [ 'card' => [ 'widget_id' => Composite_Widgets_Registry_Factory::CODE_WIDGET_ID ] ],
		] );

		// Assert.
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_invalid_child_type', $result->get_error_code() );
	}

	public function test_execute__inserts_a_widget_into_another_widget_slot_but_not_into_a_part() {
		// Arrange.
		$this->act_as_admin();
		$post_id = $this->create_document();
		$this->make_ability()->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-widget configuration-id="outer"/>',
			'element_config' => [ 'outer' => [ 'widget_id' => Composite_Widgets_Registry_Factory::CODE_WIDGET_ID ] ],
		] );
		[ $title, $slot ] = $this->get_saved_elements( $post_id )[0]['elements'];
		$inner_widget = [
			'post_id' => $post_id,
			'xml_structure' => '<e-widget configuration-id="inner"/>',
			'element_config' => [ 'inner' => [ 'widget_id' => Composite_Widgets_Registry_Factory::CODE_WIDGET_ID ] ],
		];

		// Act.
		$into_slot = $this->make_ability()->execute( $inner_widget + [ 'parent_id' => $slot['id'] ] );
		$into_part = $this->make_ability()->execute( $inner_widget + [ 'parent_id' => $title['id'] ] );

		// Assert.
		$this->assertIsArray( $into_slot, is_wp_error( $into_slot ) ? $into_slot->get_error_message() : '' );
		$this->assertWPError( $into_part );
		$this->assertSame( Closed_Structure::ERROR_CODE, $into_part->get_error_code() );
	}

	public function test_resolve_type_config__treats_the_widget_tag_as_unknown_without_its_expander() {
		// Arrange.
		$resolver = new Widget_Type_Resolver( new Xml_Parser() );

		// Act.
		$config = $resolver->resolve_type_config( Widget_Instance_Expander::TAG );

		// Assert.
		$this->assertWPError( $config );
		$this->assertSame( 'elementor_unknown_type', $config->get_error_code() );
	}

	private function make_ability(): Build_Composition_Ability {
		return new Build_Composition_Ability( null, new Closed_Structure( $this->registry ) );
	}

	private function given_site_widget_access( string $access ): void {
		add_filter( Site_Widgets_Access_Controller::ACCESS_FILTER, fn () => $access );
	}

	private function create_document(): int {
		return $this->factory()->create_and_get_custom_post( [ 'post_status' => 'draft' ] )->ID;
	}

	private function get_saved_elements( int $post_id ): array {
		$elements = Plugin::$instance->documents->get( $post_id, false )->get_elements_data();

		return is_array( $elements ) ? $elements : [];
	}

	/**
	 * @return string[]
	 */
	private function get_local_style_prop_names( array $element ): array {
		$style = array_values( $element['styles'] ?? [] )[0] ?? [];

		return array_keys( $style['variants'][0]['props'] ?? [] );
	}
}
