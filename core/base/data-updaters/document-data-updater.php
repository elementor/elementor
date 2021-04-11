<?php
namespace Elementor\Core\Base\Data_Updaters;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Document_Data_Updater {
	protected $document;

	abstract public function is_update_needed();

	public function update_unique_widget( object $element_data ) {}

	public function update_element( object $element_data ) {}

	public function __construct( $document ) {
		$this->document = $document;
	}
}
