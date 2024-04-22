<?php

namespace Elementor\Modules\ConversionCenter\Classes\Render;

use Elementor\Modules\ConversionCenter\Widgets\Contact_Buttons;

/**
 * Class Contact_Buttons_Render_Base.
 *
 * This is the base class that will hold shared functionality that will be needed by all the various widget versions.
 *
 * @since 3.23.0
 */
abstract class Contact_Buttons_Render_Base {

	protected Contact_Buttons $widget;

	protected array $settings;

	public function __construct( Contact_Buttons $widget ) {
		$this->widget   = $widget;
		$this->settings = $widget->get_settings_for_display();
	}

	abstract public function render(): void;
}
