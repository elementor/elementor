<?php

namespace Elementor\Core\App\Modules\ImportExport\Directories;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Content extends Base {

	protected function get_name() {
		return 'content';
	}

	protected function get_default_sub_directories() {
		$post_types = $this->iterator->get_settings( 'post_types' );

		if ( ! $post_types ) {
			return [];
		}

		$sub_directories = [];

		foreach( $post_types as $post_type ) {
			$sub_directories[] = new Post_Type( $this->iterator, $this, $post_type );
		}

		return $sub_directories;
	}
}
