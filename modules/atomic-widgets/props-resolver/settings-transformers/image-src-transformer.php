<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\SettingsTransformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Src_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Src_Transformer extends Transformer_Base {
	public function get_type(): string {
		return Image_Src_Prop_Type::get_key();
	}

	public function transform( $value ) {
		return [
			'id' => isset( $value['id'] ) ? (int) $value['id'] : null,
			'url' => isset( $value['url'] ) ? esc_url( $value['url'] ) : null,
		];
	}
}
