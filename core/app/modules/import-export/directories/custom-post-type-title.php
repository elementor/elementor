<?php

namespace Elementor\Core\App\Modules\ImportExport\Directories;

use Elementor\Core\App\Modules\ImportExport\Iterator;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Adds CPT name and label values to manifest.json.
 *
 * @since 3.6.0
 */

class Custom_Post_Type_Title extends Base {

	public $custom_post_types;

	public function __construct( Iterator $iterator, Base $parent, $custom_post_types ) {
		$this->custom_post_types = $custom_post_types;

		parent::__construct( $iterator, $parent );
	}

	protected function get_name() {
		return 'custom-post-type-title';
	}

	protected function get_default_sub_directories() {

		$post_types = get_post_types( [
			'public' => true,
			'can_export' => true,
		] );

		foreach ( $post_types as $post_type ) {
			if ( ! in_array( $post_type, $this->custom_post_types ) ) {
				unset( $post_types[ $post_type ] );
			}
		}

		$sub_directories = [];

		foreach ( $post_types as $post_type ) {
			$sub_directories[] = new WP_Custom_Post_Type_Title( $this->iterator, $this, $post_type );
		}

		return $sub_directories;
	}
}
