<?php

namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Svg_Control extends Atomic_Control_Base {
	private bool $show_icon_library = false;

	public function get_type(): string {
		return 'svg-media';
	}

	public function set_show_icon_library( bool $show_icon_library ): self {
		$this->show_icon_library = $show_icon_library;

		return $this;
	}

	public function get_props(): array {
		return [
			'type' => $this->get_type(),
			'showIconLibrary' => $this->show_icon_library,
		];
	}
}
