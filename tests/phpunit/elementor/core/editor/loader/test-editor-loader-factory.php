<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Editor\Loader;

use Elementor\Core\Editor\Loader\Editor_Loader_Factory;
use Elementor\Core\Editor\Loader\V1\Editor_V1_Loader;
use Elementor\Core\Editor\Loader\V2\Editor_V2_Loader;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Test_Editor_Loader_Factory extends Elementor_Test_Base {
	public function set_up() {
		parent::set_up();

		remove_all_filters( 'elementor/editor/v2/packages' );
	}

	public function test_create__returns_an_instance_of_v2_loader_when_packages_are_enqueued() {
		// Arrange
		add_filter( 'elementor/editor/v2/packages', function ( $packages ) {
			$packages_to_enqueue = [
				'package1',
				'package2',
			];

			return array_merge( $packages, $packages_to_enqueue );
		} );

		// Act
		$loader = Editor_Loader_Factory::create();

		// Assert
		$this->assertInstanceOf( Editor_V2_Loader::class, $loader );
	}

public function test_create__returns_an_instance_of_v1_loader_when_no_packages_are_enqueued() {
		// Arrange
		add_filter( 'elementor/editor/v2/packages', function ( $packages ) {
			return [];
		} );

		// Act
		$loader = Editor_Loader_Factory::create();

		// Assert
		$this->assertInstanceOf( Editor_V1_Loader::class, $loader );
	}
}
