<?php

namespace Elementor\Modules\Variables\StyleSchemas;

use Elementor\Modules\Variables\Base\Style_Schema;
use ElementorPro\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;

if ( ! defined('ABSPATH')) {
	exit; // Exit if accessed directly
}

class Font_Style_Schema extends Style_Schema {
	public function augment( array $schema ): array {
		$schema[ 'font-family' ] = Union_Prop_Type::create_from( $schema[ 'font-family' ] )
			->add_prop_type( Font_Variable_Prop_Type::make() );

		return $schema;
	}
}
