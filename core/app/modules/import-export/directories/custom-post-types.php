<?php

namespace Elementor\Core\App\Modules\ImportExport\Directories;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Custom_Post_Types extends Base {

	protected function get_name() {
		return 'custom-post-types';
	}

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
			$sub_directories[] = new WP_Custom_Post_Types( $this->iterator, $this, $post_type );
		}

		return $sub_directories;
	}
}
