<?php
namespace Elementor\Core\Settings\Base;

use Elementor\Controls_Stack;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Model extends Controls_Stack {

	public abstract function get_css_wrapper_selector();

	public abstract function get_panel_page_settings();
}
