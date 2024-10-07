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

	private $user;
	private $checklist_progress_backup;
	private $user_meta_backup;

	public function setup(): void {
		$this->setup_data()
			->set_checklist_module();

		parent::setUp();
	}
	public function teardown(): void {
		$this->reset_data();

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
	public function set_wordpress_adapter_mock( $methods_map, $should_instantiate_module = false ) : Step_Test_Base {
		$this->wordpress_adapter = $this->get_adapter_mock( self::WORDPRESS_ID, $methods_map );

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
	public function set_kit_adapter_mock( $methods_map, $should_instantiate_module = false ) : Step_Test_Base {
		$this->kit_adapter =  $this->get_adapter_mock( self::KIT_ID, $methods_map );

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
	public function set_counter_adapter_mock( $methods_map, $should_instantiate_module = false ) : Step_Test_Base {
		$this->counter_adapter =  $this->get_adapter_mock( self::ELEMENTOR_COUNTER_ID, $methods_map );

		if ( $should_instantiate_module ) {
			$this->set_checklist_module();
		}

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
	private function get_adapter_mock( $adapter_key, $methods_map ) {
		$classes = [
			self::WORDPRESS_ID => Wordpress_Adapter::class,
			self::KIT_ID => Kit_Adapter::class,
			self::ELEMENTOR_COUNTER_ID => Elementor_Counter::class,
		];

		$class = $classes[ $adapter_key ];

		$adapter_mock = $this->getMockBuilder( $class )
			->setMethods( array_keys( $methods_map ) )
			->getMock();

		foreach ( $methods_map as $method => $return_value ) {
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

	protected function set_user_preference_switch( bool $state ) {
		if ( $this->user_meta_backup ) {
			$preferences = json_decode( $this->user_meta_backup, true );
			$preferences[ Checklist_Module::VISIBILITY_SWITCH_ID ] = $state ? 'yes' : '';
		} else {
			$preferences = [];
		}

		update_user_meta( get_current_user_id(), 'elementor_preferences', wp_json_encode( $preferences ) );

		return $this;
	}

	protected function toggle_popup( bool $state ) {
		$this->checklist_module->update_user_progress( [ Checklist_Module::LAST_OPENED_TIMESTAMP => ! $state ] );
	}

	protected function set_kit( $kit_key , $should_instantiate_module = true ) : Step_Test_Base {
		if ( in_array( $kit_key, [ self::CUSTOM_KIT, self::DEFAULT_KIT ] ) ) {
			$this->set_kit_adapter_mock( [ 'is_active_kit_default' => $kit_key === 'default' ], $should_instantiate_module );
		}

		return $this;
	}

	private function setup_data() {
		$this->user = wp_get_current_user();
		$this->checklist_progress_backup = get_option( Checklist_Module::DB_OPTION_KEY ) || '';
		$this->user_meta_backup = get_user_meta( get_current_user_id(), 'elementor_preferences', true ) || '';

		delete_option( Checklist_Module::DB_OPTION_KEY );
		delete_user_meta( $this->user->ID, 'elementor_preferences' );

		return $this;
	}

	private function reset_data() {
		if ( ! empty( $this->checklist_progress_backup ) ) {
			update_option( Checklist_Module::DB_OPTION_KEY, $this->checklist_progress_backup );
		}

		if ( ! empty( $this->user_meta_backup ) ) {
			update_user_meta( $this->user->ID, 'elementor_preferences', $this->user_meta_backup );
		}

		$this->checklist_progress_backup = null;
		$this->user_meta_backup = null;

		return $this;
	}
}
