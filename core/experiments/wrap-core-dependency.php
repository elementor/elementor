<?php
namespace Elementor\Core\Experiments;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Wrap_Core_Dependency {

	private $feature_data;

	public function __construct( $feature_data ) {
		$this->feature_data = $feature_data;
	}

	public function get_name() {
		return $this->feature_data['name'];
	}

	public static function instance( $feature_data ) {
		return new static( $feature_data );
	}
}
