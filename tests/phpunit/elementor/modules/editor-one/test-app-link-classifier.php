<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Modules\EditorOne\Classes\App_Link_Classifier;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_App_Link_Classifier extends Elementor_Test_Base {

	public function test_opens_in_app__theme_builder_v2_url() {
		// Arrange
		$url = admin_url( 'admin.php?page=elementor-app&return_to=%2Fwp-admin' ) . '#/site-editor';

		// Act & Assert
		$this->assertTrue( App_Link_Classifier::opens_in_app( $url ) );
	}

	public function test_opens_in_app__theme_builder_promotion_url() {
		// Arrange
		$url = admin_url( 'admin.php?page=elementor-app' ) . '#/site-editor/promotion';

		// Act & Assert
		$this->assertTrue( App_Link_Classifier::opens_in_app( $url ) );
	}

	public function test_opens_in_app__website_templates_url() {
		// Arrange
		$url = admin_url( 'admin.php?page=elementor-app' ) . '#/kit-library';

		// Act & Assert
		$this->assertTrue( App_Link_Classifier::opens_in_app( $url ) );
	}

	public function test_opens_in_app__legacy_theme_builder_list_url() {
		// Arrange
		$url = admin_url( 'edit.php?post_type=elementor_library&tabs_group=theme&elementor_library_type=header' );

		// Act & Assert
		$this->assertFalse( App_Link_Classifier::opens_in_app( $url ) );
	}

	public function test_opens_in_app__other_app_route() {
		// Arrange
		$url = admin_url( 'admin.php?page=elementor-app' ) . '#/import-export-customization';

		// Act & Assert
		$this->assertFalse( App_Link_Classifier::opens_in_app( $url ) );
	}
}
