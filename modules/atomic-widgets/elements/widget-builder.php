<?php

namespace Elementor\Modules\AtomicWidgets\Elements;

class Widget_Builder extends Element_Builder {
	private $widget_type;

	public static function make( $widget_type ) {
		return new self( $widget_type );
	}

	private function __construct( $widget_type ) {
		$this->widget_type = $widget_type;
		$this->element_type = 'widget';
	}

	public function build() {
		return [
			'elType' => 'widget',
			'widgetType' => $this->widget_type,
			'elementType' => $this->element_type,
			'settings' => $this->settings,
			'isLocked' => $this->is_locked,
		];
	}
}
