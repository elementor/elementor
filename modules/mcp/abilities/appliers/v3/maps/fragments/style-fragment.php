<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Style_Fragment {

	public function apply_to( Style_Target $target ): void;
}
