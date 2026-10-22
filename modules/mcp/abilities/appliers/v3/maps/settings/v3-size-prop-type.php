<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Size limited to the units the V3 slider control accepts. The V4 size prop type only checks
 * that the unit is a known CSS unit, and advertises all of them.
 */
class V3_Size_Prop_Type extends Size_Prop_Type {

	public function units( $units = 'all' ): self {
		parent::units( $units );

		$shape = $this->get_shape();
		$shape['unit'] = String_Prop_Type::make()->enum( $this->get_settings()['available_units'] )->required();

		return $this->set_shape( $shape );
	}

	protected function validate_value( $value ): bool {
		return parent::validate_value( $value )
			&& in_array( $value['unit'], $this->get_settings()['available_units'], true );
	}
}
