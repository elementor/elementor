<?php

namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Email_Advanced_Settings_Control extends Atomic_Control_Base {
	private ?string $label = null;

	public function get_type(): string {
		return 'email-advanced-settings';
	}

	public function set_label( string $label ): self {
		$this->label = $label;

		return $this;
	}

	public function get_props(): array {
		return [
			'label' => $this->label,
		];
	}
}
