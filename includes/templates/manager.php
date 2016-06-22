<?php
namespace Elementor\Templates;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Manager {

	/**
	 * @var Type_Base[]
	 */
	protected $_registered_types = [];

	public function init() {
		include( ELEMENTOR_PATH . 'includes/templates/types/base.php' );

		$types = [
			'local',
		];

		foreach ( $types as $types_filename ) {
			include( ELEMENTOR_PATH . 'includes/templates/types/' . $types_filename . '.php' );

			$class_name = ucwords( $types_filename );
			$class_name = str_replace( '-', '_', $class_name );

			$this->register_type( __NAMESPACE__ . '\Type_' . $class_name );
		}
	}

	public function register_type( $type_class, $args = [] ) {
		if ( ! class_exists( $type_class ) ) {
			return new \WP_Error( 'type_class_name_not_exists' );
		}

		$type_instance = new $type_class( $args );

		if ( ! $type_instance instanceof Type_Base ) {
			return new \WP_Error( 'wrong_instance_type' );
		}
		$this->_registered_types[ $type_instance->get_id() ] = $type_instance;

		return true;
	}

	public function unregister_type( $id ) {
		if ( ! isset( $this->_registered_types[ $id ] ) ) {
			return false;
		}
		unset( $this->_registered_types[ $id ] );
		return true;
	}

	public function __construct() {
		add_action( 'init', [ $this, 'init' ] );
	}
}
