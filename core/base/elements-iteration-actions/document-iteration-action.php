<?php
namespace Elementor\Core\Base\Elements_Iteration_Actions;

use Elementor\Element_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Document_Iteration_Action {
	protected $document;

	protected $mode;

	abstract public function is_action_needed();

	public function unique_element_action( Element_Base $element_data ) {}

	public function element_action( Element_Base $element_data ) {}

	public function after_elements_iteration() {}

	public function set_mode( $mode ) {
		$this->mode = $mode;
	}

	public function __construct( $document ) {
		$this->document = $document;
	}
}
