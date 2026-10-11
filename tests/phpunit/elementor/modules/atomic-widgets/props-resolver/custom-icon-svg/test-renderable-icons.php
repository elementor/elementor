<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg\Resolver;
use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Search;
use Elementor\Modules\Mcp\Abilities\Build_Composition_Ability;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Renderable_Icons extends Elementor_Test_Base {
	const LIBRARY = 'pw-fontello';

	const RENDERABLE_VALUE = 'icon icon-emo-surprised';

	private string $pack_dir = '';

	private string $original_svg_library_state;

	public function setUp(): void {
		parent::setUp();

		$this->original_svg_library_state = Plugin::$instance->experiments->get_features( Atomic_Widgets_Module::EXPERIMENT_ICON_LIBRARY )['default'];
		Plugin::$instance->experiments->set_feature_default_state( Atomic_Widgets_Module::EXPERIMENT_ICON_LIBRARY, Experiments_Manager::STATE_ACTIVE );

		add_filter( 'elementor/atomic-widgets/custom-icon-libraries/enabled', '__return_true' );
		$this->copy_fontello_pack();
		Resolver::reset_memory();
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state( Atomic_Widgets_Module::EXPERIMENT_ICON_LIBRARY, $this->original_svg_library_state );
		Resolver::reset_memory();
		remove_all_filters( 'elementor/icons_manager/additional_tabs' );
		remove_all_filters( 'elementor/atomic-widgets/custom-icon-library-dir' );
		remove_all_filters( 'elementor/atomic-widgets/custom-icon-libraries/enabled' );
		$this->remove_pack_dir();

		parent::tearDown();
	}

	public function test_search__excludes_declared_but_unrenderable_custom_icon() {
		// Arrange.
		$this->register_pack( [ 'emo-surprised', 'declared-only' ] );

		// Act.
		$result = Icon_Search::search( [ 'library' => self::LIBRARY ] );

		// Assert.
		$values = array_column( $result['results'][0]['matches'], 'value' );
		$this->assertContains( self::RENDERABLE_VALUE, $values );
		$this->assertNotContains( 'icon icon-declared-only', $values );
		$this->assertSame( count( $values ), $result['results'][0]['total'] );
		$this->assertFalse( $result['results'][0]['truncated'] );
	}

	public function test_execute__warns_for_declared_but_unrenderable_custom_icon() {
		// Arrange.
		$this->register_pack( [ 'emo-surprised', 'declared-only' ] );

		// Act.
		$result = $this->build_with_icon( 'icon icon-declared-only' );

		// Assert.
		$this->assertSame( [ 'icon_not_found' ], array_column( $result['warning_details'] ?? [], 'code' ) );
	}

	public function test_execute__validates_icons_beyond_the_listing_cap() {
		// Arrange.
		$names = [];

		for ( $i = 0; $i < Resolver::MAX_LIBRARY_ICONS; $i++ ) {
			$names[] = 'missing-' . $i;
		}

		$names[] = 'emo-surprised';
		$this->register_pack( $names );

		// Act.
		$valid = $this->build_with_icon( self::RENDERABLE_VALUE );
		$bogus = $this->build_with_icon( 'icon icon-bogus' );

		// Assert.
		$this->assertArrayNotHasKey( 'warning_details', $valid );
		$this->assertSame( [ 'icon_not_found' ], array_column( $bogus['warning_details'] ?? [], 'code' ) );
	}

	public function test_search__reports_custom_libraries_cut_at_the_listing_cap() {
		// Arrange.
		$names = [];

		for ( $i = 0; $i <= Resolver::MAX_LIBRARY_ICONS; $i++ ) {
			$names[] = 'icon-' . $i;
		}

		$this->register_pack( $names );

		// Act.
		$result = Icon_Search::search( [ 'library' => self::LIBRARY ] );

		// Assert.
		$this->assertSame( [ self::LIBRARY ], $result['truncated_custom_libraries'] );
	}

	private function register_pack( array $names ): void {
		add_filter(
			'elementor/atomic-widgets/custom-icon-library-dir',
			function ( $dir, $tab ) {
				return self::LIBRARY === ( $tab['name'] ?? '' ) ? $this->pack_dir : $dir;
			},
			10,
			2
		);

		add_filter(
			'elementor/icons_manager/additional_tabs',
			static function ( $tabs ) use ( $names ) {
				$tabs[ self::LIBRARY ] = [
					'name' => self::LIBRARY,
					'label' => 'PW Fontello',
					'prefix' => 'icon-',
					'displayPrefix' => 'icon',
					'native' => false,
					'custom_icon_type' => 'fontello',
					'icons' => $names,
				];

				return $tabs;
			}
		);

		Resolver::reset_memory();
	}

	private function build_with_icon( string $value ): array {
		$this->act_as_admin();
		$post_id = $this->factory()->create_and_get_custom_post( [ 'post_status' => 'draft' ] )->ID;

		$result = ( new Build_Composition_Ability() )->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-flexbox configuration-id="wrap"><e-svg configuration-id="icon"/></e-flexbox>',
			'element_config' => [
				'icon' => [
					'svg' => [
						'value' => $value,
						'library' => self::LIBRARY,
					],
				],
			],
			'parent_id' => 'document',
			'dry_run' => false,
		] );

		if ( is_wp_error( $result ) ) {
			$this->fail( 'Composition failed: ' . $result->get_error_message() );
		}

		return $result;
	}

	private function copy_fontello_pack(): void {
		$uploads = wp_upload_dir();
		$this->pack_dir = trailingslashit( $uploads['basedir'] ) . 'elementor/custom-icons/' . self::LIBRARY;
		$font_dir = $this->pack_dir . '/font';

		wp_mkdir_p( $font_dir );
		copy( __DIR__ . '/fixtures/fontello/config.json', $this->pack_dir . '/config.json' );
		copy( __DIR__ . '/fixtures/fontello/font/fontello.svg', $font_dir . '/fontello.svg' );
	}

	private function remove_pack_dir(): void {
		if ( '' === $this->pack_dir || ! is_dir( $this->pack_dir ) ) {
			return;
		}

		$iterator = new \RecursiveIteratorIterator(
			new \RecursiveDirectoryIterator( $this->pack_dir, \FilesystemIterator::SKIP_DOTS ),
			\RecursiveIteratorIterator::CHILD_FIRST
		);

		foreach ( $iterator as $file ) {
			$file->isDir() ? rmdir( $file->getPathname() ) : unlink( $file->getPathname() );
		}

		rmdir( $this->pack_dir );
		$this->pack_dir = '';
	}
}
