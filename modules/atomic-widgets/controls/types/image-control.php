<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;
use Elementor\Modules\AtomicWidgets\Utils\Image\Image_Sizes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Control extends Atomic_Control_Base {
	private ?array $promotion = null;

	public function get_type(): string {
		return 'image';
	}

	public function set_promotion( array $promotion ): self {
		$this->promotion = $promotion;

		return $this;
	}

	public function get_props(): array {
		$props = [
			'sizes' => Image_Sizes::get_all(),
		];

		if ( null !== $this->promotion ) {
			$props['promotion'] = $this->promotion;
		}

		return $props;
	}
}
