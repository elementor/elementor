<?php
namespace Elementor\Data\V2\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Processor {

	/**
	 * Controller.
	 *
	 * @var \Elementor\Data\V2\Base\Controller
	 */
	private $controller;

	/**
	 * Processor constructor.
	 *
	 * @param \Elementor\Data\V2\Base\Controller $controller
	 */
	public function __construct( $controller ) {
		$this->controller = $controller;
	}

	/**
	 * Get processor command.
	 *
	 * @return string
	 */
	abstract public function get_command();
}
