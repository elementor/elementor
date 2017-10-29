<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Skins_Manager {

	private $_skins = [];

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function add_skin( Widget_Base $widget, Skin_Base $skin ) {
		$widget_name = $widget->get_name();

		if ( ! isset( $this->_skins[ $widget_name ] ) ) {
			$this->_skins[ $widget_name ] = [];
		}

		$this->_skins[ $widget_name ][ $skin->get_id() ] = $skin;

		return true;
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function remove_skin( Widget_Base $widget, $skin_id ) {
		$widget_name = $widget->get_name();

		if ( ! isset( $this->_skins[ $widget_name ][ $skin_id ] ) ) {
			return new \WP_Error( 'Cannot remove not-exists skin.' );
		}

		unset( $this->_skins[ $widget_name ][ $skin_id ] );

		return true;
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function get_skins( Widget_Base $widget ) {
		$widget_name = $widget->get_name();

		if ( ! isset( $this->_skins[ $widget_name ] ) ) {
			return false;
		}

		return $this->_skins[ $widget_name ];
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function __construct() {
		require ELEMENTOR_PATH . 'includes/base/skin-base.php';
	}
}
