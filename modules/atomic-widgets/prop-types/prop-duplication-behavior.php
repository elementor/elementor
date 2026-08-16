<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Prop_Duplication_Behavior {
	const META_KEY = 'duplicate_behavior';
	const CLEAR = 'clear';

	/**
	 * Return a tuple that marks a prop to be cleared when its element is duplicated,
	 * using `Prop_Type::meta()`, e.g. `String_Prop_Type::make()->meta( Prop_Duplication_Behavior::clear() )`.
	 */
	public static function clear(): array {
		return [ self::META_KEY, self::CLEAR ];
	}
}
