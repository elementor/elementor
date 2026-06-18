<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Base for converters that accumulate one field/side into a shared aggregate prop in the context
 * (Object_Field_Merge_Converter, Object_Side_Merge_Converter). Subclasses MUST override
 * convert_null() — the default "set prop to null" behaviour is wrong for merge converters because
 * it bypasses the aggregate and emits a standalone null prop instead of merging null into the object.
 */
abstract class Object_Merge_Converter_Base extends Property_Converter_Base {
	protected function convert_null( Conversion_Context $context, array $rule ): bool {
		throw new \LogicException(
			static::class . '::convert_null() must be overridden — merge converters cannot use the default null behaviour.'
		);
	}
}
