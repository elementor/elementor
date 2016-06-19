<?php
namespace Elementor\Templates;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Type_Base {

	abstract public function get_id();
	abstract public function get_title();
	abstract public function register_data();
	abstract public function get_items();

	public function __construct() {
		$this->register_data();
	}
}
