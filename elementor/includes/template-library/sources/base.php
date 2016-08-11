<?php
namespace Elementor\TemplateLibrary;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Source_Base {

	abstract public function get_id();
	abstract public function get_title();
	abstract public function register_data();
	abstract public function get_items();
	abstract public function get_item( $item_id );
	abstract public function get_content( $item_id );
	abstract public function delete_template( $item_id );
	abstract public function save_item( $template_data );

	public function export_template( $item_id ) {}


	public function __construct() {
		$this->register_data();
	}
}
