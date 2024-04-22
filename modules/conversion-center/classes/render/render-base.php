<?php

namespace Elementor\Modules\ConversionCenter\Classes\Render;

use Elementor\Modules\ConversionCenter\Widgets\Link_In_Bio;

/**
 * Class Render_Base.
 *
 * This is the base class that will hold shared functionality that will be needed by all the various widget versions.
 *
 * @since 3.23.0
 */
abstract class Render_Base {

	protected Link_In_Bio $widget;

	protected array $settings;

	public function __construct( Link_In_Bio $widget ) {
		$this->widget   = $widget;
		$this->settings = $widget->get_settings_for_display();
	}

	abstract public function render(): void;
}
