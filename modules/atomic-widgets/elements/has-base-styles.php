<?php

namespace Elementor\Modules\AtomicWidgets\Elements;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Has_Atomic_Base
 */
trait Has_Base_Styles {
	public function get_base_styles() {
		$base_styles = $this->define_base_styles();
		$style_definitions = [];

		foreach ( $base_styles as $key => $style ) {
			$id = static::get_element_type() . '-' . $key;

			$style_definitions[ $key ] = $style->build( $id );
		}

		return $style_definitions;
	}

	public function get_base_styles_dictionary() {
		$result = [];

		foreach ( $this->get_base_styles() as $key => $style ) {
			$result[ $key ] = $style['id'];
		}

		return $result;
	}

	/**
	 * @return array<string, Style_Definition>
	 */
	protected function define_base_styles(): array {
		return [];
	}
}
