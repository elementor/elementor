<?php

namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Email_Control extends Atomic_Control_Base {
	public function get_type(): string {
		return 'email';
	}

	public function get_props(): array {
		return [];
	}
}
