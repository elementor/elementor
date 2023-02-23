<?php

namespace PlatformKitPublisher\Modules\TemplatesLibrary;

use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Base extends Widget_Base {

	public function enqueue_widget_script() {

	}
}

