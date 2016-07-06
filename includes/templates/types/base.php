<?php
namespace Elementor\Templates;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Type_Base {

	abstract public function get_id();
	abstract public function get_title();
	abstract public function register_data();
	abstract public function get_items();
	abstract public function get_item( $item_id );
	abstract public function get_template( $item_id );
	abstract public function delete_template( $item_id );

	/**
	 * @param array  $template_data
	 * @param string $template_title
	 *
	 * @return int|\WP_Error
	 */
	abstract public function save_item( $template_data = [], $template_title = '' );

	public function __construct() {
		$this->register_data();
	}
}
