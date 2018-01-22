<?php
namespace Elementor\Modules\Library\Documents;

use Elementor\Core\Base\Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Library_Document extends Document {

	const TYPE_META_KEY = '_elementor_template_type';
	const TAXONOMY_TYPE_SLUG = 'elementor_library_type';

	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['show_in_library'] = true;
		$properties['library_view'] = 'grid';

		return $properties;
	}

	public function save_type() {
		update_post_meta( $this->post->ID, self::TYPE_META_KEY, $this->get_name() );

		wp_set_object_terms( $this->post->ID, $this->get_name(), self::TAXONOMY_TYPE_SLUG );
	}
}
