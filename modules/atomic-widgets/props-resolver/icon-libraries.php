<?php
namespace Elementor\Modules\AtomicWidgets\PropsResolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Icon_Libraries {
	public static function get_custom_libraries( array $options = [] ): array {
		$libraries = apply_filters( 'elementor/atomic-widgets/icon/custom-libraries', [], $options );

		return is_array( $libraries ) ? $libraries : [];
	}

	public static function resolve_library_values( string $library ): array {
		$default = [
			'values' => [],
			'truncated' => false,
			'total' => 0,
		];

		$result = apply_filters( 'elementor/atomic-widgets/icon/library-values', $default, $library );

		return is_array( $result ) ? array_merge( $default, $result ) : $default;
	}

	public static function is_renderable_value( string $library, string $value ): bool {
		return (bool) apply_filters( 'elementor/atomic-widgets/icon/is-renderable', false, $library, $value );
	}
}
