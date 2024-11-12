<?php

namespace Elementor\Core\Isolation;

use Elementor\Plugin;
use Elementor\Modules\ElementorCounter\Module as Elementor_Counter_Module;
use Elementor\TemplateLibrary\Source_Local;

class Elementor_Adapter implements Elementor_Adapter_Interface {
	public function get_template_type( $template_id ): string {
		return Source_Local::get_template_type( $template_id );
	}
}
