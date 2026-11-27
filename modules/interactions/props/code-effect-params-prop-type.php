<?php

namespace Elementor\Modules\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Code_Effect_Params_Prop_Type extends Array_Prop_Type {
	const MAX_PARAMS = 10;

	public static function get_key(): string {
		return 'code-effect-params';
	}

	protected function define_item_type(): Prop_Type {
		return Code_Effect_Param_Prop_Type::make();
	}

	protected function validate_value( $value ): bool {
		if ( ! parent::validate_value( $value ) || count( $value ) > self::MAX_PARAMS ) {
			return false;
		}

		$keys = array_map( fn( $param ) => $param['value']['key']['value'], $value );

		return count( $keys ) === count( array_unique( $keys ) );
	}
}
