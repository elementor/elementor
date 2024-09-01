<?php

namespace Elementor\Modules\AtomicWidgets\PropsHandler\SettingsTransformers;

use Elementor\Modules\AtomicWidgets\PropsHandler\Transformer;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Classes_Transformer implements Transformer {
	public function get_type(): string {
		// TODO: should be const from the prop type
		return 'classes';
	}

	public function transform( $value ) {
		if ( ! is_array( $value ) ) {
			return '';
		}

		return implode( ' ', array_filter( $value ) );
	}
}
