<?php

namespace Elementor\Modules\FloatingBars\Classes\Render;

use Elementor\Modules\FloatingBars\Base\Widget_Floating_Bars_Base;

/**
 * Class Floating_Bars_Render_Base.
 *
 * This is the base class that will hold shared functionality that will be needed by all the various widget versions.
 *
 * @since 3.23.0
 */
abstract class Floating_Bars_Render_Base {

	protected Widget_Floating_Bars_Base $widget;

	protected array $settings;

	abstract public function render(): void;

	public function __construct( Widget_Floating_Bars_Base $widget ) {
		$this->widget = $widget;
		$this->settings = $widget->get_settings_for_display();
	}

	protected function build_layout_render_attribute(): void {
		$layout_classnames = 'e-floating-bars e-' . $this->widget->get_name();
		$content_alignment = $this->settings['style_floating_bar_elements_align'];

		$layout_classnames .= ' has-content-alignment-' . $content_alignment;
		
		$this->add_layout_render_attribute( $layout_classnames );
	}
}