<?php
namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\Image_Sizes;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class Svg_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'image';
	}

	protected function define_shape(): array {
		return [
			'src' => Image_Src_Prop_Type::make()->required(),
		];
	}

	public function default_icon(string $icon): self {
		$this->get_shape_field('src')->default('<i class="' . esc_attr($icon) . '"></i>');
		return $this;
	}
}
