<?php
namespace Elementor\Modules\Components\Utils;

use Elementor\Plugin;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Utils\Utils;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Format_Component_Elements_Id {
	public static function format( array $elements, array $path ) {
		return array_map( function( $element ) use ( $path ) {
			$nesting_path = [ ...$path, $element['id'] ];

			$element['id'] = self::hash_string( implode( '_', $nesting_path ), 7 );
			$element['elements'] = self::format( $element['elements'], $nesting_path );

			return $element;
		}, $elements );
	}

	// This is a copy of the hashString function in ts utils package.
	// It's important to keep it in synced with the ts implementation
	// to make component inner elements ids consistent between the editor and the frontend.
	public static function hash_string( string $str, ?int $length ): string {
		$hash_basis = 5381;

		$i = strlen( $str );
		while ( $i > 0 ) {
			--$i;
			$hash_basis = ( $hash_basis * 33 ) ^ ord( $str[ $i ] );
			// Keep hash within 32-bit range to match JavaScript bitwise operations.
			$hash_basis = $hash_basis & 0xFFFFFFFF;
		}

		$result = base_convert( (string) $hash_basis, 10, 36 );

		if ( ! isset( $length ) ) {
			return $result;
		}

		$sliced = substr( $result, -$length );
		return str_pad( $sliced, $length, '0', STR_PAD_LEFT );
	}
}
