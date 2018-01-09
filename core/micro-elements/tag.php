<?php
namespace Elementor\Core\MicroElements;

use Elementor\Controls_Stack;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Tag extends Controls_Stack {

	public static function get_type() {
		return 'tag';
	}

	abstract public function get_groups();

	abstract public function get_title();

	abstract public function get_content();

	protected function _get_initial_config() {
		$config = parent::_get_initial_config();

		$config['render_type'] = 'plain';

		return $config;
	}

	public function get_unique_name() {
		return 'tag-' . $this->get_name();
	}

	public function get_mention_template() {
		return '';
	}

	final protected function init_controls() {
		Plugin::$instance->controls_manager->open_stack( $this );

		$this->start_controls_section( 'settings', [
			'label' => __( 'Settings', 'elementor' ),
		] );

		$this->_register_controls();

		$this->end_controls_section();
	}
}
