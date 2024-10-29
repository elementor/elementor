<?php

namespace Elementor\Core\Isolation;

interface Elementor_Adapter_Interface {
	public function get_template_type( $template_id ) : string;
}
