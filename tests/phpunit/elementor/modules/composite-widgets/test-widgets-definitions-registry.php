<?php

namespace Elementor\Testing\Modules\CompositeWidgets;

use Elementor\Modules\AtomicWidgets\Elements\Base\Element_Builder;
use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Builder;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Escaped_Html_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Url_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Orchestrator;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\CompositeWidgets\Definitions\Definition_Migrator;
use Elementor\Modules\CompositeWidgets\Definitions\Validation\Widget_Definition_Validator;
use Elementor\Modules\CompositeWidgets\Definitions\Widget_Definition;
use Elementor\Modules\CompositeWidgets\Definitions\Widgets_Definitions_Registry;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Widgets_Definitions_Registry extends Elementor_Test_Base {
	const EXAMPLES_DIR = __DIR__ . '/../../../../../modules/composite-widgets/schema/examples/';
	const MIGRATIONS_DIR = __DIR__ . '/../../../../../migrations/';
	const ICON_BUTTON_ID = 'elementor/icon-button';
	const INCORRECT_USAGE = Widgets_Definitions_Registry::class . '::register';

	private Widgets_Definitions_Registry $registry;

	public function setUp(): void {
		parent::setUp();

		Migrations_Orchestrator::destroy();

		$this->registry = new Widgets_Definitions_Registry(
			Widget_Definition_Validator::make(),
			new Definition_Migrator( Migrations_Orchestrator::make( self::MIGRATIONS_DIR ) )
		);
	}

	public function tearDown(): void {
		Migrations_Orchestrator::destroy();

		parent::tearDown();
	}

	public function test_register_from_json__registers_every_example() {
		foreach ( glob( self::EXAMPLES_DIR . '*.json' ) as $file ) {
			// Act.
			$registered = $this->registry->register_from_json( $file );

			// Assert.
			$this->assertTrue( $registered, basename( $file ) );
		}

		$this->assertSame( [ self::ICON_BUTTON_ID, 'elementor/pricing-card' ], array_keys( $this->registry->all() ) );
	}

	public function test_register__defaults_source_to_code() {
		// Arrange.
		$definition = $this->read_example( 'icon-button.json' );
		unset( $definition['source'] );

		// Act.
		$this->registry->register( $definition );

		// Assert.
		$this->assertSame( Widget_Definition::SOURCE_CODE, $this->registry->get( self::ICON_BUTTON_ID )['source'] );
	}

	public function test_register__template_built_with_builders_matches_icon_button_json() {
		// Arrange.
		$json = $this->read_example( 'icon-button.json' );
		$definition = Widget_Definition::make( self::ICON_BUTTON_ID )
			->title( 'Icon button' )
			->template( $this->build_icon_button_template() )
			->general( $json['general'] );

		// Act.
		$registered = $this->registry->register( $definition );

		// Assert.
		$this->assertTrue( $registered );
		$this->assertEquals( $json['template'], $this->strip_builder_defaults( $this->registry->get( self::ICON_BUTTON_ID )['template'] ) );
	}

	public function test_register__rejects_a_declared_site_source() {
		// Arrange.
		$this->setExpectedIncorrectUsage( self::INCORRECT_USAGE );
		$definition = $this->read_example( 'icon-button.json' );
		$definition['source'] = Widget_Definition::SOURCE_SITE;

		// Act.
		$registered = $this->registry->register( $definition );

		// Assert.
		$this->assertFalse( $registered );
		$this->assertNull( $this->registry->get( self::ICON_BUTTON_ID ) );
	}

	public function test_register__drops_invalid_definition_with_doing_it_wrong() {
		// Arrange.
		$this->setExpectedIncorrectUsage( self::INCORRECT_USAGE );
		$definition = $this->read_example( 'icon-button.json' );
		$definition['template']['elements'][0]['widgetType'] = 'e-tabs';

		// Act.
		$registered = $this->registry->register( $definition );

		// Assert.
		$this->assertFalse( $registered );
		$this->assertNull( $this->registry->get( self::ICON_BUTTON_ID ) );
	}

	public function test_register__rejects_duplicate_id() {
		// Arrange.
		$this->setExpectedIncorrectUsage( self::INCORRECT_USAGE );
		$this->registry->register( $this->read_example( 'icon-button.json' ) );
		$duplicate = $this->read_example( 'icon-button.json' );
		$duplicate['title'] = 'Duplicate';

		// Act.
		$registered = $this->registry->register( $duplicate );

		// Assert.
		$this->assertFalse( $registered );
		$this->assertSame( 'Icon button', $this->registry->get( self::ICON_BUTTON_ID )['title'] );
	}

	public function test_register_from_json__rejects_unreadable_file() {
		// Arrange.
		$this->setExpectedIncorrectUsage( self::INCORRECT_USAGE );

		// Act.
		$registered = $this->registry->register_from_json( self::EXAMPLES_DIR . 'missing.json' );

		// Assert.
		$this->assertFalse( $registered );
		$this->assertSame( [], $this->registry->all() );
	}

	public function test_register__migrates_template_and_preset_values() {
		// Arrange.
		$definition = $this->read_example( 'pricing-card.json' );
		$definition['template']['elements'][1]['settings']['title'] = [
			'$$type' => 'html-v3',
			'value' => [
				'content' => String_Prop_Type::generate( 'Pro' ),
				'children' => [],
			],
		];
		$definition['style']['appearance'][0]['options'][1]['set'][0]['style']['desktop']['border-radius'] = [
			'$$type' => 'border-radius',
			'value' => [ 'top-left' => Size_Prop_Type::generate( [ 'size' => 12, 'unit' => 'px' ] ) ],
		];

		// Act.
		$this->registry->register( $definition );

		// Assert.
		$registered = $this->registry->get( 'elementor/pricing-card' );
		$preset_props = $registered['style']['appearance'][0]['options'][1]['set'][0]['style']['desktop'];

		$this->assertSame( Escaped_Html_Prop_Type::generate( 'Pro' ), $registered['template']['elements'][1]['settings']['title'] );
		$this->assertSame( 'border-radius-v2', $preset_props['border-radius']['$$type'] );
		$this->assertArrayHasKey( 'start-start', $preset_props['border-radius']['value'] );
	}

	private function build_icon_button_template(): array {
		$size = fn ( int $px ) => Size_Prop_Type::generate( [ 'size' => $px, 'unit' => 'px' ] );

		$root_style = Style_Definition::make()->add_variant(
			Style_Variant::make()->set_breakpoint( 'desktop' )->add_props( [
				'flex-direction' => String_Prop_Type::generate( 'row' ),
				'align-items' => String_Prop_Type::generate( 'center' ),
				'gap' => $size( 8 ),
				'padding' => $size( 12 ),
				'border-radius' => $size( 8 ),
				'border-width' => $size( 1 ),
				'border-style' => String_Prop_Type::generate( 'solid' ),
				'border-color' => Color_Prop_Type::generate( '#111111' ),
			] )
		);

		return Element_Builder::make( 'e-flexbox' )
			->part( 'root' )
			->settings( [
				'link' => Link_Prop_Type::generate( [
					'destination' => Url_Prop_Type::generate( '#' ),
					'isTargetBlank' => Boolean_Prop_Type::generate( false ),
				] ),
			] )
			->local_style( $root_style )
			->children( [
				Widget_Builder::make( 'e-svg' )->part( 'icon' )->build(),
				Widget_Builder::make( 'e-paragraph' )
					->part( 'label' )
					->settings( [ 'paragraph' => Escaped_Html_Prop_Type::generate( 'Click me' ) ] )
					->build(),
			] )
			->build();
	}

	private function strip_builder_defaults( array $node ): array {
		$node = array_filter( $node, fn ( $value, $key ) => ! (
			( 'isLocked' === $key && false === $value ) ||
			( in_array( $key, [ 'editor_settings', 'settings' ], true ) && [] === $value )
		), ARRAY_FILTER_USE_BOTH );

		if ( isset( $node['elements'] ) ) {
			$node['elements'] = array_map( fn ( array $child ) => $this->strip_builder_defaults( $child ), $node['elements'] );
		}

		return $node;
	}

	private function read_example( string $file ): array {
		return json_decode( file_get_contents( self::EXAMPLES_DIR . $file ), true );
	}
}
