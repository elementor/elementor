<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\PropsResolver\Font_Awesome_7_Icon_Resolver;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Font_Awesome_7_Icon_Resolver extends Elementor_Test_Base {
	public function tearDown(): void {
		remove_all_filters( 'elementor/icons_manager/additional_tabs' );
		remove_all_filters( 'elementor/atomic-widgets/custom-icon-libraries/enabled' );

		parent::tearDown();
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
}
