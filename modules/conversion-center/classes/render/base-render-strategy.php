<?php

namespace Elementor\Modules\ConversionCenter\Classes\Render;

use Elementor\Modules\ConversionCenter\Widgets\Link_In_Bio;

abstract class Base_Render_Strategy {
	abstract public function render( Link_In_Bio $widget );
}
