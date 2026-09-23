<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg;

use Elementor\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg\Resolver;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Resolver extends Elementor_Test_Base {
	private $pack_dir = '';

	public function setUp(): void {
		parent::setUp();

		Resolver::reset_memory();
		$this->pack_dir = '';
		remove_all_filters( 'elementor/icons_manager/additional_tabs' );
		remove_all_filters( 'elementor/atomic-widgets/custom-icon-library-dir' );
	}

	public function tearDown(): void {
		Resolver::reset_memory();
		remove_all_filters( 'elementor/icons_manager/additional_tabs' );
		remove_all_filters( 'elementor/atomic-widgets/custom-icon-library-dir' );
		$this->remove_pack_dir();

		parent::tearDown();
	}

	public function test_resolve__returns_empty_when_library_files_remain_but_tab_is_unregistered() {
		// Arrange.
		$this->copy_fontello_pack( 'pw-fontello' );

		add_filter(
			'elementor/atomic-widgets/custom-icon-library-dir',
			function ( $dir, $tab ) {
				$name = isset( $tab['name'] ) ? (string) $tab['name'] : '';

				return 'pw-fontello' === $name ? $this->pack_dir : $dir;
			},
			10,
			2
		);

		$icon = [
			'library' => 'pw-fontello',
			'value' => 'icon icon-emo-surprised',
		];

		// Act.
		$without_tab = Resolver::resolve( $icon );

		add_filter(
			'elementor/icons_manager/additional_tabs',
			static function ( $tabs ) {
				$tabs['pw-fontello'] = [
					'name' => 'pw-fontello',
					'label' => 'PW Fontello',
					'prefix' => 'icon-',
					'displayPrefix' => '',
					'native' => false,
					'icons' => [ 'emo-surprised' ],
				];

				return $tabs;
			}
		);

		Resolver::reset_memory();
		$with_tab = Resolver::resolve( $icon );

		remove_all_filters( 'elementor/icons_manager/additional_tabs' );
		Resolver::reset_memory();
		$after_delete = Resolver::resolve( $icon );

		// Assert.
		$this->assertSame( '', $without_tab );
		$this->assertStringContainsString( 'M0 0H100V100H0Z', $with_tab );
		$this->assertSame( '', $after_delete );
	}

	private function copy_fontello_pack( string $library ): void {
		$uploads = wp_upload_dir();
		$this->pack_dir = trailingslashit( $uploads['basedir'] ) . 'elementor/custom-icons/' . $library;
		$font_dir = $this->pack_dir . '/font';
		$source = __DIR__ . '/fixtures/fontello';

		wp_mkdir_p( $font_dir );
		copy( $source . '/config.json', $this->pack_dir . '/config.json' );
		copy( $source . '/font/fontello.svg', $font_dir . '/fontello.svg' );
	}

	private function remove_pack_dir(): void {
		if ( '' === $this->pack_dir || ! is_dir( $this->pack_dir ) ) {
			return;
		}

		$font = $this->pack_dir . '/font/fontello.svg';
		$config = $this->pack_dir . '/config.json';

		if ( is_file( $font ) ) {
			unlink( $font );
		}

		if ( is_file( $config ) ) {
			unlink( $config );
		}

		if ( is_dir( $this->pack_dir . '/font' ) ) {
			rmdir( $this->pack_dir . '/font' );
		}

		rmdir( $this->pack_dir );
		$this->pack_dir = '';
	}
}
