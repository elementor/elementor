<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Core\Files\Base as Base_File;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group design-system-sync
 */
class Test_Stylesheet_Manager extends Elementor_Test_Base {
	private $stylesheet_manager;

	public function setUp(): void {
		parent::setUp();

		Variables_Provider::clear_cache();
		Classes_Provider::clear_cache();
		$this->clear_kit_variables();
		$this->clear_kit_classes();
		$this->stylesheet_manager = new Stylesheet_Manager();
		$this->stylesheet_manager->delete();
	}

	public function tearDown(): void {
		Variables_Provider::clear_cache();
		Classes_Provider::clear_cache();
		$this->clear_kit_variables();
		$this->clear_kit_classes();
		$this->stylesheet_manager->delete();

		parent::tearDown();
	}

	public function test_generate__creates_file_with_synced_color_variables() {
		// Arrange
		$this->set_kit_variables( [
			'var-1' => [
				'type' => 'global-color-variable',
				'label' => 'Primary',
				'value' => [ '$$type' => 'color', 'value' => '#ff0000' ],
				'sync_to_v3' => true,
			],
		] );

		// Act
		$result = $this->stylesheet_manager->generate();

		// Assert
		$this->assertFileExists( $this->stylesheet_manager->get_path() );
		$css = file_get_contents( $this->stylesheet_manager->get_path() );
		$this->assertStringContainsString( '--e-global-color-v4-primary:var(--Primary);', $css );
		$this->assertArrayHasKey( 'url', $result );
		$this->assertArrayHasKey( 'version', $result );
	}

	public function test_generate__returns_url_and_version() {
		// Arrange
		$this->set_kit_variables( [
			'var-1' => [
				'type' => 'global-color-variable',
				'label' => 'Primary',
				'value' => [ '$$type' => 'color', 'value' => '#ff0000' ],
				'sync_to_v3' => true,
			],
		] );

		// Act
		$result = $this->stylesheet_manager->generate();

		// Assert
		$this->assertStringContainsString( Stylesheet_Manager::FILE_NAME, $result['url'] );
		$this->assertNotEmpty( $result['version'] );
		$this->assertIsInt( $result['version'] );
	}

	public function test_generate__deletes_file_when_no_synced_variables() {
		// Arrange
		$this->set_kit_variables( [
			'var-1' => [
				'type' => 'global-color-variable',
				'label' => 'Primary',
				'value' => [ '$$type' => 'color', 'value' => '#ff0000' ],
				'sync_to_v3' => false,
			],
		] );

		// Act
		$this->stylesheet_manager->generate();

		// Assert
		$this->assertFileDoesNotExist( $this->stylesheet_manager->get_path() );
	}

	public function test_generate__excludes_non_synced_variables() {
		// Arrange
		$this->set_kit_variables( [
			'var-1' => [
				'type' => 'global-color-variable',
				'label' => 'Synced',
				'value' => [ '$$type' => 'color', 'value' => '#ff0000' ],
				'sync_to_v3' => true,
			],
			'var-2' => [
				'type' => 'global-color-variable',
				'label' => 'NotSynced',
				'value' => [ '$$type' => 'color', 'value' => '#00ff00' ],
				'sync_to_v3' => false,
			],
		] );

		// Act
		$this->stylesheet_manager->generate();

		// Assert
		$css = file_get_contents( $this->stylesheet_manager->get_path() );
		$this->assertStringContainsString( '--e-global-color-v4-synced:var(--Synced);', $css );
		$this->assertStringNotContainsString( 'NotSynced', $css );
	}

	public function test_generate__wraps_declarations_in_root() {
		// Arrange
		$this->set_kit_variables( [
			'var-1' => [
				'type' => 'global-color-variable',
				'label' => 'Primary',
				'value' => [ '$$type' => 'color', 'value' => '#ff0000' ],
				'sync_to_v3' => true,
			],
		] );

		// Act
		$this->stylesheet_manager->generate();

		// Assert
		$css = file_get_contents( $this->stylesheet_manager->get_path() );
		$this->assertStringStartsWith( ':root {', $css );
		$this->assertStringEndsWith( '}', $css );
	}

	public function test_generate__updates_file_on_subsequent_calls() {
		// Arrange
		$this->set_kit_variables( [
			'var-1' => [
				'type' => 'global-color-variable',
				'label' => 'First',
				'value' => [ '$$type' => 'color', 'value' => '#ff0000' ],
				'sync_to_v3' => true,
			],
		] );

		// Act
		$this->stylesheet_manager->generate();
		$first_css = file_get_contents( $this->stylesheet_manager->get_path() );

		Variables_Provider::clear_cache();
		$this->set_kit_variables( [
			'var-1' => [
				'type' => 'global-color-variable',
				'label' => 'First',
				'value' => [ '$$type' => 'color', 'value' => '#ff0000' ],
				'sync_to_v3' => true,
			],
			'var-2' => [
				'type' => 'global-color-variable',
				'label' => 'Second',
				'value' => [ '$$type' => 'color', 'value' => '#00ff00' ],
				'sync_to_v3' => true,
			],
		] );

		$this->stylesheet_manager->generate();
		$second_css = file_get_contents( $this->stylesheet_manager->get_path() );

		// Assert
		$this->assertStringNotContainsString( 'Second', $first_css );
		$this->assertStringContainsString( 'Second', $second_css );
	}

	public function test_generate__skips_variables_with_empty_label() {
		// Arrange
		$this->set_kit_variables( [
			'var-1' => [
				'type' => 'global-color-variable',
				'label' => '',
				'value' => [ '$$type' => 'color', 'value' => '#ff0000' ],
				'sync_to_v3' => true,
			],
		] );

		// Act
		$this->stylesheet_manager->generate();

		// Assert
		$css = file_get_contents( $this->stylesheet_manager->get_path() );
		$this->assertEmpty( $css );
	}

	public function test_generate__handles_multiple_synced_color_variables() {
		// Arrange
		$this->set_kit_variables( [
			'var-1' => [
				'type' => 'global-color-variable',
				'label' => 'Red',
				'value' => [ '$$type' => 'color', 'value' => '#ff0000' ],
				'sync_to_v3' => true,
			],
			'var-2' => [
				'type' => 'global-color-variable',
				'label' => 'Blue',
				'value' => [ '$$type' => 'color', 'value' => '#0000ff' ],
				'sync_to_v3' => true,
			],
		] );

		// Act
		$this->stylesheet_manager->generate();

		// Assert
		$css = file_get_contents( $this->stylesheet_manager->get_path() );
		$this->assertStringContainsString( '--e-global-color-v4-red:var(--Red);', $css );
		$this->assertStringContainsString( '--e-global-color-v4-blue:var(--Blue);', $css );
	}

	public function test_get_url__contains_correct_path() {
		// Act
		$url = $this->stylesheet_manager->get_url();

		// Assert
		$this->assertStringContainsString( Base_File::UPLOADS_DIR . Stylesheet_Manager::DEFAULT_FILES_DIR . Stylesheet_Manager::FILE_NAME, $url );
	}

	public function test_generate__creates_file_with_synced_typography_class() {
		// Arrange
		$this->set_kit_classes( [
			'g-1' => [
				'id' => 'g-1',
				'type' => 'class',
				'label' => 'Heading',
				'sync_to_v3' => true,
				'variants' => [
					[
						'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
						'props' => [
							'font-size' => [ '$$type' => 'size', 'value' => [ 'size' => 24, 'unit' => 'px' ] ],
							'font-weight' => [ '$$type' => 'string', 'value' => '700' ],
						],
					],
				],
			],
		] );

		// Act
		$this->stylesheet_manager->generate();

		// Assert
		$css = file_get_contents( $this->stylesheet_manager->get_path() );
		$this->assertStringContainsString( '--e-global-typography-v4-heading-font-size:', $css );
		$this->assertStringContainsString( '--e-global-typography-v4-heading-font-weight:', $css );
	}

	public function test_generate__skips_non_synced_classes() {
		// Arrange
		$this->set_kit_classes( [
			'g-1' => [
				'id' => 'g-1',
				'type' => 'class',
				'label' => 'NotSynced',
				'sync_to_v3' => false,
				'variants' => [
					[
						'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
						'props' => [
							'font-size' => [ '$$type' => 'size', 'value' => [ 'size' => 24, 'unit' => 'px' ] ],
						],
					],
				],
			],
			'g-2' => [
				'id' => 'g-2',
				'type' => 'class',
				'label' => 'Synced',
				'sync_to_v3' => true,
				'variants' => [
					[
						'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
						'props' => [
							'font-size' => [ '$$type' => 'size', 'value' => [ 'size' => 16, 'unit' => 'px' ] ],
						],
					],
				],
			],
		] );

		// Act
		$this->stylesheet_manager->generate();

		// Assert
		$css = file_get_contents( $this->stylesheet_manager->get_path() );
		$this->assertStringContainsString( '--e-global-typography-v4-synced-font-size:', $css );
		$this->assertStringNotContainsString( 'NotSynced', $css );
	}

	public function test_generate__excludes_hover_state_variants() {
		// Arrange
		$this->set_kit_classes( [
			'g-1' => [
				'id' => 'g-1',
				'type' => 'class',
				'label' => 'Heading',
				'sync_to_v3' => true,
				'variants' => [
					[
						'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
						'props' => [
							'font-size' => [ '$$type' => 'size', 'value' => [ 'size' => 24, 'unit' => 'px' ] ],
						],
					],
					[
						'meta' => [ 'breakpoint' => 'desktop', 'state' => 'hover' ],
						'props' => [
							'font-size' => [ '$$type' => 'size', 'value' => [ 'size' => 32, 'unit' => 'px' ] ],
						],
					],
				],
			],
		] );

		// Act
		$this->stylesheet_manager->generate();

		// Assert
		$css = file_get_contents( $this->stylesheet_manager->get_path() );
		$this->assertStringContainsString( '--e-global-typography-v4-heading-font-size:', $css );
		$this->assertStringNotContainsString( '32px', $css );
	}

	public function test_generate__handles_all_typography_properties() {
		// Arrange
		$this->set_kit_classes( [
			'g-1' => [
				'id' => 'g-1',
				'type' => 'class',
				'label' => 'RichText',
				'sync_to_v3' => true,
				'variants' => [
					[
						'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
						'props' => [
							'font-family' => [ '$$type' => 'string', 'value' => 'Roboto' ],
							'font-size' => [ '$$type' => 'size', 'value' => [ 'size' => 18, 'unit' => 'px' ] ],
							'font-weight' => [ '$$type' => 'string', 'value' => '600' ],
							'font-style' => [ '$$type' => 'string', 'value' => 'italic' ],
							'text-decoration' => [ '$$type' => 'string', 'value' => 'underline' ],
							'line-height' => [ '$$type' => 'size', 'value' => [ 'size' => 1.5, 'unit' => '' ] ],
							'letter-spacing' => [ '$$type' => 'size', 'value' => [ 'size' => 0.5, 'unit' => 'px' ] ],
							'word-spacing' => [ '$$type' => 'size', 'value' => [ 'size' => 2, 'unit' => 'px' ] ],
							'text-transform' => [ '$$type' => 'string', 'value' => 'uppercase' ],
						],
					],
				],
			],
		] );

		// Act
		$this->stylesheet_manager->generate();

		// Assert
		$css = file_get_contents( $this->stylesheet_manager->get_path() );
		$this->assertStringContainsString( '--e-global-typography-v4-richtext-font-family:', $css );
		$this->assertStringContainsString( '--e-global-typography-v4-richtext-font-size:', $css );
		$this->assertStringContainsString( '--e-global-typography-v4-richtext-font-weight:', $css );
		$this->assertStringContainsString( '--e-global-typography-v4-richtext-font-style:', $css );
		$this->assertStringContainsString( '--e-global-typography-v4-richtext-text-decoration:', $css );
		$this->assertStringContainsString( '--e-global-typography-v4-richtext-line-height:', $css );
		$this->assertStringContainsString( '--e-global-typography-v4-richtext-letter-spacing:', $css );
		$this->assertStringContainsString( '--e-global-typography-v4-richtext-word-spacing:', $css );
		$this->assertStringContainsString( '--e-global-typography-v4-richtext-text-transform:', $css );
	}

	public function test_generate__combines_variables_and_classes() {
		// Arrange
		$this->set_kit_variables( [
			'var-1' => [
				'type' => 'global-color-variable',
				'label' => 'Primary',
				'value' => [ '$$type' => 'color', 'value' => '#ff0000' ],
				'sync_to_v3' => true,
			],
		] );

		$this->set_kit_classes( [
			'g-1' => [
				'id' => 'g-1',
				'type' => 'class',
				'label' => 'Heading',
				'sync_to_v3' => true,
				'variants' => [
					[
						'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
						'props' => [
							'font-size' => [ '$$type' => 'size', 'value' => [ 'size' => 24, 'unit' => 'px' ] ],
						],
					],
				],
			],
		] );

		// Act
		$this->stylesheet_manager->generate();

		// Assert
		$css = file_get_contents( $this->stylesheet_manager->get_path() );
		$this->assertStringContainsString( '--e-global-color-v4-primary:var(--Primary);', $css );
		$this->assertStringContainsString( '--e-global-typography-v4-heading-font-size:', $css );
	}

	public function test_generate__includes_responsive_typography_in_media_queries() {
		// Arrange
		$this->set_kit_classes( [
			'g-1' => [
				'id' => 'g-1',
				'type' => 'class',
				'label' => 'Heading',
				'sync_to_v3' => true,
				'variants' => [
					[
						'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
						'props' => [
							'font-size' => [ '$$type' => 'size', 'value' => [ 'size' => 24, 'unit' => 'px' ] ],
						],
					],
					[
						'meta' => [ 'breakpoint' => 'tablet', 'state' => null ],
						'props' => [
							'font-size' => [ '$$type' => 'size', 'value' => [ 'size' => 20, 'unit' => 'px' ] ],
						],
					],
					[
						'meta' => [ 'breakpoint' => 'mobile', 'state' => null ],
						'props' => [
							'font-size' => [ '$$type' => 'size', 'value' => [ 'size' => 16, 'unit' => 'px' ] ],
						],
					],
				],
			],
		] );

		// Act
		$this->stylesheet_manager->generate();

		// Assert
		$css = file_get_contents( $this->stylesheet_manager->get_path() );
		$this->assertStringContainsString( '--e-global-typography-v4-heading-font-size:', $css );
		$this->assertStringContainsString( '@media', $css );
	}

	private function set_kit_variables( array $variables ): void {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$kit->update_json_meta( '_elementor_global_variables', [
			'data' => $variables,
			'watermark' => 1,
		] );
	}

	private function set_kit_classes( array $classes ): void {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$kit->update_json_meta( '_elementor_global_classes', [
			'items' => $classes,
			'order' => array_keys( $classes ),
		] );
		Classes_Provider::clear_cache();
	}

	private function clear_kit_variables(): void {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( $kit ) {
			$kit->delete_meta( '_elementor_global_variables' );
		}
	}

	private function clear_kit_classes(): void {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( $kit ) {
			$kit->delete_meta( '_elementor_global_classes' );
		}
	}

}
