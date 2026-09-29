<?php
namespace Elementor\Testing\Core\Base;

use Elementor\Core\Base\Document;
use Elementor\Core\Base\Elements_Iteration_Actions\Assets;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Document_Element_Cache extends Elementor_Test_Base {

	const ELEMENT_CACHE_TTL_HOURS = '24';
	const CACHED_CONTENT = '<div class="cached-content"></div>';
	const PAGE_ASSET_STYLE = 'test-page-asset-style';
	const PAGE_ASSET_SCRIPT = 'test-page-asset-script';
	const DIVIDER_STYLE = 'widget-divider';
	const ASSET_SRC = 'https://example.com/asset';

	const DIVIDER_ELEMENTS = [
		[
			'id' => '5a1e8e5',
			'elType' => 'widget',
			'widgetType' => 'divider',
			'settings' => [],
			'elements' => [],
		],
	];

	public function setUp(): void {
		parent::setUp();

		$this->reset_dependencies_registries();

		add_filter( 'pre_option_elementor_element_cache_ttl', [ $this, 'get_element_cache_ttl' ] );

		wp_register_style( self::PAGE_ASSET_STYLE, self::ASSET_SRC . '.css' );
		wp_register_style( self::DIVIDER_STYLE, self::ASSET_SRC . '.css' );
		wp_register_script( self::PAGE_ASSET_SCRIPT, self::ASSET_SRC . '.js' );
	}

	public function tearDown(): void {
		remove_filter( 'pre_option_elementor_element_cache_ttl', [ $this, 'get_element_cache_ttl' ] );

		$this->reset_dependencies_registries();

		parent::tearDown();
	}

	public function get_element_cache_ttl(): string {
		return self::ELEMENT_CACHE_TTL_HOURS;
	}

	public function test_print_elements__cache_hit_enqueues_saved_page_assets_missing_from_cache() {
		// Arrange.
		$document = $this->create_document();

		$document->update_meta( Assets::ASSETS_META_KEY, [
			'styles' => [ self::PAGE_ASSET_STYLE ],
			'scripts' => [ self::PAGE_ASSET_SCRIPT ],
		] );

		$this->store_cache_without_assets( $document );

		// Act.
		$output = $this->print_elements( $document, self::DIVIDER_ELEMENTS );

		// Assert.
		$this->assertSame( self::CACHED_CONTENT, $output );
		$this->assertTrue( wp_style_is( self::PAGE_ASSET_STYLE, 'enqueued' ) );
		$this->assertTrue( wp_script_is( self::PAGE_ASSET_SCRIPT, 'enqueued' ) );
	}

	public function test_print_elements__cache_hit_does_not_iterate_elements_when_page_assets_are_saved() {
		// Arrange.
		$document = $this->create_document();
		$saved_page_assets = [ 'styles' => [ self::PAGE_ASSET_STYLE ] ];

		$document->update_meta( Assets::ASSETS_META_KEY, $saved_page_assets );

		$this->store_cache_without_assets( $document );

		// Act.
		$this->print_elements( $document, self::DIVIDER_ELEMENTS );

		// Assert.
		$this->assertSame( $saved_page_assets, $document->get_meta( Assets::ASSETS_META_KEY ) );
		$this->assertFalse( wp_style_is( self::DIVIDER_STYLE, 'enqueued' ) );
	}

	public function test_print_elements__cache_hit_saves_and_enqueues_page_assets_when_missing() {
		// Arrange.
		$document = $this->create_document();

		$this->store_cache_without_assets( $document );

		// Act.
		$this->print_elements( $document, self::DIVIDER_ELEMENTS );

		// Assert.
		$saved_page_assets = $document->get_meta( Assets::ASSETS_META_KEY );

		$this->assertIsArray( $saved_page_assets );
		$this->assertContains( self::DIVIDER_STYLE, $saved_page_assets['styles'] );
		$this->assertTrue( wp_style_is( self::DIVIDER_STYLE, 'enqueued' ) );
	}

	private function create_document(): Document {
		return Plugin::$instance->documents->get( $this->factory()->create_and_get_default_post()->ID );
	}

	private function store_cache_without_assets( Document $document ): void {
		$document->set_document_cache( [
			'content' => self::CACHED_CONTENT,
			'scripts' => [],
			'styles' => [],
		] );
	}

	private function print_elements( Document $document, array $elements_data ): string {
		ob_start();

		$document->print_elements( $elements_data );

		return ob_get_clean();
	}

	private function reset_dependencies_registries(): void {
		global $wp_scripts, $wp_styles;

		$wp_scripts = new \WP_Scripts();
		$wp_styles = new \WP_Styles();
	}
}
