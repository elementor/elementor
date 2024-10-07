<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Checklist\Classes;

use Elementor\Core\Isolation\Wordpress_Adapter;
use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Core\Isolation\Kit_Adapter;
use Elementor\Core\Isolation\Kit_Adapter_Interface;
use Elementor\Modules\ElementorCounter\Module as Elementor_Counter;
use Elementor\Core\Isolation\Elementor_Counter_Adapter_Interface;
use Elementor\Modules\Checklist\Checklist_Module_Interface;
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

	protected Checklist_Module_Interface $checklist_module;

	public function setup(): void {
		$this->set_checklist_module();

		parent::setUp();
	}

	/**
	 * Creates a mock object of the Wordpress_Adapter class with specified methods and return values.
	 *
	 * @param string[] $methods Array of method names to be mocked.
	 * @param array $return_map Associative array mapping method names to their return values.
	 *
	 * @return Step_Test_Base
	 */
	public function set_wordpress_adapter_mock( $methods, $return_map ) : Step_Test_Base {
		$this->wordpress_adapter =  $this->get_adapter_mock( self::WORDPRESS_ID, $methods, $return_map );

		return $this;
	}

	/**
	 * Creates a mock object of the Kit_Adapter class with specified methods and return values.
	 *
	 * @param string[] $methods Array of method names to be mocked.
	 * @param array $return_map Associative array mapping method names to their return values.
	 *
	 * @return Step_Test_Base
	 */
	public function set_kit_adapter_mock( $methods, $return_map ) : Step_Test_Base {
		$this->kit_adapter =  $this->get_adapter_mock( self::KIT_ID, $methods, $return_map );

		return $this;
	}

	/**
	 * Creates a mock object of the Elementor_Counter_Adapter class with specified methods and return values.
	 *
	 * @param string[] $methods Array of method names to be mocked.
	 * @param array $return_map Associative array mapping method names to their return values.
	 *
	 * @return Step_Test_Base
	 */
	public function set_counter_adapter_mock( $methods, $return_map ) : Step_Test_Base {
		$this->counter_adapter =  $this->get_adapter_mock( self::ELEMENTOR_COUNTER_ID, $methods, $return_map );

		return $this;
	}

	/**
	 * Creates a mock object of any of the adapters' class with specified methods and return values.
	 *
	 * @param (self::WORDPRESS_ID|self::KIT_ID|self::ELEMENTOR_COUNTER_ID) $adapter_key
	 * @param string[] $methods Array of method names to be mocked.
	 * @param array $return_map Associative array mapping method names to their return values.
	 *
	 * @return MockObject
	 */
	private function get_adapter_mock( $adapter_key, $methods, $return_map ) {
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

		return $adapter_mock;
	}

	protected function set_checklist_module(
		?Wordpress_Adapter_Interface $wordpress_adapter = null,
		?Kit_Adapter_Interface $kit_adapter = null,
		?Elementor_Counter_Adapter_Interface $counter_adapter = null
	) : Step_Test_Base {
		$wordpress_adapter = $wordpress_adapter ?? $this->wordpress_adapter;
		$kit_adapter = $kit_adapter ?? $this->kit_adapter;
		$counter_adapter = $counter_adapter ?? $this->counter_adapter;

		$this->checklist_module = new Checklist_Module( $wordpress_adapter, $kit_adapter, $counter_adapter );

		return $this;
	}
}
