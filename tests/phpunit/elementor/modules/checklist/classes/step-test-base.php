<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Checklist\Classes;

use Elementor\Core\Isolation\Wordpress_Adapter;
use Elementor\Modules\Checklist\Module as Checklist_Module;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Step_Test_Base extends PHPUnit_TestCase {
	protected Wordpress_Adapter $wordpress_adapter;
	protected Checklist_Module $checklist_module;

	public function setup(): void {
		$this->checklist_module = new Checklist_Module( $this->wordpress_adapter );

		parent::setUp();
	}

	/**
	 * Creates a mock object of the Wordpress_Adapter class with specified methods and return values.
	 *
	 * @param string[] $methods Array of method names to be mocked.
	 * @param array $return_map Associative array mapping method names to their return values.
	 * @return void
	 */
	public function set_wordpress_adapter_mock( $methods, $return_map ): void {
		$wordpress_adapter_mock = $this->getMockBuilder( Wordpress_Adapter::class )
			->setMethods( $methods )
			->getMock();

		foreach ( $return_map as $method => $return_value ) {
			$wordpress_adapter_mock->method( $method )->willReturnMap( $return_value );
		}

		$this->wordpress_adapter = $wordpress_adapter_mock;
	}
}
