<?php
namespace Elementor\Modules\Components\Documents;

use Elementor\Core\Base\Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Component extends Document {

	public static $TYPE = 'elementor_component';

	public static function get_properties() {
		$properties = parent::get_properties();
		$properties['cpt'] = [ self::$TYPE ];
		$properties['has_elements'] = true;
		$properties['is_editable'] = true;

		return $properties;
	}


	public static function get_type() {
		return self::$TYPE;
	}

	public static function get_title() {
		return esc_html__( 'Component', 'elementor' );
	}

	public static function get_plural_title() {
		return esc_html__( 'Components', 'elementor' );
	}
    
}
