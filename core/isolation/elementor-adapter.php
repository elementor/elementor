<?php

namespace Elementor\Core\Isolation;

use Elementor\Plugin;
use Elementor\Modules\ElementorCounter\Module as Elementor_Counter_Module;

class Elementor_Adapter implements Elementor_Adapter_Interface {
	public function get_template_type( $template_id ): string {
		return Plugin::$instance->documents->get( $template_id )->get_template_type();
	}
}
