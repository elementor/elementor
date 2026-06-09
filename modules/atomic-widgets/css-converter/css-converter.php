<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter;

use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Conversion_Failure_Reporter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Css_Converter {
	const BLOCKED_PROPERTIES = [ 'behavior', '-moz-binding' ];
	const BLOCKED_VALUE_NEEDLES = [ 'expression(', 'javascript:' ];

	private Converter_Registry $registry;

	private Conversion_Failure_Reporter $failure_reporter;

	private Expander_Registry $expanders;

	public function __construct( Converter_Registry $registry, Conversion_Failure_Reporter $failure_reporter, ?Expander_Registry $expanders = null ) {
		$this->registry = $registry;
		$this->failure_reporter = $failure_reporter;
		$this->expanders = $expanders ?? new Expander_Registry();
	}

	/**
	 * @return array{props: array, customCss: string, rejected: string[]}
	 */
	public function convert( string $css ): array {
		$rules = $this->expand_shorthands( $this->parse( $css ) );
		$context = new Conversion_Context( $rules );
		$leftover = [];

		foreach ( $rules as $rule ) {
			if ( ! $this->try_convert( $context, $rule ) ) {
				$leftover[] = $rule['declaration'] . ';';
			}
		}

		return [
			'props'     => $context->get_props(),
			'customCss' => implode( ' ', $leftover ),
			'rejected'  => $context->get_rejected(),
		];
	}

	/**
	 * Pre-processing pass: rewrite shorthands (e.g. `border`) into the longhand declarations the
	 * schema-bound converters understand, in place so the source cascade order is preserved. A rule
	 * with no matching expander, or whose expander declines (empty result) or throws, is kept as-is so
	 * it still reaches the converter loop (and custom_css fallback).
	 *
	 * @param array<int, array{property: string, value: string, declaration: string}> $rules
	 * @return array<int, array{property: string, value: string, declaration: string}>
	 */
	private function expand_shorthands( array $rules ): array {
		$expanded = [];

		foreach ( $rules as $rule ) {
			foreach ( $this->expand_rule( $rule ) as $result_rule ) {
				$expanded[] = $result_rule;
			}
		}

		return $expanded;
	}

	/**
	 * @param array{property: string, value: string, declaration: string} $rule
	 * @return array<int, array{property: string, value: string, declaration: string}>
	 */
	private function expand_rule( array $rule ): array {
		foreach ( $this->expanders->all() as $expander ) {
			if ( ! $expander->is_supported( $rule ) ) {
				continue;
			}

			try {
				$expanded = $expander->expand( $rule );
			} catch ( \Throwable $error ) {
				$this->failure_reporter->report(
					$rule['property'],
					Conversion_Failure_Reporter::CATEGORY_EXCEPTION,
					[ 'message' => $error->getMessage() ]
				);

				return [ $rule ];
			}

			return empty( $expanded ) ? [ $rule ] : $expanded;
		}

		return [ $rule ];
	}

	/**
	 * Try-until-success: iterate converters in registration order; the first one that
	 * converts wins. A thrown error is treated as a decline and reported as a defect.
	 *
	 * @param Conversion_Context                     $context The shared mutable conversion context.
	 * @param array{property: string, value: string} $rule    A single parsed CSS declaration.
	 */
	private function try_convert( Conversion_Context $context, array $rule ): bool {
		foreach ( $this->registry->all() as $converter ) {
			if ( ! $converter->is_supported( $rule ) ) {
				continue;
			}

			try {
				if ( $converter->convert( $context, $rule ) ) {
					return true;
				}
			} catch ( \Throwable $error ) {
				$this->failure_reporter->report(
					$rule['property'],
					Conversion_Failure_Reporter::CATEGORY_EXCEPTION,
					[ 'message' => $error->getMessage() ]
				);
			}
		}

		return false;
	}

	/**
	 * Naive top-level split on ';' (breaks on values containing ';'); acceptable for clean
	 * LLM input. Splits each declaration on the first ':' so values keep colons (e.g. url()).
	 *
	 * @return array<int, array{property: string, value: string}>
	 */
	private function parse( string $css ): array {
		$rules = [];

		foreach ( explode( ';', $css ) as $declaration ) {
			$declaration = trim( $declaration );

			$separator = strpos( $declaration, ':' );

			if ( false === $separator ) {
				continue;
			}

			$property = strtolower( trim( substr( $declaration, 0, $separator ) ) );
			$value = trim( substr( $declaration, $separator + 1 ) );

			if ( '' === $property || '' === $value || $this->is_blocked( $property, $value ) ) {
				continue;
			}

			$rules[] = [
				'property' => $property,
				'value' => $value,
				'declaration' => $declaration,
			];
		}

		return $rules;
	}

	private function is_blocked( string $property, string $value ): bool {
		if ( in_array( $property, self::BLOCKED_PROPERTIES, true ) ) {
			return true;
		}

		$value = strtolower( $value );

		foreach ( self::BLOCKED_VALUE_NEEDLES as $needle ) {
			if ( false !== strpos( $value, $needle ) ) {
				return true;
			}
		}

		return false;
	}
}
