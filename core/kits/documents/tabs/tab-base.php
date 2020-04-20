<?php

namespace Elementor\Core\Kits\Documents\Tabs;

use Elementor\Controls_Manager;
use Elementor\Core\Base\Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Tab_Base {
	/**
	 * @var Document
	 */
	protected $document;

	abstract protected function get_id();
	abstract protected function get_title();
	abstract protected function register_tab_controls();

	/**
	 * Lightbox constructor.
	 *
	 * @param Document $document
	 */
	public function __construct( $document ) {
		$this->document = $document;
	}

	public function add_control( $id, $args, $options = [] ) {
		$this->document->add_control( $id, $args, $options );
	}

	public function start_controls_section( $id, $args = [] ) {
		$this->document->start_controls_section( $id, $args );
	}

	public function end_controls_section() {
		$this->document->end_controls_section();
	}

	public function register_controls() {
		$this->register_tab();

		$this->register_tab_controls();
	}

	protected function register_tab() {
		Controls_Manager::add_tab( $this->get_id(), $this->get_title() );
	}
}
