<?php

namespace Elementor\Core\App\Modules\ImportExport\Directories;

use Elementor\Modules\LandingPages\Module as Landing_Pages_Module;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class WP_Content extends Base {

	protected function get_name() {
		return 'wp-content';
	}

	protected function get_default_sub_directories() {
		$export_settings = json_decode( stripslashes( $_POST['data'] ), true );

		$native_post_types = [ 'page', 'post' ];
		$custom_post_types = $export_settings['selectedCustomPostTypes'];
		$post_types_to_export = array_merge( $native_post_types, $custom_post_types );
		$post_types = get_post_types( [
			'public' => true,
			'can_export' => true,
		] );

		foreach ( $post_types as $post_type ) {
			if ( ! in_array( $post_type, $post_types_to_export ) ) {
				unset( $post_types[ $post_type ] );
			}
		}

		$sub_directories = [];

		foreach ( $post_types as $post_type ) {
			$sub_directories[] = new WP_Post_Type( $this->iterator, $this, $post_type );
		}

		return $sub_directories;
	}
}
