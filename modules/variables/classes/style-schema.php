<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\Transformers\Global_Variable as Global_Variable_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers_Registry;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Style_Schema {
	public function append_to( Transformers_Registry $transformers ) {
		$transformers->register( Color_Variable_Prop_Type::get_key(), new Global_Variable_Transformer() );

		return $this;
	}
}
