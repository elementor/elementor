<?php

namespace Elementor\Modules\AtomicWidgets\Elements;

class Widget_Builder {
	protected $widget_type;
	protected $settings = [];
	protected $is_locked = false;

	public static function make( string $widget_type ) {
		return new self( $widget_type );
	}

	private function __construct( string $widget_type ) {
		$this->widget_type = $widget_type;
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
			'elType' => 'widget',
			'widgetType' => $this->widget_type,
			'settings' => $this->settings,
			'isLocked' => $this->is_locked,
		];
	}
}
