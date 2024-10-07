<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Checklist\Classes;

use Elementor\Core\Isolation\Wordpress_Adapter;
use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Core\Isolation\Kit_Adapter;
use Elementor\Core\Isolation\Kit_Adapter_Interface;
use Elementor\Modules\ElementorCounter\Module as Elementor_Counter;
use Elementor\Core\Isolation\Elementor_Counter_Adapter_Interface;
use Elementor\Modules\Checklist\Module as Checklist_Module;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Step_Test_Base extends PHPUnit_TestCase {
	const WORDPRESS_ID = 'wordpress';
	const KIT_ID = 'kit';
	const ELEMENTOR_COUNTER_ID = 'counter';

	/**
	 * @var MockObject&Wordpress_Adapter_Interface
	 */
	protected $wordpress_adapter;

	/**
	 * @var MockObject&Kit_Adapter_Interface
	 */
	protected $kit_adapter;

	/**
	 * @var MockObject&Elementor_Counter_Adapter_Interface
	 */
	protected $counter_adapter;

	protected Checklist_Module $checklist_module;

	public function setup(): void {
		$this->checklist_module = new Checklist_Module( $this->wordpress_adapter, $this->kit_adapter, $this->counter_adapter );

		parent::setUp();
	}

	/**
	 * Creates a mock object of the Wordpress_Adapter class with specified methods and return values.
	 *
	 * @param string[] $methods Array of method names to be mocked.
	 * @param array $return_map Associative array mapping method names to their return values.
	 *
	 * @return Wordpress_Adapter&MockObject
	 */
	public function set_wordpress_adapter_mock( $methods, $return_map ) {
		$this->wordpress_adapter =  $this->set_adapter_mock( self::WORDPRESS_ID, $methods, $return_map );

		return $this->wordpress_adapter;
	}

	/**
	 * Creates a mock object of any of the adapters' class with specified methods and return values.
	 *
	 * @param (self::WORDPRESS_ID|self::KIT_ID|self::ELEMENTOR_COUNTER_ID) $adapter_key
	 * @param string[] $methods Array of method names to be mocked.
	 * @param array $return_map Associative array mapping method names to their return values.
	 *
	 * @return (Wordpress_Adapter_Interface|Kit_Adapter_Interface|Elementor_Counter_Adapter_Interface)&MockObject
	 */
	private function set_adapter_mock( $adapter_key, $methods, $return_map ) {
		$classes = [
			self::WORDPRESS_ID => Wordpress_Adapter::class,
			self::KIT_ID => Kit_Adapter::class,
			self::ELEMENTOR_COUNTER_ID => Elementor_Counter::class,
		];

		$class = $classes[ $adapter_key ];

		$adapter_mock = $this->getMockBuilder( $class )
			->setMethods( $methods )
			->getMock();

		foreach ( $return_map as $method => $return_value ) {
			$adapter_mock->method( $method )->willReturn( $return_value );
		}

		$this->wordpress_adapter = $adapter_mock;

		return $adapter_mock;
	}
}
