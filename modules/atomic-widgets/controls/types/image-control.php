<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Image_Control extends Atomic_Control_Base {

	private array $sizes = [];

	public function get_type(): string {
		return 'image';
	}

	public function set_sizes( array $sizes ): self {
		$this->sizes = $sizes;

		return $this;
	}

	public function get_props(): array {
		return [
			'sizes' => $this->sizes,
		];
	}
}
