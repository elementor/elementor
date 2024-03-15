<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Home\Transformations;

use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Modules\Home\Classes\Tranformations_Manager;
use Elementor\Modules\Home\Transformations\Filter_Plugins;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Filter_Plugins_Transformation extends PHPUnit_TestCase {

	// This test is still a work in progress...


	/**
	 * @param array $get_plugins
	 * @return Installed_Plugins
	 */
	public function setup_and_get_image_condition( bool $has_featured_image ): Installed_Plugins {
		$plugin_array = [
			'elementor/elementor.php' => [
				'Name' => 'Elementor',
				'Version' => '3.0.0',
			],
			'elementor-pro/elementor-pro.php' => [
				'Name' => 'Elementor Pro',
				'Version' => '3.0.0',
			],
		];

		$wordpress_adapter_mock = $this->getMockBuilder( Wordpress_Adapter_Interface::class )->getMock();
		$wordpress_adapter_mock->method( 'get_plugins' )->willReturn( $plugin_array );

		return new Installed_Plugins( [ $wordpress_adapter_mock ] );
	}
}
