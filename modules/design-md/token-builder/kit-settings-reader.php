<?php
namespace Elementor\Modules\DesignMd\TokenBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Kit_Settings_Reader {

	const DEFAULT_UNIT = 'px';
	const GLOBALS_KEY  = '__globals__';

	private const TYPOGRAPHY_STRING_PROPS = [
		'fontFamily' => 'font_family',
		'fontWeight' => 'font_weight',
	];

	private const TYPOGRAPHY_DIMENSION_PROPS = [
		'fontSize'      => 'font_size',
		'lineHeight'    => 'line_height',
		'letterSpacing' => 'letter_spacing',
	];

	public static function dimension_to_string( array $data, string $key, string $field = 'size' ): string {
		$value = $data[ $key ] ?? '';

		if ( is_array( $value ) ) {
			if ( empty( $value[ $field ] ) ) {
				return '';
			}
			$unit = $value['unit'] ?? self::DEFAULT_UNIT;

			return $value[ $field ] . $unit;
		}

		if ( '' === $value || null === $value ) {
			return '';
		}

		return (string) $value;
	}

	public static function resolve_global_reference( array $settings, string $key, string $kind ): string {
		$global = $settings[ self::GLOBALS_KEY ][ $key ] ?? '';

		if ( $global && preg_match( '/globals\/' . preg_quote( $kind, '/' ) . '\?id=(.+)/', $global, $matches ) ) {
			return '{' . $kind . '.' . $matches[1] . '}';
		}

		return '';
	}

	public static function resolve_color( array $settings, string $key ): string {
		$ref = self::resolve_global_reference( $settings, $key, 'colors' );

		if ( $ref ) {
			return $ref;
		}

		return (string) ( $settings[ $key ] ?? '' );
	}

	const TYPOGRAPHY_STARTER_SUFFIX = '_typography';

	public static function resolve_typography_reference( array $settings, string $key ): string {
		return self::resolve_global_reference( $settings, $key . self::TYPOGRAPHY_STARTER_SUFFIX, 'typography' );
	}

	public static function extract_typography_props( array $source, string $prefix ): array {
		$props = [];

		foreach ( self::TYPOGRAPHY_STRING_PROPS as $output_key => $suffix ) {
			$value = $source[ $prefix . $suffix ] ?? '';
			if ( $value ) {
				$props[ $output_key ] = $value;
			}
		}

		foreach ( self::TYPOGRAPHY_DIMENSION_PROPS as $output_key => $suffix ) {
			$value = self::dimension_to_string( $source, $prefix . $suffix );
			if ( $value ) {
				$props[ $output_key ] = $value;
			}
		}

		return $props;
	}
}
