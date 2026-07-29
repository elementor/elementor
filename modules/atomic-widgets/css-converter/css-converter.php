<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter;

use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Conversion_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Css_Converter {
	const BLOCKED_PROPERTIES = [ 'behavior', '-moz-binding' ];
	const BLOCKED_VALUE_NEEDLES = [ 'expression(', 'javascript:' ];

	private Converter_Registry $registry;

	private Conversion_Failure_Reporter $failure_reporter;

	private Expander_Registry $expanders;

	private ?Variable_Prop_Value_Transformer $variable_transformer;

	public function __construct(
		Converter_Registry $registry,
		Conversion_Failure_Reporter $failure_reporter,
		?Expander_Registry $expanders = null,
		?Variable_Prop_Value_Transformer $variable_transformer = null
	) {
		$this->registry = $registry;
		$this->failure_reporter = $failure_reporter;
		$this->expanders = $expanders ?? new Expander_Registry();
		$this->variable_transformer = $variable_transformer;
	}

	/**
	 * @return array{blocks: array<int, array{selector: string|null, css: string}>}|array{blocks: array, error: string}
	 */
	public function parse_nested( string $css ): array {
		$result = $this->scan_ampersand_blocks( $css );

		if ( isset( $result['error'] ) ) {
			return [
				'blocks' => [],
				'error'  => $result['error'],
			];
		}

		return [
			'blocks' => array_merge(
				[ [ 'selector' => null, 'css' => $result['base_css'] ] ],
				$result['nested_blocks']
			),
		];
	}

	private function scan_ampersand_blocks( string $css ): array {
		$nested_blocks = [];
		$base_css      = '';
		$len           = strlen( $css );
		$i             = 0;
		$segment_start = 0;
		$in_string     = false;
		$string_char   = '';

		while ( $i < $len ) {
			$char = $css[ $i ];

			if ( $in_string ) {
				if ( $char === $string_char && ( $i === 0 || '\\' !== $css[ $i - 1 ] ) ) {
					$in_string = false;
				}
				$i++;
				continue;
			}

			if ( '"' === $char || "'" === $char ) {
				$in_string   = true;
				$string_char = $char;
				$i++;
				continue;
			}

			if ( '{' === $char || '}' === $char ) {
				return [ 'error' => 'Unclosed brace detected in CSS input.' ];
			}

			if ( '&' !== $char ) {
				$i++;
				continue;
			}

			$j = $i + 1;
			while ( $j < $len && '{' !== $css[ $j ] ) {
				$j++;
			}

			if ( $j >= $len ) {
				$i++;
				continue;
			}

			$selector = trim( substr( $css, $i + 1, $j - $i - 1 ) );

			if ( '' === $selector ) {
				return [ 'error' => 'Bare & block without a selector is not valid CSS.' ];
			}

			$block_end = $this->find_block_end( $css, $j + 1, $len );

			if ( null === $block_end ) {
				return [ 'error' => 'Unclosed brace detected in CSS input.' ];
			}

			$block_content = substr( $css, $j + 1, $block_end - $j - 2 );
			$base_css     .= substr( $css, $segment_start, $i - $segment_start );
			$segment_start = $block_end;

			$nested_blocks[] = [
				'selector' => $selector,
				'css'      => $block_content,
			];

			$i = $block_end;
		}

		$base_css .= substr( $css, $segment_start );

		return [
			'base_css'      => $base_css,
			'nested_blocks' => $nested_blocks,
		];
	}

	private function find_block_end( string $css, int $start, int $len ): ?int {
		$depth     = 1;
		$in_string = false;
		$str_char  = '';

		for ( $i = $start; $i < $len; $i++ ) {
			$c = $css[ $i ];

			if ( $in_string ) {
				if ( $c === $str_char && ( $i === 0 || '\\' !== $css[ $i - 1 ] ) ) {
					$in_string = false;
				}
				continue;
			}

			if ( '"' === $c || "'" === $c ) {
				$in_string = true;
				$str_char  = $c;
				continue;
			}

			if ( '{' === $c ) {
				$depth++;
			} elseif ( '}' === $c ) {
				$depth--;
				if ( 0 === $depth ) {
					return $i + 1;
				}
			}
		}

		return null;
	}

	/**
	 * @return array{props: array, customCss: string, rejected: string[]}
	 */
	public function convert( string $css ): array {
		$rules = $this->dedupe( $this->expand_shorthands( $this->parse( $css ) ) );
		$context = new Conversion_Context( $rules );
		$leftover = [];

		foreach ( $rules as $rule ) {
			if ( ! $this->try_convert( $context, $rule ) ) {
				$leftover[] = $rule['declaration'] . ';';
			}
		}

		$props = $context->get_props();
		$rejected = $context->get_rejected();

		if ( $this->variable_transformer ) {
			$schema = $this->style_schema();
			$props = $this->variable_transformer->transform( $props, $schema );

			$ejected = $this->variable_transformer->eject_unresolved_var_props( $props, $schema, $rules );
			$props = $ejected['props'];
			$leftover = array_merge( $leftover, $ejected['custom_css'] );
			$rejected = array_merge( $rejected, $ejected['rejected'] );

			// Post-processing: handle edge cases that the general transform pipeline cannot cover.
			$gradient_color_stops_leftovers = $this->variable_transformer->normalize_gradient_color_stops( $props, $rules );
			$leftover = array_merge( $leftover, $gradient_color_stops_leftovers );

			$props = $this->validate_props( $props, $schema );
		}

		$props = $this->cleanup_props( $props );

		return [
			'props'     => $props,
			'customCss' => implode( ' ', $leftover ),
			'rejected'  => $rejected,
		];
	}

	private function validate_props( array $props, array $schema ): array {
		if ( empty( $props ) ) {
			return [];
		}

		$null_resets = array_filter( $props, fn( $v ) => null === $v || $this->has_null_leaf( $v ) );
		$value_props = array_filter( $props, fn( $v ) => null !== $v && ! $this->has_null_leaf( $v ) );

		$validated = empty( $value_props )
			? []
			: Props_Parser::make( $schema )->validate( $value_props )->unwrap();

		return array_merge( $validated, $null_resets );
	}

	private function has_null_leaf( $value ): bool {
		if ( ! is_array( $value ) || ! is_array( $value['value'] ?? null ) ) {
			return false;
		}

		foreach ( $value['value'] as $v ) {
			if ( null === $v || $this->has_null_leaf( $v ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Recursively collapses prop values where all present sub-values are null or empty arrays into a
	 * single null. This propagates null resets up the tree so the client receives a clean signal:
	 * e.g. a Dimensions object where every side was set to null becomes just null at the prop level.
	 */
	private function cleanup_props( array $props ): array {
		$result = [];

		foreach ( $props as $key => $value ) {
			$result[ $key ] = $this->cleanup_value( $value );
		}

		return $result;
	}

	private function cleanup_value( $value ) {
		if ( null === $value || ! is_array( $value ) ) {
			return $value;
		}

		$inner = $value['value'] ?? $value;

		if ( ! is_array( $inner ) ) {
			return $value;
		}

		$cleaned = [];

		foreach ( $inner as $k => $v ) {
			$cleaned[ $k ] = $this->cleanup_value( $v );
		}

		if ( $this->is_empty_or_all_null( $cleaned ) ) {
			return null;
		}

		return isset( $value['$$type'] )
			? [
				'$$type' => $value['$$type'],
				'value' => $cleaned,
			]
			: $cleaned;
	}

	private function is_empty_or_all_null( array $arr ): bool {
		if ( empty( $arr ) ) {
			return false;
		}

		foreach ( $arr as $v ) {
			if ( null !== $v ) {
				return false;
			}
		}

		return true;
	}

	private function style_schema(): array {
		if ( function_exists( 'apply_filters' ) ) {
			return Style_Schema::get();
		}

		return Style_Schema::get_style_schema();
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
	private function dedupe( array $rules ): array {
		$last_index = [];

		foreach ( $rules as $i => $rule ) {
			$last_index[ $rule['property'] ] = $i;
		}

		return array_values(
			array_filter( $rules, fn( $rule, $i ) => $last_index[ $rule['property'] ] === $i, ARRAY_FILTER_USE_BOTH )
		);
	}

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
			$raw_value = trim( substr( $declaration, $separator + 1 ) );

			if ( '' === $property || '' === $raw_value || $this->is_blocked( $property, $raw_value ) ) {
				continue;
			}

			$value = 'null' === $raw_value ? null : $raw_value;

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
