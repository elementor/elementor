<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Editor\Loader;

use Elementor\Core\Editor\Loader\Editor_Loader;
use Elementor\Core\Utils\Assets_Config_Provider;
use Elementor\Core\Utils\Collection;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Editor_Loader extends Elementor_Test_Base {
	public function set_up() {
		parent::set_up();

		remove_all_filters( 'elementor/editor/v2/packages' );
	}

	public function test_constructor__creates_editor_loader_instance() {
		// Arrange
		$config = new Collection( [
			'assets_url' => ELEMENTOR_ASSETS_URL,
			'min_suffix' => '',
			'direction_suffix' => '',
		] );

		$assets_config_provider = ( new Assets_Config_Provider() )
			->set_path_resolver( function ( $name ) {
				return ELEMENTOR_ASSETS_PATH . "js/packages/{$name}/{$name}.asset.php";
			} );

		// Act
		$loader = new Editor_Loader( $config, $assets_config_provider );

		// Assert
		$this->assertInstanceOf( Editor_Loader::class, $loader );
	}
}
