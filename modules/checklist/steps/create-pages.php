<?php

namespace Elementor\Modules\Checklist\Steps;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Create_Pages extends Step_Base {
	public function is_completed() : bool {
		$pages = get_pages( [
			'meta_key' => '_elementor_version',
			'number' => 3,
		] );

		return parent::is_completed() || count( $pages ) >= 3;
	}
}
