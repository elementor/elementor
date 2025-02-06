<?php

namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;
use Elementor\Modules\AtomicWidgets\Image_Sizes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Svg_Control extends Atomic_Control_Base {
	public function get_type(): string {
		return 'svg';
	}

	public function get_props(): array {
		return [
			'type' => $this->get_type(),
			'sizes' => Image_Sizes::get_all(),
			'src' => [
				'id' => [
					'$$type' => 'image-attachment-id',
					'value' => null,
				],
				'url' => [
					'$$type' => 'image-url',
					'value' => null,
				],
			],
		];
	}
}
