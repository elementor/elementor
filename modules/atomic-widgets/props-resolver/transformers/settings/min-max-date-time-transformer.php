<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

const INVALID_DATE = 'Invalid Date';

class Min_Max_Date_Time_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ) {

		if ( empty( $value ) ) {
			return null;
		}

		$result = [];

		if ( isset( $value['min'] ) ) {
			$result['min'] = $value['min'] !== INVALID_DATE ? $value['min'] : '';
		}

		if ( isset( $value['max'] ) ) {
			$result['max'] = $value['max'] !== INVALID_DATE ? $value['max'] : '';
		}

		return $result;
	}
}
