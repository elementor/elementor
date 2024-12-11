<?php

namespace Elementor\Modules\AtomicWidgets\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

interface Atomic_Widget_Linkable {
	public function get_link_template( array $settings ): string;
}
