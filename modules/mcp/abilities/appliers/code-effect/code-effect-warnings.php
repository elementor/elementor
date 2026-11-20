<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\CodeEffect;

use Elementor\Modules\Interactions\Validators\Code_Effect_Value;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Heuristic, non-blocking checks: they nudge the agent toward the patterns in the motion guide.
 */
class Code_Effect_Warnings {
	const GUIDE_URI = 'elementor://interactions/motion-code-guide';
	const PATTERNS_URI = 'elementor://interactions/motion-patterns';

	const NON_COMPOSITOR_PROPERTY_PATTERN = '/["\']?\b(width|height|top|left|margin[A-Za-z]*|padding[A-Za-z]*|backgroundColor|color|boxShadow)\b["\']?\s*:/';
	const CLEANUP_API_PATTERN = '/\b(inView|hover|press|scroll|drag)\s*\(|repeat\s*:\s*Infinity/';
	const LOOP_OR_SCROLL_PATTERN = '/\bscroll\s*\(|repeat\s*:\s*Infinity/';
	const CONCISE_ARROW_PATTERN = '/^\s*(async\s+)?\(?[^)]*\)?\s*=>\s*[^{\s]/s';
	const RETURN_PATTERN = '/\breturn\b/';
	const GLOBAL_ACCESS_PATTERN = '/\b(document|window)\s*\./';
	const IMPORT_PATTERN = '/^\s*import\b|\bimport\s*\(/m';
	const REDUCED_MOTION_PATTERN = '/\breducedMotion\b/';

	public static function collect( array $interaction_item, callable $can_save_code ): array {
		$item_value = $interaction_item['value'] ?? [];
		$animation_value = $item_value['animation']['value'] ?? null;

		if ( ! is_array( $animation_value ) || ! Code_Effect_Value::is_code_effect( $animation_value ) ) {
			return [];
		}

		$code_effect = $animation_value['code_effect']['value'] ?? [];
		$code = (string) ( $code_effect['code']['value'] ?? '' );
		$warnings = $can_save_code() ? [] : [ self::stripped_on_save() ];

		return array_merge( $warnings, self::quality_warnings( $code, self::param_keys( $code_effect ) ) );
	}

	private static function stripped_on_save(): array {
		return [
			'code' => 'code_effect_stripped_on_save',
			'message' => 'Code effects need the unfiltered_html capability. This code effect will be removed when the document is saved; ask an administrator to add it.',
		];
	}

	private static function quality_warnings( string $code, array $param_keys ): array {
		$warnings = [];

		if ( preg_match( self::NON_COMPOSITOR_PROPERTY_PATTERN, $code ) ) {
			$warnings[] = self::warning( 'non_compositor_property', 'animates layout or paint properties. Animate only transform and opacity (x, y, scale, rotate, opacity).' );
		}

		if ( preg_match( self::CLEANUP_API_PATTERN, $code ) && ! self::returns_cleanup( $code ) ) {
			$warnings[] = self::warning( 'missing_cleanup', 'uses inView/hover/press/scroll/drag or an infinite loop without returning a cleanup function.' );
		}

		if ( preg_match( self::GLOBAL_ACCESS_PATTERN, $code ) ) {
			$warnings[] = self::warning( 'global_access', 'references document or window. Scope all queries to element.' );
		}

		if ( preg_match( self::IMPORT_PATTERN, $code ) ) {
			$warnings[] = self::warning( 'import_statement', 'contains import. Motion is injected as the motion argument.' );
		}

		$unused_keys = array_values( array_filter( $param_keys, fn( $key ) => ! self::is_param_used( $code, $key ) ) );

		if ( ! empty( $unused_keys ) ) {
			$warnings[] = self::warning( 'unused_param', sprintf( 'declares params never read by the code: %s.', implode( ', ', $unused_keys ) ) );
		}

		if ( preg_match( self::LOOP_OR_SCROLL_PATTERN, $code ) && ! preg_match( self::REDUCED_MOTION_PATTERN, $code ) ) {
			$warnings[] = self::warning( 'reduced_motion_ignored', 'runs a loop or scroll-linked animation without checking reducedMotion.' );
		}

		return $warnings;
	}

	private static function warning( string $suffix, string $problem ): array {
		return [
			'code' => 'code_effect_' . $suffix,
			'message' => sprintf( 'Code effect %s See %s and %s.', $problem, self::GUIDE_URI, self::PATTERNS_URI ),
		];
	}

	private static function returns_cleanup( string $code ): bool {
		return preg_match( self::RETURN_PATTERN, $code ) || preg_match( self::CONCISE_ARROW_PATTERN, $code );
	}

	private static function is_param_used( string $code, string $key ): bool {
		$quoted_key = preg_quote( $key, '/' );
		$usage_patterns = [
			'/\bparams\s*(\.\s*' . $quoted_key . '\b|\[\s*[\'"]' . $quoted_key . '[\'"]\s*\])/',
			'/\{[^{}]*\b' . $quoted_key . '\b[^{}]*\}\s*=\s*params\b/',
			'/\bparams\s*:\s*\{[^{}]*\b' . $quoted_key . '\b/',
		];

		foreach ( $usage_patterns as $pattern ) {
			if ( preg_match( $pattern, $code ) ) {
				return true;
			}
		}

		return false;
	}

	private static function param_keys( array $code_effect ): array {
		$params = $code_effect['params']['value'] ?? [];

		return array_values( array_filter( array_map(
			fn( $param ) => $param['value']['key']['value'] ?? null,
			is_array( $params ) ? $params : []
		), 'is_string' ) );
	}
}
