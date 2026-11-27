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
	const TRIGGER_API_PATTERN = '/\b(inView|hover|press|scroll|drag|resize)\s*\(/';
	const LOOP_PATTERN = '/repeat\s*:\s*Infinity/';
	const SCROLL_ON_TRIGGER = 'scrollOn';
	const CONCISE_ARROW_PATTERN = '/^\s*(async\s+)?\(?[^)]*\)?\s*=>\s*[^{\s]/s';
	const RETURN_PATTERN = '/\breturn\b/';
	const GLOBAL_ACCESS_PATTERN = '/\b(document|window)\s*\./';
	const IMPORT_PATTERN = '/^\s*import\b|\bimport\s*\(/m';
	const REDUCED_MOTION_PATTERN = '/\breducedMotion\b/';
	const EMIT_CALL_PATTERN = '/\bemit\s*\(/';

	public static function collect( array $interaction_item, callable $can_save_code ): array {
		$item_value = $interaction_item['value'] ?? [];
		$animation_value = $item_value['animation']['value'] ?? null;

		if ( ! is_array( $animation_value ) || ! Code_Effect_Value::is_code_effect( $animation_value ) ) {
			return [];
		}

		$code_effect = $animation_value['code_effect']['value'] ?? [];
		$code = (string) ( $code_effect['code']['value'] ?? '' );
		$trigger = (string) ( $item_value['trigger']['value'] ?? '' );
		$warnings = $can_save_code() ? [] : [ self::stripped_on_save() ];

		return array_merge(
			$warnings,
			self::trigger_warnings( $code, $trigger ),
			self::event_warnings( $code, Code_Effect_Value::get_fired_event( $item_value ) ),
			self::quality_warnings( $code, (string) ( $code_effect['name']['value'] ?? '' ), self::param_keys( $code_effect ) )
		);
	}

	private static function trigger_warnings( string $code, string $trigger ): array {
		$warnings = [];

		if ( preg_match( self::TRIGGER_API_PATTERN, $code ) ) {
			$warnings[] = self::warning( 'trigger_in_code', 'wires its own trigger with inView/hover/press/scroll/drag/resize. Set the interaction trigger instead; Elementor wires it and runs the code when it fires.' );
		}

		$is_scroll_on = self::SCROLL_ON_TRIGGER === $trigger;

		if ( $is_scroll_on && ! self::returns_value( $code ) ) {
			$warnings[] = self::warning( 'scroll_on_without_animation', 'uses trigger "scrollOn" without returning an animation. Return the animate() result so Elementor can link it to scroll.' );
		}

		if ( ( $is_scroll_on || preg_match( self::LOOP_PATTERN, $code ) ) && ! preg_match( self::REDUCED_MOTION_PATTERN, $code ) ) {
			$warnings[] = self::warning( 'reduced_motion_ignored', 'runs a loop or scroll-linked animation without checking reducedMotion.' );
		}

		return $warnings;
	}

	private static function stripped_on_save(): array {
		return [
			'code' => 'code_effect_stripped_on_save',
			'message' => 'Code effects need the unfiltered_html capability. This code effect will be removed when the document is saved; ask an administrator to add it.',
		];
	}

	private static function quality_warnings( string $code, string $name, array $param_keys ): array {
		$warnings = [];

		if ( '' === $name ) {
			$warnings[] = self::warning( 'missing_name', 'has no name. Set code_effect.name to a short label of what it does, e.g. Add class "is-active".' );
		}

		if ( preg_match( self::NON_COMPOSITOR_PROPERTY_PATTERN, $code ) ) {
			$warnings[] = self::warning( 'non_compositor_property', 'animates layout or paint properties. Animate only transform and opacity (x, y, scale, rotate, opacity).' );
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

		return $warnings;
	}

	private static function warning( string $suffix, string $problem ): array {
		return [
			'code' => 'code_effect_' . $suffix,
			'message' => sprintf( 'Code effect %s See %s and %s.', $problem, self::GUIDE_URI, self::PATTERNS_URI ),
		];
	}

	private static function event_warnings( string $code, ?string $fires_event ): array {
		$calls_emit = (bool) preg_match( self::EMIT_CALL_PATTERN, $code );

		if ( $calls_emit && null === $fires_event ) {
			return [ self::warning( 'emit_without_event', 'calls emit() but the interaction has no fires_event, so nothing is fired. Set fires_event to the event name.' ) ];
		}

		if ( ! $calls_emit && null !== $fires_event ) {
			return [ self::warning( 'event_never_emitted', 'sets fires_event but never calls emit(), so the event is never fired.' ) ];
		}

		return [];
	}

	private static function returns_value( string $code ): bool {
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
