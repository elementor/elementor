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
	abstract public function render( Link_In_Bio $widget ): void;
}
