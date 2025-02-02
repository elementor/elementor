<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Checklist\Classes;

use Elementor\Core\Isolation\Wordpress_Adapter;
use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Core\Isolation\Elementor_Adapter;
use Elementor\Core\Isolation\Elementor_Adapter_Interface;
use Elementor\Modules\Checklist\Checklist_Module_Interface;
use Elementor\Modules\Checklist\Module as Checklist_Module;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Step_Test_Base extends PHPUnit_TestCase {
	const WORDPRESS_MOCK_ID = 'wordpress';
	const ELEMENTOR_MOCK_ID = 'elementor';

	/**
	 * @var MockObject&Wordpress_Adapter_Interface
	 */
	protected $wordpress_adapter;

	/**
	 * @var MockObject&Elementor_Adapter_Interface
	 */
	protected $elementor_adapter;


	protected Checklist_Module_Interface $checklist_module;

	private array $user_preferences_mock = [];

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

	public function set_wordpress_adapter_mock( $return_value_map, $callbacks_map = [] ) : Step_Test_Base {
		$this->wordpress_adapter = $this->get_adapter_mock( self::WORDPRESS_MOCK_ID, $return_value_map, $callbacks_map );

		return $this->set_checklist_module();
	}

	public function set_elementor_adapter_mock( $return_value_map, $callbacks_map = [] ) : Step_Test_Base {
		$this->elementor_adapter = $this->get_adapter_mock( self::ELEMENTOR_MOCK_ID, $return_value_map, $callbacks_map );

		return $this->set_checklist_module();
	}

	public function set_user_preferences( $key, $value ) {
		$this->user_preferences_mock[ $key ] = $value;
	}

	public function get_user_preferences( $key ) {
		return $this->user_preferences_mock[ $key ] ?? null;
	}

	protected function set_checklist_module(
		?Wordpress_Adapter_Interface $wordpress_adapter = null,
		?Elementor_Adapter_Interface $elementor_adapter = null
	) : Step_Test_Base {
		$wordpress_adapter = $wordpress_adapter ?? $this->wordpress_adapter;
		$elementor_adapter = $elementor_adapter ?? $this->elementor_adapter;

		$this->checklist_module = new Checklist_Module( $wordpress_adapter, $elementor_adapter );

		return $this;
	}

	protected function mock_editor_visit() {
		do_action( 'elementor/editor/init' );
	}

	protected function reset_progress() : Step_Test_Base {
		$this->set_elementor_adapter_mock( [ 'get_count' => 0, 'is_active_kit_default' => true ] )
			->set_wordpress_adapter_mock( [ 'is_new_installation' => true ] )
			->checklist_module->update_user_progress( [
				Checklist_Module::FIRST_CLOSED_CHECKLIST_IN_EDITOR => false,
				Checklist_Module::IS_POPUP_MINIMIZED_KEY => false,
			'steps' => [],
		] );

		return $this;
	}

	/**
	 * Creates a mock object of any of the adapters' class with specified methods, return callbacks and return values.
	 *
	 * @param (self::WORDPRESS_MOCK_ID|self::ELEMENTOR_MOCK_ID) $adapter_key
	 * @param array $return_value_map Associative array mapping method names to their return values.
	 * @param array $callbacks_map Associative array mapping method names to a mock callback.
	 *
	 * @return MockObject
	 */
	private function get_adapter_mock( $adapter_key, $return_value_map, $callbacks_map = [] ) {
		$classes = [
			self::WORDPRESS_MOCK_ID => Wordpress_Adapter::class,
			self::ELEMENTOR_MOCK_ID => Elementor_Adapter::class,
		];

		$class = $classes[ $adapter_key ];

		$adapter_mock = $this->getMockBuilder( $class )
			->setMethods( array_keys( array_merge( $return_value_map, $callbacks_map ) ) )
			->getMock();

		foreach ( $return_value_map as $method => $return_value ) {
			$adapter_mock->method( $method )->willReturn( $return_value );
		}

		foreach ( $callbacks_map as $method => $callback ) {
			$adapter_mock->method( $method )->willReturnCallback( $callback );
		}

		return $adapter_mock;
	}
}
