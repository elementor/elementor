<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Plain_Prop_Type extends Prop_Type {
	public static function get_type(): string {
		return 'plain';
	}

	protected function validate_self( $value ): bool {
		return parent::validate_self( $value )
			&& $this->validate_value( $value['value'] );
	}

	abstract protected function validate_value( $value ): bool;
}
