<?php
namespace Elementor\Testing\Core\Base;

use Elementor\Core\Base\Document;
use Elementor\Core\Base\Elements_Iteration_Actions\Assets;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Document_Element_Cache extends Elementor_Test_Base {

	const PAGE_ASSET_STYLE = 'test-page-asset-style';
	const PAGE_ASSET_SCRIPT = 'test-page-asset-script';
	const RENDERED_SCRIPT = 'test-rendered-script';

	public function test_get_cached_asset_handles__includes_saved_page_assets_not_queued_during_render() {
		// Arrange.
		$document = $this->create_document();

		$document->update_meta( Assets::ASSETS_META_KEY, [ 'styles' => [ self::PAGE_ASSET_STYLE ] ] );

		// Act.
		$cached_styles = $this->get_cached_asset_handles( $document, [], 'styles' );

		// Assert.
		$this->assertSame( [ self::PAGE_ASSET_STYLE ], $cached_styles );
	}

	public function test_get_cached_asset_handles__merges_rendered_handles_without_duplicates() {
		// Arrange.
		$document = $this->create_document();

		$document->update_meta( Assets::ASSETS_META_KEY, [ 'scripts' => [ self::PAGE_ASSET_SCRIPT ] ] );

		// Act.
		$cached_scripts = $this->get_cached_asset_handles(
			$document,
			[ self::RENDERED_SCRIPT, self::PAGE_ASSET_SCRIPT ],
			'scripts'
		);

		// Assert.
		$this->assertSame( [ self::RENDERED_SCRIPT, self::PAGE_ASSET_SCRIPT ], $cached_scripts );
	}

	public function test_get_cached_asset_handles__returns_rendered_handles_when_page_assets_are_missing() {
		// Arrange.
		$document = $this->create_document();

		// Act.
		$cached_scripts = $this->get_cached_asset_handles( $document, [ self::RENDERED_SCRIPT ], 'scripts' );

		// Assert.
		$this->assertSame( [ self::RENDERED_SCRIPT ], $cached_scripts );
	}

	private function create_document(): Document {
		return Plugin::$instance->documents->get( $this->factory()->create_and_get_default_post()->ID );
	}

	private function get_cached_asset_handles( Document $document, array $rendered_handles, string $asset_type ): array {
		$method = new \ReflectionMethod( $document, 'get_cached_asset_handles' );
		$method->setAccessible( true );

		return $method->invoke( $document, $rendered_handles, $asset_type );
	}
}
