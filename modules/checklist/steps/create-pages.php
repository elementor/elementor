<?php

namespace Elementor\Modules\Checklist\Steps;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Create_Pages extends Step_Base {
	public function get_completion_absolute_status() : bool {
		$pages = $this->wordpress_adapter->get_pages( [
			'meta_key' => '_elementor_version',
			'number' => 3,
		] );

		return count( $pages ) >= 3;
	}
}
