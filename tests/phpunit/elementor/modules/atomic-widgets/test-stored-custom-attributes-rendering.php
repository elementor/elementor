<?php

namespace Elementor\Testing\Modules\AtomicWidgets;

use Elementor\Core\Base\Document;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Key_Value_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Stored_Custom_Attributes_Rendering extends Elementor_Test_Base {

	const ATTRIBUTES_TRANSFORMERS_HOOK = 'elementor/atomic-widgets/settings/transformers/register';

	private $register_transformer_callback;

	public function setUp(): void {
		parent::setUp();

		$this->register_transformer_callback = function ( $transformers ) {
			$transformers->register( Attributes_Prop_Type::get_key(), $this->make_print_every_pair_transformer() );
		};

		add_action( self::ATTRIBUTES_TRANSFORMERS_HOOK, $this->register_transformer_callback, 20 );
		Render_Props_Resolver::reset();
	}

	public function tearDown(): void {
		remove_action( self::ATTRIBUTES_TRANSFORMERS_HOOK, $this->register_transformer_callback, 20 );
		Render_Props_Resolver::reset();

		parent::tearDown();
	}

	public function test_get_atomic_settings__omits_stored_attributes_that_are_no_longer_supported() {
		// Arrange.
		$widget = $this->make_widget_with_stored_attributes( [
			'data-test' => 'kept',
			'onclick' => 'a',
			'x-init' => 'a',
			'role' => 'note',
		] );

		// Act.
		$printed = $widget->get_atomic_settings()['attributes'];

		// Assert.
		$this->assertStringContainsString( 'data-test="kept"', $printed );
		$this->assertStringContainsString( 'role="note"', $printed );
		$this->assertStringNotContainsString( 'onclick', $printed );
		$this->assertStringNotContainsString( 'x-init', $printed );
	}

	public function test_get_atomic_settings__keeps_only_supported_stored_attributes() {
		// Arrange.
		$widget = $this->make_widget_with_stored_attributes( [
			'onclick' => 'a',
			'x-init' => 'a',
			'data-test' => 'kept',
		] );

		// Act.
		$printed = $widget->get_atomic_settings()['attributes'];

		// Assert.
		$this->assertSame( 'data-e-type="widget" data-id="1" data-test="kept"', $printed );
	}

	public function test_get_atomic_setting__omits_stored_attributes_that_are_no_longer_supported() {
		// Arrange.
		$widget = $this->make_widget_with_stored_attributes( [
			'ONCLICK' => 'a',
			'X-Data' => 'a',
			'title' => 'kept',
		] );

		// Act.
		$printed = $widget->get_atomic_setting( 'attributes' );

		// Assert.
		$this->assertSame( 'title="kept"', $printed );
	}

	public function test_get_atomic_settings__prints_nothing_extra_when_all_stored_attributes_are_unsupported() {
		// Arrange.
		$widget = $this->make_widget_with_stored_attributes( [
			'onclick' => 'a',
			'x-init' => 'a',
		] );

		// Act.
		$printed = $widget->get_atomic_settings()['attributes'];

		// Assert.
		$this->assertSame( 'data-e-type="widget" data-id="1"', $printed );
	}

	public function test_get_atomic_setting__removes_unsupported_url_schemes_from_stored_url_values() {
		// Arrange.
		$widget = $this->make_widget_with_stored_attributes( [
			'href' => 'custom-scheme:page',
			'src' => 'https://example.com/image.png',
			'title' => 'custom-scheme:page',
		] );

		// Act.
		$printed = $widget->get_atomic_setting( 'attributes' );

		// Assert.
		$this->assertSame( 'href="page" src="https://example.com/image.png" title="custom-scheme:page"', $printed );
	}

	public function test_get_atomic_setting__prints_prefixed_names_when_last_editor_has_unfiltered_html() {
		// Arrange.
		$this->act_as_admin_or_network_admin();
		$post_id = $this->make_post_saved_by_current_user();
		$widget = $this->make_widget_with_stored_attributes( [
			'onclick' => 'a',
			'x-init' => 'a',
			'title' => 'kept',
		] );

		// Act.
		$printed = $this->get_attributes_in_document( $widget, $post_id );

		// Assert.
		$this->assertSame( 'onclick="a" x-init="a" title="kept"', $printed );
	}

	public function test_get_atomic_setting__omits_prefixed_names_when_last_editor_lacks_unfiltered_html() {
		// Arrange.
		$this->act_as( 'contributor' );
		$post_id = $this->make_post_saved_by_current_user();
		$this->act_as_admin_or_network_admin();
		$widget = $this->make_widget_with_stored_attributes( [
			'onclick' => 'a',
			'title' => 'kept',
		] );

		// Act.
		$printed = $this->get_attributes_in_document( $widget, $post_id );

		// Assert.
		$this->assertSame( 'title="kept"', $printed );
	}

	public function test_get_atomic_setting__prints_prefixed_names_when_page_has_no_recorded_editor() {
		// Arrange.
		$this->act_as( 'contributor' );
		$post_id = $this->factory()->post->create();
		$widget = $this->make_widget_with_stored_attributes( [
			'onclick' => 'a',
			'title' => 'kept',
		] );

		// Act.
		$printed = $this->get_attributes_in_document( $widget, $post_id );

		// Assert.
		$this->assertSame( 'onclick="a" title="kept"', $printed );
	}

	private function make_post_saved_by_current_user(): int {
		$post_id = $this->factory()->post->create();

		update_post_meta( $post_id, Document::ELEMENTOR_DATA_META_KEY, '[]' );

		return $post_id;
	}

	private function get_attributes_in_document( $widget, int $post_id ) {
		Plugin::$instance->documents->switch_to_document( Plugin::$instance->documents->get( $post_id ) );

		$printed = $widget->get_atomic_setting( 'attributes' );

		Plugin::$instance->documents->restore_document();

		return $printed;
	}

	private function make_print_every_pair_transformer(): Transformer_Base {
		return new class() extends Transformer_Base {
			public function transform( $value, Props_Resolver_Context $context ) {
				return implode( ' ', array_map(
					fn( $item ) => $item['key'] . '="' . esc_attr( $item['value'] ) . '"',
					$value
				) );
			}
		};
	}

	private function make_widget_with_stored_attributes( array $pairs ) {
		$items = [];

		foreach ( $pairs as $key => $value ) {
			$items[] = Key_Value_Prop_Type::generate( [
				'key' => String_Prop_Type::generate( (string) $key ),
				'value' => String_Prop_Type::generate( $value ),
			] );
		}

		return new class( Attributes_Prop_Type::generate( $items ) ) extends Atomic_Widget_Base {
			public function __construct( $stored_attributes ) {
				parent::__construct( [
					'id' => 1,
					'settings' => [ 'attributes' => $stored_attributes ],
					'styles' => [],
					'editor_settings' => [],
					'elType' => 'widget',
					'widgetType' => 'test-widget',
				], [] );
			}

			public static function get_element_type(): string {
				return 'test-widget';
			}

			protected function define_atomic_controls(): array {
				return [];
			}

			protected static function define_props_schema(): array {
				return [ 'attributes' => Attributes_Prop_Type::make() ];
			}
		};
	}
}
