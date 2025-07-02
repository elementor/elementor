<?php

namespace Elementor\Core\Elements\Concerns;

use Elementor\Core\Elements\Atomic_Element;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Atomic_Element
 */
trait Has_Editor_Settings {
	private function parse_editor_settings( array $data ): array {
		$editor_data = [];

		if ( isset( $data['title'] ) && is_string( $data['title'] ) ) {
			$editor_data['title'] = sanitize_text_field( $data['title'] );
		}

		return $editor_data;
	}
}
