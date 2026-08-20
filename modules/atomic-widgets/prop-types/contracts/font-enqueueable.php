<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Contracts;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

interface Font_Enqueueable {
	public function get_enqueue_font_family( $stored_value ): ?string;
}
