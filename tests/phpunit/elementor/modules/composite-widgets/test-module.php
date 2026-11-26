<?php

namespace Elementor\Testing\Modules\CompositeWidgets;

use Elementor\Modules\AtomicWidgets\Elements\Base\Element_Builder;
use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Builder;
use Elementor\Modules\AtomicWidgets\PropTypes\Escaped_Html_Prop_Type;
use Elementor\Modules\CompositeWidgets\Definitions\Widget_Definition;
use Elementor\Modules\CompositeWidgets\Definitions\Widgets_Definitions_Registry;
use Elementor\Modules\CompositeWidgets\Definitions\Site_Definitions_Registrar;
use Elementor\Modules\CompositeWidgets\Module;
use Elementor\Plugin;
use Elementor\Testing\Modules\CompositeWidgets\Fixtures\Site_Definition_Fixture;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__ . '/fixtures/site-definition-fixture.php';
require_once __DIR__ . '/../components/mocks/mock-pro-license-api.php';

class Test_Module extends Elementor_Test_Base {
	const ICON_BUTTON_ID = 'elementor/icon-button';
	const THIRD_PARTY_ID = 'acme/badge';
	const LOCKING_WIDGET_ID = 'acme/card';
	const UNREGISTERED_WIDGET_ID = 'acme/removed';

	public function test_editor_settings__expose_registered_definitions_without_panel_presets() {
		// Arrange.
		new Module();

		// Act.
		$settings = apply_filters( 'elementor/editor/localize_settings', [ 'elementsPresets' => [] ] );

		// Assert.
		$this->assertSame(
			array_merge( Module::EDITOR_DEFINITION_KEYS, [ Module::INSERTABLE_KEY ] ),
			array_keys( $settings['compositeWidgets'][ self::ICON_BUTTON_ID ] )
		);
		$this->assertSame( Widget_Definition::SOURCE_CODE, $settings['compositeWidgets'][ self::ICON_BUTTON_ID ]['source'] );
		$this->assertTrue( $settings['compositeWidgets'][ self::ICON_BUTTON_ID ][ Module::INSERTABLE_KEY ] );
		$this->assertSame( [], $settings['elementsPresets'] );
	}

	public function test_register_hook__adds_third_party_definitions_next_to_core_ones() {
		// Arrange.
		add_action( Module::REGISTER_HOOK, function ( Widgets_Definitions_Registry $registry ) {
			$registry->register(
				Widget_Definition::make( self::THIRD_PARTY_ID )
					->title( 'Badge' )
					->template(
						Element_Builder::make( 'e-flexbox' )
							->part( 'root' )
							->children( [
								Widget_Builder::make( 'e-paragraph' )
									->part( 'text' )
									->settings( [ 'paragraph' => Escaped_Html_Prop_Type::generate( 'New' ) ] )
									->build(),
							] )
							->build()
					)
					->general( [
						[
							'section' => 'Content',
							'fields' => [
								[
									'label' => 'Text',
									'target' => [
										'part' => 'text',
										'prop' => 'paragraph',
									],
								],
							],
						],
					] )
			);
		} );

		$module = new Module();

		// Act.
		$definitions = $module->get_registry()->all();

		// Assert.
		$this->assertSame( [ self::ICON_BUTTON_ID, self::THIRD_PARTY_ID ], array_keys( $definitions ) );
	}

	public function test_get_registry__fires_the_register_hook_once() {
		// Arrange.
		$module = new Module();
		$calls = 0;
		add_action( Module::REGISTER_HOOK, function () use ( &$calls ) {
			$calls++;
		} );

		// Act.
		$module->get_registry();
		$module->get_registry();

		// Assert.
		$this->assertSame( 1, $calls );
	}

	public function test_register_site_hook__registers_site_definitions_before_code_ones() {
		// Arrange.
		$this->register_site_widget();
		$module = new Module();

		// Act.
		$definitions = $module->get_registry()->all();

		// Assert.
		$this->assertSame( Site_Definition_Fixture::WIDGET_ID, array_key_first( $definitions ) );
		$this->assertSame( Widget_Definition::SOURCE_SITE, $definitions[ Site_Definition_Fixture::WIDGET_ID ]['source'] );
	}

	public function test_editor_settings__flag_archived_site_widgets_as_not_insertable() {
		// Arrange.
		\Mock_Pro_License_API::set_license_state( true, false );
		$this->register_site_widget( true );
		new Module();

		// Act.
		$settings = apply_filters( 'elementor/editor/localize_settings', [] );

		// Assert.
		$definition = $settings['compositeWidgets'][ Site_Definition_Fixture::WIDGET_ID ];
		$this->assertTrue( $definition[ Widgets_Definitions_Registry::ARCHIVED_KEY ] );
		$this->assertFalse( $definition[ Module::INSERTABLE_KEY ] );
	}

	/**
	 * @dataProvider site_widget_insertable_provider
	 */
	public function test_editor_settings__flag_site_widgets_insertable_only_with_an_active_license( bool $is_active, bool $is_expired, bool $is_insertable ) {
		// Arrange.
		\Mock_Pro_License_API::set_license_state( $is_active, $is_expired );
		$this->register_site_widget();
		new Module();

		// Act.
		$settings = apply_filters( 'elementor/editor/localize_settings', [] );

		// Assert.
		$definition = $settings['compositeWidgets'][ Site_Definition_Fixture::WIDGET_ID ];
		$this->assertSame( Widget_Definition::SOURCE_SITE, $definition['source'] );
		$this->assertSame( $is_insertable, $definition[ Module::INSERTABLE_KEY ] );
	}

	public function site_widget_insertable_provider(): array {
		return [
			'active license' => [ true, false, true ],
			'expired license' => [ false, true, false ],
			'no license' => [ false, false, false ],
		];
	}

	/**
	 * @dataProvider site_widget_render_provider
	 */
	public function test_frontend_render__renders_site_widget_copies_only_with_access( bool $is_active, bool $is_expired, bool $is_copy_rendered ) {
		// Arrange.
		\Mock_Pro_License_API::set_license_state( $is_active, $is_expired );
		new Module();
		$site_copy = $this->create_element( [
			'id' => 'sitecopy',
			'part' => 'root',
			'widget' => [
				'id' => Site_Definition_Fixture::WIDGET_ID,
				'version' => 1,
			],
			'elements' => [
				[
					'id' => 'sitechild',
					'elType' => 'widget',
					'widgetType' => 'e-heading',
					'part' => 'title',
					'settings' => [],
					'elements' => [],
				],
			],
		] );
		$plain = $this->create_element( [ 'id' => 'plainbox' ] );

		// Act.
		$site_copy_html = $this->render( $site_copy );
		$plain_html = $this->render( $plain );

		// Assert.
		$this->assertSame( $is_copy_rendered, false !== strpos( $site_copy_html, 'sitecopy' ) );
		$this->assertSame( $is_copy_rendered, false !== strpos( $site_copy_html, 'sitechild' ) );
		$this->assertStringContainsString( 'plainbox', $plain_html );
	}

	public function site_widget_render_provider(): array {
		return [
			'active license' => [ true, false, true ],
			'expired license' => [ false, true, true ],
			'no license' => [ false, false, false ],
		];
	}

	public function test_get_registry__finishes_when_the_site_provider_loads_documents_in_edit_mode() {
		// Arrange.
		$document = Plugin::$instance->documents->get( $this->factory()->post->create() );
		Plugin::$instance->editor->set_edit_mode( true );
		add_action( Module::REGISTER_SITE_HOOK, function ( Site_Definitions_Registrar $registrar ) use ( $document ) {
			apply_filters( 'elementor/document/load/data', $this->stale_widget_instances(), $document );

			$registrar->register( Site_Definition_Fixture::definition() );
		} );
		$module = new Module();

		// Act.
		$registry = $module->get_registry();

		// Assert.
		$this->assertNotNull( $registry->get( Site_Definition_Fixture::WIDGET_ID ) );
	}

	public function test_document_load__syncs_widget_locks_in_edit_mode() {
		// Arrange.
		$this->register_locking_widget();
		new Module();
		$document = Plugin::$instance->documents->get( $this->factory()->post->create() );
		Plugin::$instance->editor->set_edit_mode( true );

		// Act.
		$data = apply_filters( 'elementor/document/load/data', $this->stale_widget_instances(), $document );

		// Assert.
		$this->assertTrue( $data[0]['elements'][0]['isLocked'] );
		$this->assertArrayNotHasKey( 'isLocked', $data[1]['elements'][0] );
	}

	public function test_document_load__leaves_locks_alone_outside_the_editor() {
		// Arrange.
		$this->register_locking_widget();
		new Module();
		$document = Plugin::$instance->documents->get( $this->factory()->post->create() );
		Plugin::$instance->editor->set_edit_mode( false );

		// Act.
		$data = apply_filters( 'elementor/document/load/data', $this->stale_widget_instances(), $document );

		// Assert.
		$this->assertSame( $this->stale_widget_instances(), $data );
	}

	public function tearDown(): void {
		Plugin::$instance->editor->set_edit_mode( null );
		\Mock_Pro_License_API::reset();

		parent::tearDown();
	}

	private function create_element( array $data ) {
		return Plugin::$instance->elements_manager->create_element_instance( array_merge( [
			'elType' => 'e-flexbox',
			'settings' => [],
			'elements' => [],
		], $data ) );
	}

	private function render( $element ): string {
		ob_start();
		$element->print_element();

		return (string) ob_get_clean();
	}

	private function register_site_widget( bool $is_archived = false ): void {
		add_action( Module::REGISTER_SITE_HOOK, function ( Site_Definitions_Registrar $registrar ) use ( $is_archived ) {
			$registrar->register( Site_Definition_Fixture::definition(), $is_archived );
		} );
	}

	private function register_locking_widget(): void {
		add_action( Module::REGISTER_HOOK, function ( Widgets_Definitions_Registry $registry ) {
			$registry->register( [
				'id' => self::LOCKING_WIDGET_ID,
				'version' => 1,
				'title' => 'Card',
				'template' => [
					'elType' => 'e-flexbox',
					'part' => 'root',
					'elements' => [
						[
							'elType' => 'widget',
							'widgetType' => 'e-heading',
							'part' => 'title',
						],
					],
				],
				'general' => [],
			] );
		} );
	}

	private function stale_widget_instances(): array {
		return [
			[
				'id' => 'registered-root',
				'elType' => 'e-flexbox',
				'part' => 'root',
				'widget' => [
					'id' => self::LOCKING_WIDGET_ID,
					'version' => 1,
				],
				'elements' => [
					[
						'id' => 'registered-title',
						'elType' => 'widget',
						'widgetType' => 'e-heading',
						'part' => 'title',
					],
				],
			],
			[
				'id' => 'unregistered-root',
				'elType' => 'e-flexbox',
				'part' => 'root',
				'widget' => [
					'id' => self::UNREGISTERED_WIDGET_ID,
					'version' => 1,
				],
				'elements' => [
					[
						'id' => 'unregistered-title',
						'elType' => 'widget',
						'widgetType' => 'e-heading',
						'part' => 'title',
						'isLocked' => true,
					],
				],
			],
		];
	}
}
