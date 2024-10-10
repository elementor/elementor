<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

interface Transformer {
	public function transform( $value );
}
