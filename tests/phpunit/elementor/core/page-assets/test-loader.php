<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Page_Assets;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Testing\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Loader extends Elementor_Test_Base {
	public function test_init_assets() {
		$assets_loader = $this->elementor()->assets_loader;

		$assets = $assets_loader->get_assets();

		$this->assertArrayHasKey( 'styles', $assets, 'styles key was not initialized.' );
		$this->assertArrayHasKey( 'scripts', $assets, 'scripts key was not initialized.' );
	}

	public function test_get_assets() {
		$assets_loader = $this->elementor()->assets_loader;

		$this->add_testing_assets( 'e-style-get-asset', 'e-script-get-asset' );

		$assets = $assets_loader->get_assets();

		$this->assertArrayHasKey( 'e-style-get-asset', $assets['styles'], 'Can not retrieve e-style-get-asset from assets.' );
		$this->assertArrayHasKey( 'e-script-get-asset', $assets['scripts'], 'Can not retrieve e-script-get-asset from assets.' );
	}

	public function test_enable_asset() {
		$assets_loader = $this->elementor()->assets_loader;

		$this->add_testing_assets( 'e-style-enable-asset', 'e-script-enable-asset' );

		$assets = $assets_loader->get_assets();

		$this->assertArrayNotHasKey( 'enabled', $assets['styles']['e-style-enable-asset'], 'e-style-enable-asset should not be enabled by default.' );
		$this->assertArrayNotHasKey( 'enabled', $assets['scripts']['e-script-enable-asset'], 'e-script-enable-asset should not be enabled by default.' );

		$assets_loader->enable_assets( [
			'styles' => ['e-style-enable-asset'],
			'scripts' => ['e-script-enable-asset'],
		] );

		$assets = $assets_loader->get_assets();

		$this->assertArrayHasKey( 'enabled', $assets['styles']['e-style-enable-asset'], 'e-style-enable-asset was not properly enabled.' );
		$this->assertArrayHasKey( 'enabled', $assets['scripts']['e-script-enable-asset'], 'e-script-enable-asset was not properly enabled.' );
	}

	public function test_add_assets() {
		$assets_loader = $this->elementor()->assets_loader;

		$this->add_testing_assets( 'e-style-add-assets', 'e-script-add-assets' );

		$assets = $assets_loader->get_assets();

		$this->assertArrayHasKey( 'e-style-add-assets', $assets['styles'], 'e-style-add-asset was not properly added to assets.' );
		$this->assertArrayHasKey( 'e-script-add-assets', $assets['scripts'], 'e-script-add-asset was not properly added to assets.' );
	}

	public function test_enqueue_assets() {
		global $wp_styles;
		global $wp_scripts;

		$this->add_optimized_assets_loading_experiment();

		// When "optimized assets loading" mode is inactive, all assets should be loaded by default.
		$this->elementor()->experiments->set_feature_default_state( 'e_optimized_assets_loading', Experiments_Manager::STATE_INACTIVE );

		$this->add_testing_assets( 'e-style-default-enqueue', 'e-script-default-enqueue' );

		$assets_loader = $this->elementor()->assets_loader;

		$assets_loader->enqueue_assets();

		$this->assertContains( 'e-style-default-enqueue', $wp_styles->queue, 'e-style-default-enqueue was not properly enqueued.' );
		$this->assertContains( 'e-script-default-enqueue', $wp_scripts->queue, 'e-script-default-enqueue was not properly enqueued.' );

		// When "optimized assets loading" mode is active, assets should be loaded only when enabled.
		$this->elementor()->experiments->set_feature_default_state( 'e_optimized_assets_loading', Experiments_Manager::STATE_ACTIVE );

		$this->add_testing_assets( 'e-style-dynamic-enqueue', 'e-script-dynamic-enqueue' );

		$assets_loader->enqueue_assets();

		$this->assertNotContains( 'e-style-dynamic-enqueue', $wp_styles->queue, 'e-style-dynamic-enqueue should not be enqueued before it\'s enabled.' );
		$this->assertNotContains( 'e-script-dynamic-enqueue', $wp_scripts->queue, 'e-script-dynamic-enqueue should not be enqueued before it\'s enabled.' );

		$assets_loader->enable_assets( [
			'styles' => ['e-style-dynamic-enqueue'],
			'scripts' => ['e-script-dynamic-enqueue'],
		] );

		$assets_loader->enqueue_assets();

		$this->assertContains( 'e-style-dynamic-enqueue', $wp_styles->queue, 'e-style-dynamic-enqueue was not properly enqueued.' );
		$this->assertContains( 'e-script-dynamic-enqueue', $wp_scripts->queue, 'e-script-dynamic-enqueue was not properly enqueued.' );
	}

	private function add_testing_assets( $style_asset_key, $script_asset_key ) {
		$assets_loader = $this->elementor()->assets_loader;

		$assets = $assets_loader->get_assets();

		$this->assertArrayNotHasKey( $style_asset_key, $assets['styles'], 'Style asset key already exist, set a unique key for each style asset to prevent data collision.' );
		$this->assertArrayNotHasKey( $script_asset_key, $assets['scripts'], 'Script asset key already exist, set a unique key for script each asset to prevent data collision.' );

		$asset_data = [
			'src' => 'path',
			'version' => '5.9.1',
			'dependencies' => [],
		];

		$test_assets = [];

		$test_assets['styles'][ $style_asset_key ] = $asset_data;

		$test_assets['scripts'][ $script_asset_key ] = $asset_data;

		$assets_loader->add_assets( $test_assets );
	}

	private function add_optimized_assets_loading_experiment() {
		$experiments = $this->elementor()->experiments;

		$experiments->add_feature( [
			'name' => 'e_optimized_assets_loading',
			'title' => __( 'Optimized Assets Loading', 'elementor' ),
			'description' => sprintf( __( 'Please Note! The optimized assets loading mode reduces the amount of code that is loaded on the page by default. When activated, parts of the infrastructure code will be loaded dynamically, only when needed. <a href="%s">Learn More</a>', 'elementor' ), '#' ),
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
		] );
	}
}
