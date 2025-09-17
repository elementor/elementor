<?php

namespace Elementor\Modules\AtomicWidgets\Elements;

class Element_Builder {
	protected $element_type;
	protected $settings;
	protected $is_locked;

	public static function make( $element_type ) {
		return new self( $element_type );
	}

	private function __construct( $element_type ) {
		$this->element_type = $element_type;
	}

	public function settings( array $settings ) {
		$this->settings = $settings;
		return $this;
	}

	public function is_locked( $is_locked ) {
		$this->is_locked = $is_locked;
		return $this;
	}

	public function build() {
		return [
			'elType' => $this->element_type,
			'settings' => $this->settings,
			'isLocked' => $this->is_locked,
		];
	}
}
