<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\PropsResolver\Font_Awesome_7_Icon_Resolver;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Font_Awesome_7_Icon_Resolver extends Elementor_Test_Base {
	public function setUp(): void {
		parent::setUp();

		$this->ensure_font_awesome_7_json_available();

		add_filter(
			'elementor/atomic-widgets/font-awesome-7/json-base-path',
			fn() => ELEMENTOR_ASSETS_PATH . 'lib/font-awesome-7/json/'
		);
	}

	public function tearDown(): void {
		remove_all_filters( 'elementor/icons_manager/additional_tabs' );
		remove_all_filters( 'elementor/atomic-widgets/custom-icon-libraries/enabled' );
		remove_all_filters( 'elementor/atomic-widgets/font-awesome-7/json-base-path' );

		Font_Awesome_7_Icon_Resolver::reset();

		parent::tearDown();
	}

	private function ensure_font_awesome_7_json_available(): void {
		$json_dir = ELEMENTOR_ASSETS_PATH . 'lib/font-awesome-7/json';
		$solid_file = $json_dir . '/solid.json';

		if ( is_readable( $solid_file ) ) {
			return;
		}

		if ( ! is_dir( $json_dir ) && ! mkdir( $json_dir, 0777, true ) && ! is_dir( $json_dir ) ) {
			$this->fail( 'Could not create Font Awesome 7 test JSON directory.' );
		}

		$icons = [
			'0' => [ 448, 512, [], 'e0600', 'M0 0' ],
			'1' => [ 256, 512, [], 'e0601', 'M1 1' ],
			'2' => [ 320, 512, [], 'e0602', 'M2 2' ],
			'3' => [ 384, 512, [], 'e0603', 'M3 3' ],
			'4' => [ 384, 512, [], 'e0604', 'M4 4' ],
			'5' => [ 320, 512, [], 'e0605', 'M5 5' ],
			'6' => [ 320, 512, [], 'e0606', 'M6 6' ],
			'7' => [ 320, 512, [], 'e0607', 'M7 7' ],
			'8' => [ 320, 512, [], 'e0608', 'M8 8' ],
			'9' => [ 320, 512, [], 'e0609', 'M9 9' ],
			'cart-shopping' => [ 576, 512, [], 'f07a', 'M0 0' ],
			'house' => [ 576, 512, [ 'home' ], 'f015', 'M0 0' ],
		];

		file_put_contents(
			$solid_file,
			wp_json_encode( [ 'icons' => $icons ] )
		);
	}

	public function test_get_editor_config__adds_my_libraries_group_when_additional_tabs_exist() {
		// Arrange.
		add_filter( 'elementor/atomic-widgets/custom-icon-libraries/enabled', '__return_true' );
		add_filter(
			'elementor/icons_manager/additional_tabs',
			static function ( $tabs ) {
				$tabs['nehama-1'] = [
					'name' => 'nehama-1',
					'label' => 'Nehama 1',
					'prefix' => 'nehama-',
					'custom_icon_type' => 'fontello',
					'native' => false,
				];

				return $tabs;
			}
		);

		// Act.
		$config = Font_Awesome_7_Icon_Resolver::get_editor_config();
		$labels = array_column( $config['filter'], 'label' );
		$values = array_column( $config['filter'], 'value' );

		// Assert.
		$this->assertContains( 'My libraries', $labels );
		$this->assertContains( 'Nehama 1', $labels );
		$this->assertContains( 'nehama-1', $values );
		$this->assertTrue( $config['customIconLibrariesEnabled'] );
	}

	public function test_get_editor_config__omits_unsupported_custom_icon_types() {
		// Arrange.
		add_filter( 'elementor/atomic-widgets/custom-icon-libraries/enabled', '__return_true' );
		add_filter(
			'elementor/icons_manager/additional_tabs',
			static function ( $tabs ) {
				$tabs['nucleo'] = [
					'name' => 'nucleo',
					'label' => 'Nucleo',
					'prefix' => 'nc-',
					'custom_icon_type' => 'nucleo',
					'native' => false,
				];
				$tabs['fa-duotone'] = [
					'name' => 'fa-duotone',
					'label' => 'Font Awesome - Duotone',
					'prefix' => 'fa-duotone ',
					'native' => false,
				];

				return $tabs;
			}
		);

		// Act.
		$config = Font_Awesome_7_Icon_Resolver::get_editor_config();
		$labels = array_column( $config['filter'], 'label' );

		// Assert.
		$this->assertNotContains( 'My libraries', $labels );
		$this->assertNotContains( 'Nucleo', $labels );
		$this->assertNotContains( 'Font Awesome - Duotone', $labels );
		$this->assertSame( [], $config['customIconPacks'] );
	}

	public function test_get_editor_config__omits_custom_libraries_when_pro_license_is_inactive() {
		// Arrange.
		add_filter( 'elementor/atomic-widgets/custom-icon-libraries/enabled', '__return_false' );
		add_filter(
			'elementor/icons_manager/additional_tabs',
			static function ( $tabs ) {
				$tabs['nehama-1'] = [
					'name' => 'nehama-1',
					'label' => 'Nehama 1',
					'prefix' => 'nehama-',
					'native' => false,
				];

				return $tabs;
			}
		);

		// Act.
		$config = Font_Awesome_7_Icon_Resolver::get_editor_config();
		$labels = array_column( $config['filter'], 'label' );

		// Assert.
		$this->assertFalse( $config['customIconLibrariesEnabled'] );
		$this->assertSame( [], $config['customIconPacks'] );
		$this->assertNotContains( 'My libraries', $labels );
		$this->assertNotContains( 'Nehama 1', $labels );
	}

	/**
	 * @dataProvider data_digit_icon_names
	 */
	public function test_resolve__handles_digit_icon_names( string $input_name, string $expected_name ) {
		// Arrange.
		Font_Awesome_7_Icon_Resolver::reset();
		$icon_value = 'fa-solid ' . $input_name;

		// Act.
		$result = Font_Awesome_7_Icon_Resolver::resolve( $icon_value, 'fa-solid' );

		// Assert.
		$this->assertIsArray( $result, "Failed to resolve $icon_value" );
		$this->assertArrayHasKey( 'paths', $result );
		$this->assertNotEmpty( $result['paths'], "Icon $expected_name should resolve to paths" );
	}

	public function data_digit_icon_names(): array {
		return [
			'fa-0' => [ 'fa-0', '0' ],
			'fa-1' => [ 'fa-1', '1' ],
			'fa-2' => [ 'fa-2', '2' ],
			'fa-3' => [ 'fa-3', '3' ],
			'fa-4' => [ 'fa-4', '4' ],
			'fa-5' => [ 'fa-5', '5' ],
			'fa-6' => [ 'fa-6', '6' ],
			'fa-7' => [ 'fa-7', '7' ],
			'fa-8' => [ 'fa-8', '8' ],
			'fa-9' => [ 'fa-9', '9' ],
		];
	}
}
