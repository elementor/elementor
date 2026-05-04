<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Time_Range_Transformer extends Transformer_Base {
	const INVALID_DATE = 'Invalid Date';

	public function transform( $value, Props_Resolver_Context $context ) {

		if ( empty( $value ) ) {
			return null;
		}

		$result = [];

		if ( isset( $value['min'] ) ) {
			$result['min'] = self::INVALID_DATE !== $value['min'] ? $value['min'] : '';
		}

		if ( isset( $value['max'] ) ) {
			$result['max'] = self::INVALID_DATE !== $value['max'] ? $value['max'] : '';
		}

		return $result;
	}
}
