<?php

namespace Elementor\Core\Kits\Documents\Tabs;

use Elementor\Controls_Manager;
use Elementor\Core\Kits\Documents\Kit;
use Elementor\Sub_Controls_Stack;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Tab_Base extends Sub_Controls_Stack {
	/**
	 * @var Kit
	 */
	protected $parent;

	abstract protected function register_tab_controls();

	public function register_controls() {
		$this->register_tab();

		$this->register_tab_controls();
	}

	public function on_save( $data ) {}

	protected function register_tab() {
		Controls_Manager::add_tab( $this->get_id(), $this->get_title() );
	}
}
