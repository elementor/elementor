<?php

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Notice_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Google_Maps\Atomic_Google_Maps;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Map\Map_Provider_Base;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Map\Map_Providers_Registry;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Map\Providers\Google\Google_Maps_Provider;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Plugin;
use Elementor\User;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Test_Atomic_Google_Maps extends Elementor_Test_Base {
	use MatchesSnapshots;

	public function setUp(): void {
		parent::setUp();

		delete_option( Google_Maps_Provider::API_KEY_OPTION );
		Plugin::$instance->editor->set_edit_mode( false );
	}

	public function tearDown(): void {
		delete_option( Google_Maps_Provider::API_KEY_OPTION );
		Plugin::$instance->editor->set_edit_mode( null );
		Map_Providers_Registry::reset();

		parent::tearDown();
	}

	public function test__render_default_without_api_key(): void {
		// Act.
		$output = $this->render_map( [] );

		// Assert.
		$this->assertStringContainsString( 'https://maps.google.com/maps?q=London%20Eye%2C%20London%2C%20United%20Kingdom&amp;t=m&amp;z=10&amp;output=embed&amp;iwloc=near', $output );
		$this->assertStringNotContainsString( 'allowfullscreen', $output );
		$this->assertMatchesSnapshot( $output );
	}

	public function test__render_with_api_key(): void {
		// Arrange.
		update_option( Google_Maps_Provider::API_KEY_OPTION, 'test-api-key' );

		// Act.
		$output = $this->render_map( [
			'location' => String_Prop_Type::generate( 'Eiffel Tower, Paris' ),
			'zoom' => Number_Prop_Type::generate( 15 ),
		] );

		// Assert.
		$this->assertStringContainsString( 'https://www.google.com/maps/embed/v1/place?key=test-api-key&amp;q=Eiffel%20Tower%2C%20Paris&amp;zoom=15', $output );
		$this->assertStringContainsString( 'allowfullscreen', $output );
		$this->assertMatchesSnapshot( $output );
	}

	public function test__render_escapes_location_and_adds_accessibility_attributes(): void {
		// Act.
		$output = $this->render_map( [
			'location' => String_Prop_Type::generate( 'Café "Le Bar" <b>&</b>' ),
			'_cssid' => String_Prop_Type::generate( 'my-map' ),
		] );

		// Assert.
		$this->assertStringNotContainsString( '<b>', $output );
		$this->assertStringContainsString( 'id="my-map"', $output );
		$this->assertStringContainsString( 'loading="lazy"', $output );
		$this->assertMatchesSnapshot( $output );
	}

	/**
	 * @dataProvider css_id_injection_data_provider
	 */
	public function test__render_keeps_css_id_inside_the_id_attribute( bool $is_edit_mode, string $location ): void {
		// Arrange.
		Plugin::$instance->editor->set_edit_mode( $is_edit_mode );
		$payload = 'x onload=alert(1) "><script>alert(2)</script>';

		// Act.
		$output = $this->render_map( [
			'location' => String_Prop_Type::generate( $location ),
			'_cssid' => String_Prop_Type::generate( $payload ),
		] );

		// Assert.
		$document = new \DOMDocument();
		$document->loadHTML( '<body>' . trim( $output ) . '</body>', LIBXML_NOERROR );
		$root = ( new \DOMXPath( $document ) )->query( '//body/*' )->item( 0 );

		$this->assertSame( $payload, $root->getAttribute( 'id' ) );
		$this->assertFalse( $root->hasAttribute( 'onload' ) );
		$this->assertSame( 0, $document->getElementsByTagName( 'script' )->length );
	}

	public function css_id_injection_data_provider(): array {
		return [
			'iframe' => [ false, 'London Eye' ],
			'editor placeholder' => [ true, '' ],
		];
	}

	public function test__render_falls_back_to_default_zoom_when_zoom_is_zero(): void {
		// Act.
		$output = $this->render_map( [
			'zoom' => Number_Prop_Type::generate( 0 ),
		] );

		// Assert.
		$this->assertStringContainsString( '&amp;z=10&amp;', $output );
	}

	public function test__render_clamps_zoom_to_the_embed_maximum(): void {
		// Act.
		$output = $this->render_map( [
			'zoom' => Number_Prop_Type::generate( 99 ),
		] );

		// Assert.
		$this->assertStringContainsString( '&amp;z=21&amp;', $output );
	}

	public function test__render_nothing_when_location_is_empty(): void {
		// Act.
		$output = $this->render_map( [
			'location' => String_Prop_Type::generate( '   ' ),
		] );

		// Assert.
		$this->assertSame( '', trim( $output ) );
	}

	public function test__render_editor_placeholder_when_location_is_empty_in_edit_mode(): void {
		// Arrange.
		Plugin::$instance->editor->set_edit_mode( true );

		// Act.
		$output = $this->render_map( [
			'location' => String_Prop_Type::generate( '' ),
		] );

		// Assert.
		$this->assertStringNotContainsString( '<iframe', $output );
		$this->assertStringContainsString( '<div data-id="e8e55a1"', $output );
	}

	public function test__render_markdown(): void {
		// Arrange.
		$widget = $this->create_widget( [
			'location' => String_Prop_Type::generate( 'London Eye, London' ),
		] );

		// Act.
		$markdown = $widget->render_markdown();

		// Assert.
		$this->assertSame( '[Map: London Eye, London](https://maps.google.com/maps?q=London%20Eye%2C%20London)', $markdown );
	}

	public function test__render_markdown_keeps_link_structure_for_untrusted_location(): void {
		// Arrange.
		$widget = $this->create_widget( [
			'location' => String_Prop_Type::generate( '<b>Shop</b> [A](https://evil.test) \\ 5' ),
		] );

		// Act.
		$markdown = $widget->render_markdown();

		// Assert.
		$this->assertSame(
			'[Map: Shop \\[A\\](https://evil.test) \\\\ 5](https://maps.google.com/maps?q=Shop%20%5BA%5D%28https%3A%2F%2Fevil.test%29%20%5C%205)',
			$markdown
		);
	}

	public function test__render_markdown_is_empty_when_location_is_empty(): void {
		// Arrange.
		$widget = $this->create_widget( [
			'location' => String_Prop_Type::generate( '' ),
		] );

		// Act & Assert.
		$this->assertSame( '', $widget->render_markdown() );
	}

	public function test__api_key_notice_is_shown_when_api_key_is_missing(): void {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$notice = $this->find_api_key_notice( $this->create_widget( [] ) );

		// Assert.
		$this->assertNotNull( $notice );
		$this->assertSame( Google_Maps_Provider::API_KEY_NOTICE_HINT, $notice->get_props()['dismissible'] );
		$this->assertStringContainsString( 'tab-integrations', $notice->get_props()['buttonUrl'] );
	}

	public function test__api_key_notice_is_hidden_when_api_key_is_set(): void {
		// Arrange.
		$this->act_as_admin();
		update_option( Google_Maps_Provider::API_KEY_OPTION, 'test-api-key' );

		// Act.
		$notice = $this->find_api_key_notice( $this->create_widget( [] ) );

		// Assert.
		$this->assertNull( $notice );
	}

	public function test__api_key_notice_is_hidden_when_dismissed(): void {
		// Arrange.
		$this->act_as_admin();
		User::set_dismissed_editor_notices( [ 'dismissId' => Google_Maps_Provider::API_KEY_NOTICE_HINT ] );

		// Act.
		$notice = $this->find_api_key_notice( $this->create_widget( [] ) );

		// Assert.
		$this->assertNull( $notice );
	}

	public function test__initial_config_exposes_provider_template_context(): void {
		// Arrange.
		update_option( Google_Maps_Provider::API_KEY_OPTION, 'test-api-key' );

		// Act.
		$config = $this->create_widget( [] )->get_initial_config();

		// Assert.
		$this->assertSame( 'elementor/elements/atomic-map/google', $config['twig_main_template'] );
		$this->assertArrayHasKey( 'elementor/elements/atomic-map', $config['twig_templates'] );
		$this->assertSame( [
			'api_key' => 'test-api-key',
			'key' => 'google',
		], $config['template_context']['provider'] );
	}

	public function test__shared_schema_is_provider_agnostic(): void {
		// Act.
		$schema = Atomic_Google_Maps::get_props_schema();

		// Assert.
		$this->assertArrayHasKey( 'location', $schema );
		$this->assertArrayHasKey( 'zoom', $schema );
		$this->assertArrayNotHasKey( 'address', $schema );
		$this->assertSame( 10, $schema['zoom']->get_default()['value'] );
	}

	public function test__provider_can_be_replaced_via_registry_hook(): void {
		// Arrange.
		Map_Providers_Registry::reset();

		$custom_provider = new class() extends Map_Provider_Base {
			public function get_key(): string {
				return Google_Maps_Provider::KEY;
			}

			public function get_label(): string {
				return 'Custom';
			}

			public function get_templates(): array {
				return [];
			}

			public function get_external_url( string $location ): string {
				return 'https://example.com/?q=' . rawurlencode( $location );
			}
		};

		$callback = fn ( Map_Providers_Registry $registry ) => $registry->register( $custom_provider );
		add_action( 'elementor/atomic-widgets/map-providers/register', $callback, 20 );

		// Act.
		$provider = Atomic_Google_Maps::get_provider();

		// Assert.
		$this->assertSame( $custom_provider, $provider );

		remove_action( 'elementor/atomic-widgets/map-providers/register', $callback, 20 );
	}

	public function test__get_provider_throws_when_provider_is_not_registered(): void {
		// Arrange.
		Map_Providers_Registry::reset();
		remove_all_actions( 'elementor/atomic-widgets/map-providers/register' );

		// Assert.
		$this->assertFalse( Atomic_Google_Maps::has_provider() );

		// Expect.
		$this->expectException( \RuntimeException::class );

		// Act.
		Atomic_Google_Maps::get_provider();
	}

	private function create_widget( array $settings ): Atomic_Google_Maps {
		return Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => $settings,
			'widgetType' => Atomic_Google_Maps::get_element_type(),
		] );
	}

	private function render_map( array $settings ): string {
		$widget = $this->create_widget( $settings );

		ob_start();
		$widget->render_content();

		return ob_get_clean();
	}

	private function find_api_key_notice( Atomic_Google_Maps $widget ): ?Notice_Control {
		foreach ( $widget->get_atomic_controls() as $section ) {
			if ( ! $section instanceof Section ) {
				continue;
			}

			foreach ( $section->get_items() as $control ) {
				if ( $control instanceof Notice_Control && Google_Maps_Provider::API_KEY_NOTICE_PROP === $control->get_bind() ) {
					return $control;
				}
			}
		}

		return null;
	}
}
