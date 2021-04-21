<?php
namespace Elementor\Core\Base\Elements_Iteration_Actions;

use Elementor\Element_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Document_Iteration_Action {
	protected $document;

	abstract public function is_update_needed();

	public function update_unique_widget( Element_Base $element_data ) {}

	public function update_element( Element_Base $element_data ) {}

	public function after_elements_iteration( $event ) {}

	public function __construct( $document ) {
		$this->document = $document;
	}
}
