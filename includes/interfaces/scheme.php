<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

interface Scheme_Interface {
	public static function get_type();

	public function get_title();

	public function get_disabled_title();

	public function get_scheme_titles();

	public function get_default_scheme();

	public function print_template_content();
}
