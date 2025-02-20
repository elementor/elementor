<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Background_Image_Overlay_Transformer extends Transformer_Base {
	const DEFAULT_POSITION = '0% 0%';

	public function transform( $value, $key ) {
		if ( ! isset( $value['image'] ) ) {
			return '';
		}

		$image_url = $value['image']['src'];

		$background_style = "url(\" $image_url \")";

		if ( ! empty( $value['repeat'] ) ) {
			$background_style .= ' ' . $value['repeat'];
		}

		if ( ! empty( $value['attachment'] ) ) {
			$background_style .= ' ' . $value['attachment'];
		}

		$position_and_size_style = $this->get_position_and_size_style( $value );

		if ( ! empty( $position_and_size_style ) ) {
			$background_style .= ' ' . $position_and_size_style;
		}

		return $background_style;
	}

	private function get_position_and_size_style( array $value ): string {
		if ( ! isset( $value['size'] ) && ! isset( $value['position'] ) ) {
			return '';
		}

		if ( ! isset( $value['size'] ) ) {
			return $value['position'];
		}

		$position = $value['position'] ?? self::DEFAULT_POSITION;

		return $position . ' / ' . $value['size'];
	}
}
