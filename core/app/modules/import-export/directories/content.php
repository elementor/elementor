<?php

namespace Elementor\Core\App\Modules\ImportExport\Directories;

use Elementor\Modules\LandingPages\Module as Landing_Pages_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Content extends Base {

	protected function get_name() {
		return 'content';
	}

	protected function get_default_sub_directories() {
		$post_types = [ 'page', 'post', Landing_Pages_Module::CPT ];

		$sub_directories = [];

		foreach ( $post_types as $post_type ) {
			$sub_directories[] = new Post_Type( $this->iterator, $this, $post_type );
		}

		return $sub_directories;
	}
}
