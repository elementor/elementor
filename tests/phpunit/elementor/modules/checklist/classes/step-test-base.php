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

	const PLUGIN_ACTIVATED = 'plugin_activated';
	const KIT_FIRST_CHANGE = 'kit_first_change';
	const KIT_SECOND_CHANGE = 'kit_second_change';
	const PREFERENCE_FIRST_CHANGE = 'preference_first_change';
	const PREFERENCE_SECOND_CHANGE = 'preference_second_change';
	const EDITOR_FIRST_VISIT = 'editor_first_visit';
	const EDITOR_SECOND_VISIT = 'editor_second_visit';
	const EDITOR_THIRD_VISIT = 'editor_third_visit';
	const TOGGLE_POPUP_FIRST = 'toggle_popup_first';
	const TOGGLE_POPUP_SECOND = 'toggle_popup_second';

	const CUSTOM_KIT = 'custom';
	const DEFAULT_KIT = 'default';

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

	private $user_preferences_mock = [];

	public function setup(): void {
		parent::setUp();

		$this->reset_progress()
			->set_user_preferences(
			Checklist_Module::VISIBILITY_SWITCH_ID,
			$this->checklist_module->is_preference_switch_on() ? 'yes' : ''
		);
	}

	public function teardown(): void {
		parent::teardown();
	}

	/**
	 * Creates a mock object of the Wordpress_Adapter class with specified methods and return values.
	 *
	 * @param array $methods_map Associative array mapping method names to their return values.
	 * @param bool $should_instantiate_module set to true to re-instantiate the module.
	 *
	 * @return Step_Test_Base
	 */
	public function set_wordpress_adapter_mock( $methods_map, $callbacks_map = [], $should_instantiate_module = true ) : Step_Test_Base {
//		if ( ! isset( $callbacks_map[ 'get_user_preferences' ] ) ) {
//			$callbacks_map[ 'get_user_preferences' ] = [ $this, 'get_user_preferences' ];
//		}
//
//		if ( ! isset( $callbacks_map[ 'set_user_preferences' ] ) ) {
//			$callbacks_map[ 'set_user_preferences' ] = [ $this, 'set_user_preferences' ];
//		}

		$this->wordpress_adapter = $this->get_adapter_mock( self::WORDPRESS_ID, $methods_map, $callbacks_map );

		if ( $should_instantiate_module ) {
			$this->set_checklist_module();
		}

		return $this;
	}

	/**
	 * Creates a mock object of the Kit_Adapter class with specified methods and return values.
	 *
	 * @param array $methods_map Associative array mapping method names to their return values.
	 * @param bool $should_instantiate_module set to true to re-instantiate the module.
	 *
	 * @return Step_Test_Base
	 */
	public function set_kit_adapter_mock( $methods_map, $callbacks_map = [], $should_instantiate_module = true ) : Step_Test_Base {
		$this->kit_adapter = $this->get_adapter_mock( self::KIT_ID, $methods_map, $callbacks_map );

		if ( $should_instantiate_module ) {
			$this->set_checklist_module();
		}

		return $this;
	}

	/**
	 * Creates a mock object of the Elementor_Counter_Adapter class with specified methods and return values.
	 *
	 * @param array $methods_map Associative array mapping method names to their return values.
	 * @param bool $should_instantiate_module set to true to re-instantiate the module.
	 *
	 * @return Step_Test_Base
	 */
	public function set_counter_adapter_mock( $methods_map, $callbacks_map = [], $should_instantiate_module = true ) : Step_Test_Base {
		$this->counter_adapter = $this->get_adapter_mock( self::ELEMENTOR_COUNTER_ID, $methods_map, $callbacks_map );

		if ( $should_instantiate_module ) {
			$this->set_checklist_module();
		}

		return $this;
	}

	public function set_user_preferences( $key, $value ) {
		$this->user_preferences_mock[ $key ] = $value;
	}

	public function get_user_preferences( $key ) {
		return $this->user_preferences_mock[ $key ] ?? null;
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

	protected function mock_editor_visit() {
		do_action( 'elementor/editor/init' );
	}

	protected function reset_progress() : Step_Test_Base {
		$this->set_counter_adapter_mock( [ 'get_count' => 0 ] )
			->set_kit_adapter_mock( [ 'is_active_kit_default' => true ] )
			->set_wordpress_adapter_mock( [ 'is_new_installation' => true ] )
			->checklist_module->update_user_progress( [
			Checklist_Module::FIRST_CLOSED_CHECKLIST_IN_EDITOR => false,
			Checklist_Module::IS_POPUP_MINIMIZED_KEY => false,
			'steps' => [],
		] );

		var_dump( "\n\nreset!@#@!\n\n" );
		$this->checklist_module->should_switch_preferences_off( true );
		return $this;
	}

	/**
	 * Creates a mock object of any of the adapters' class with specified methods and return values.
	 *
	 * @param (self::WORDPRESS_ID|self::KIT_ID|self::ELEMENTOR_COUNTER_ID) $adapter_key
	 * @param array $methods_map Associative array mapping method names to their return values.
	 *
	 * @return MockObject
	 */
	private function get_adapter_mock( $adapter_key, $methods_map, $callbacks_map = [] ) {
		$classes = [
			self::WORDPRESS_ID => Wordpress_Adapter::class,
			self::KIT_ID => Kit_Adapter::class,
			self::ELEMENTOR_COUNTER_ID => Elementor_Counter::class,
		];

		$class = $classes[ $adapter_key ];

		$adapter_mock = $this->getMockBuilder( $class )
			->setMethods( array_merge( array_keys( $methods_map ), array_keys( $callbacks_map ) ) )
			->getMock();

		foreach ( $methods_map as $method => $return_value ) {
			$adapter_mock->method( $method )->willReturn( $return_value );
		}

		foreach ( $callbacks_map as $method => $callback ) {
			$adapter_mock->method( $method )->willReturnCallback( $callback );
		}

		return $adapter_mock;
	}
}
