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

		remove_all_filters( 'elementor/editor/packages' );
		remove_all_filters( 'elementor/editor/v1/packages' );
		remove_all_filters( 'elementor/editor/v2/packages' );
	}

	public function test_constructor__creates_editor_loader_instance() {
		// Arrange
		$loader = $this->create_loader();

		// Assert
		$this->assertInstanceOf( Editor_Loader::class, $loader );
	}

	public function test_init__does_not_fire_canonical_editor_init_hook() {
		// Arrange
		$canonical_init_count = 0;
		$v1_init_count = 0;
		$v2_init_count = 0;

		add_action( 'elementor/editor/init', function () use ( &$canonical_init_count ) {
			$canonical_init_count++;
		} );
		add_action( 'elementor/editor/v1/init', function () use ( &$v1_init_count ) {
			$v1_init_count++;
		} );
		add_action( 'elementor/editor/v2/init', function () use ( &$v2_init_count ) {
			$v2_init_count++;
		} );

		$loader = $this->create_loader();

		// Act
		$loader->init();

		// Assert
		$this->assertSame( 0, $canonical_init_count );
		$this->assertSame( 1, $v1_init_count );
		$this->assertSame( 1, $v2_init_count );
	}

	public function test_register_scripts__fires_canonical_and_legacy_hooks() {
		// Arrange
		$canonical_scripts_register_count = 0;
		$v1_scripts_register_count = 0;
		$v2_scripts_register_count = 0;

		add_action( 'elementor/editor/scripts/register', function () use ( &$canonical_scripts_register_count ) {
			$canonical_scripts_register_count++;
		} );
		add_action( 'elementor/editor/v1/scripts/register', function () use ( &$v1_scripts_register_count ) {
			$v1_scripts_register_count++;
		} );
		add_action( 'elementor/editor/v2/scripts/register', function () use ( &$v2_scripts_register_count ) {
			$v2_scripts_register_count++;
		} );

		$loader = $this->create_loader();

		// Act
		$loader->init();
		$loader->register_scripts();

		// Assert
		$this->assertSame( 1, $canonical_scripts_register_count );
		$this->assertSame( 1, $v1_scripts_register_count );
		$this->assertSame( 1, $v2_scripts_register_count );
	}

	private function create_loader(): Editor_Loader {
		$config = new Collection( [
			'assets_url' => ELEMENTOR_ASSETS_URL,
			'min_suffix' => '',
			'direction_suffix' => '',
		] );

		$assets_config_provider = ( new Assets_Config_Provider() )
			->set_path_resolver( function ( $name ) {
				return ELEMENTOR_ASSETS_PATH . "js/packages/{$name}/{$name}.asset.php";
			} );

		return new Editor_Loader( $config, $assets_config_provider );
	}
}
