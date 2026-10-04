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
		remove_all_filters( 'elementor/atomic-widgets/custom-icon-libraries/enabled' );
		$this->remove_pack_dir();

		parent::tearDown();
	}

	public function test_resolve__returns_empty_when_library_files_remain_but_tab_is_unregistered() {
		// Arrange.
		add_filter( 'elementor/atomic-widgets/custom-icon-libraries/enabled', '__return_true' );
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

	public function test_resolve__converts_icomoon_pack_without_custom_icon_type() {
		// Arrange.
		add_filter( 'elementor/atomic-widgets/custom-icon-libraries/enabled', '__return_true' );
		$this->write_icomoon_pack( 'pw-icomoon' );
		add_filter(
			'elementor/atomic-widgets/custom-icon-library-dir',
			function ( $dir, $tab ) {
				$name = isset( $tab['name'] ) ? (string) $tab['name'] : '';

				return 'pw-icomoon' === $name ? $this->pack_dir : $dir;
			},
			10,
			2
		);
		add_filter(
			'elementor/icons_manager/additional_tabs',
			static function ( $tabs ) {
				$tabs['pw-icomoon'] = [
					'name' => 'pw-icomoon',
					'label' => 'PW Icomoon',
					'prefix' => 'icon-',
					'displayPrefix' => '',
					'native' => false,
					'fetchJson' => 'https://example.test/uploads/elementor/custom-icons/pw-icomoon/eicons.js',
				];

				return $tabs;
			}
		);

		// Act.
		$svg = Resolver::resolve( [
			'library' => 'pw-icomoon',
			'value' => 'icon icon-home',
		] );
		$map = Resolver::resolve_library( 'pw-icomoon' );

		// Assert.
		$this->assertStringContainsString( 'M0 0H1024V1024H0Z', $svg );
		$this->assertArrayHasKey( 'icon icon-home', $map );
	}

	public function test_resolve__converts_svg_font_outside_fontello_path() {
		// Arrange.
		add_filter( 'elementor/atomic-widgets/custom-icon-libraries/enabled', '__return_true' );
		$this->write_generic_svg_font_pack( 'pw-fontastic' );
		add_filter(
			'elementor/atomic-widgets/custom-icon-library-dir',
			function ( $dir, $tab ) {
				$name = isset( $tab['name'] ) ? (string) $tab['name'] : '';

				return 'pw-fontastic' === $name ? $this->pack_dir : $dir;
			},
			10,
			2
		);
		add_filter(
			'elementor/icons_manager/additional_tabs',
			static function ( $tabs ) {
				$tabs['pw-fontastic'] = [
					'name' => 'pw-fontastic',
					'prefix' => 'icon-',
					'displayPrefix' => '',
					'native' => false,
					'icons' => [ 'emo-surprised' ],
				];

				return $tabs;
			}
		);

		// Act.
		$svg = Resolver::resolve( [
			'library' => 'pw-fontastic',
			'value' => 'icon icon-emo-surprised',
		] );

		// Assert.
		$this->assertStringContainsString( 'M0 0H100V100H0Z', $svg );
	}

	public function test_resolve__returns_empty_when_pro_license_is_inactive() {
		// Arrange.
		add_filter( 'elementor/atomic-widgets/custom-icon-libraries/enabled', '__return_false' );
		add_filter(
			'elementor/icons_manager/additional_tabs',
			static function ( $tabs ) {
				$tabs['pw-fontello'] = [
					'name' => 'pw-fontello',
					'label' => 'PW Fontello',
					'prefix' => 'icon-',
					'native' => false,
					'icons' => [ 'emo-surprised' ],
				];

				return $tabs;
			}
		);

		// Act.
		$svg = Resolver::resolve( [
			'library' => 'pw-fontello',
			'value' => 'icon icon-emo-surprised',
		] );

		// Assert.
		$this->assertSame( '', $svg );
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

	private function write_icomoon_pack( string $library ): void {
		$uploads = wp_upload_dir();
		$this->pack_dir = trailingslashit( $uploads['basedir'] ) . 'elementor/custom-icons/' . $library;
		wp_mkdir_p( $this->pack_dir );

		file_put_contents(
			$this->pack_dir . '/eicons.js',
			wp_json_encode( [ 'icons' => [ 'home' ] ] )
		);
		file_put_contents(
			$this->pack_dir . '/selection.json',
			wp_json_encode( [
				'preferences' => [ 'fontPref' => [ 'prefix' => 'icon-' ] ],
				'icons' => [
					[
						'icon' => [
							'paths' => [ 'M0 0H1024V1024H0Z' ],
							'width' => 1024,
						],
						'properties' => [ 'name' => 'home' ],
					],
				],
			] )
		);
	}

	private function write_generic_svg_font_pack( string $library ): void {
		$uploads = wp_upload_dir();
		$this->pack_dir = trailingslashit( $uploads['basedir'] ) . 'elementor/custom-icons/' . $library;
		$font_dir = $this->pack_dir . '/fonts';
		wp_mkdir_p( $font_dir );
		copy( __DIR__ . '/fixtures/fontello/font/fontello.svg', $font_dir . '/brand.svg' );
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
