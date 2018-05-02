<?php
namespace Elementor\Core\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor module.
 *
 * An abstract class that provides the needed properties and methods to
 * manage and handle modules in inheriting classes.
 *
 * @since 1.7.0
 * @abstract
 */
abstract class Module {

	/**
	 * Module class reflection.
	 *
	 * Holds the information about a class.
	 *
	 * @since 1.7.0
	 * @access private
	 *
	 * @var \ReflectionClass
	 */
	private $reflection;

	/**
	 * Module components.
	 *
	 * Holds the module components.
	 *
	 * @since 1.7.0
	 * @access private
	 *
	 * @var array
	 */
	private $components = [];

	/**
	 * Module instance.
	 *
	 * Holds the module instance.
	 *
	 * @since 1.7.0
	 * @access protected
	 *
	 * @var Module
	 */
	protected static $_instances = [];

	/**
	 * Get module name.
	 *
	 * Retrieve the module name.
	 *
	 * @since 1.7.0
	 * @access public
	 * @abstract
	 *
	 * @return string Module name.
	 */
	abstract public function get_name();

	/**
	 * Instance.
	 *
	 * Ensures only one instance of the module class is loaded or can be loaded.
	 *
	 * @since 1.7.0
	 * @access public
	 * @static
	 *
	 * @return Module An instance of the class.
	 */
	public static function instance() {
		if ( empty( static::$_instances[ static::class_name() ] ) ) {
			static::$_instances[ static::class_name() ] = new static();
		}

		return static::$_instances[ static::class_name() ];
	}

	/**
	 * @since 2.0.0
	 * @access public
	 * @static
	 */
	public static function is_active() {
		return true;
	}

	/**
	 * Class name.
	 *
	 * Retrieve the name of the class.
	 *
	 * @since 1.7.0
	 * @access public
	 * @static
	 */
	public static function class_name() {
		return get_called_class();
	}

	/**
	 * Clone.
	 *
	 * Disable class cloning and throw an error on object clone.
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object. Therefore, we don't want the object to be cloned.
	 *
	 * @since 1.7.0
	 * @access public
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Something went wrong.', 'elementor' ), '1.0.0' );
	}

	/**
	 * Wakeup.
	 *
	 * Disable unserializing of the class.
	 *
	 * @since 1.7.0
	 * @access public
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Something went wrong.', 'elementor' ), '1.0.0' );
	}

	/**
	 * @since 2.0.0
	 * @access public
	 */
	public function get_reflection() {
		if ( null === $this->reflection ) {
			$this->reflection = new \ReflectionClass( $this );
		}

		return $this->reflection;
	}

	/**
	 * Add module component.
	 *
	 * Add new component to the current module.
	 *
	 * @since 1.7.0
	 * @access public
	 *
	 * @param string $id       Component ID.
	 * @param mixed  $instance An instance of the component.
	 */
	public function add_component( $id, $instance ) {
		$this->components[ $id ] = $instance;
	}

	/**
	 * Get module component.
	 *
	 * Retrieve the module component.
	 *
	 * @since 1.7.0
	 * @access public
	 *
	 * @param string $id Component ID.
	 *
	 * @return mixed An instance of the component, or `false` if the component
	 *               doesn't exist.
	 */
	public function get_component( $id ) {
		if ( isset( $this->components[ $id ] ) ) {
			return $this->components[ $id ];
		}

		return false;
	}
}
