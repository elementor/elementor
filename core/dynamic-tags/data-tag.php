<?php
namespace Elementor\Core\DynamicTags;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Data_Tag extends Base_Tag {

	abstract protected function get_value( array $options = [] );

	final public function get_content_type() {
		return 'plain';
	}

	public function get_content( array $options = [] ) {
		return $this->get_value( $options );
	}
}
