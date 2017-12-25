<?php
namespace Elementor\Modules\Library\Documents;

use Elementor\Core\Base\Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Library_Document extends Document {

	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['show_in_library'] = true;
		$properties['library_view'] = 'grid';

		return $properties;
	}
}
