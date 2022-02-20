<?php

namespace Elementor\Core\App\Modules\ImportExport\Directories;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Adds CPT name and label values to manifest.json.
 *
 * @since 3.6.1
 */

class Custom_Post_Type_Title extends Base {

	protected function get_name() {
		return 'custom-post-type-title';
	}

	/**
	 * @since 3.6.1
	 *
	 * @return array
	 */
	protected function get_default_sub_directories() {
		$export_settings = json_decode( stripslashes( $_POST['data'] ), true );

		$custom_post_types = $export_settings['selectedCustomPostTypes'];

		$post_types = get_post_types( [
			'public' => true,
			'can_export' => true,
		] );

		foreach ($post_types as $post_type) {
			if(! in_array( $post_type, $custom_post_types ) ) {
				unset( $post_types[$post_type] );
			}
		}

		$sub_directories = [];

		foreach ( $post_types as $post_type ) {
			$sub_directories[] = new WP_Custom_Post_Type_Title( $this->iterator, $this, $post_type );
		}

		return $sub_directories;
	}
}
