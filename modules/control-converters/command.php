<?php

namespace Elementor\Modules\ControlConverters;

interface Command {
	public function execute( $element );
}
