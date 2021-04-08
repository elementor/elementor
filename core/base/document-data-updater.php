<?php
namespace Elementor\Core\Base;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Document_Data_Updater {
	protected $post_id;

	protected $document;

	public function update_unique_widget( array $element_data ) {}

	public function update_element( array $element_data ) {}

	public function is_update_needed() {
		return false;
	}

	public function get_document() {
		if ( $this->document ) {
			return $this->document;
		}

		$this->document = Plugin::instance()->documents->get( $this->post_id );

		return $this->document;
	}

	public function __construct( $post_id ) {
		$this->post_id = $post_id;
	}
}
