<?php

namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Video_Control extends Atomic_Control_Base {
	public function get_type(): string {
		return 'video';
	}

	public function get_props(): array {
		return [];
	}
}
