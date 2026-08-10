<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Media_Splitter;
use Elementor\Modules\Mcp\Abilities\Utils\Style_Variants_Merger;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Maps LLM CSS strings onto legacy V3 style settings; unmapped rules become custom_css.
 */
class V3_Style_Mapper {

	const DESKTOP_BREAKPOINT = 'desktop';

	private Css_Converter $css_converter;
	private array $active_breakpoints;

	public function __construct( Css_Converter $css_converter, array $active_breakpoints = [] ) {
		$this->css_converter = $css_converter;
		$this->active_breakpoints = $active_breakpoints;
	}

	/**
	 * @param string $css_string
	 * @param string $widget_type
	 * @param array  $widget_config From Widget_Context_Helper::get_widget_config().
	 * @return array{settings_patch: array<string, mixed>, unmapped_css: string, warnings: string[]}
	 */
	public function apply( string $css_string, string $widget_type, array $widget_config ): array {
		$css_string = trim( $css_string );

		if ( '' === $css_string ) {
			return [
				'settings_patch' => [],
				'unmapped_css' => '',
				'warnings' => [],
			];
		}

		$overrides = V3_Widget_Bridge_Registry::get_style_overrides( $widget_type );
		$generic_index = V3_Style_Settings_Index::build( $widget_config['controls'] ?? [], $overrides );

		$split = ( new Css_Media_Splitter( $this->get_active_breakpoints() ) )->split( $css_string );
		if ( null !== $split['error'] ) {
			return [
				'settings_patch' => [],
				'unmapped_css' => $css_string,
				'warnings' => [ $split['error'] ],
			];
		}

		$settings_patch = [];
		$unmapped = [];
		$warnings = [];
		$typography_buckets = [];

		foreach ( $split['breakpoints'] as $breakpoint => $css ) {
			if ( '' === trim( $css ) ) {
				continue;
			}

			$parsed = $this->css_converter->parse_nested( $css );
			if ( isset( $parsed['error'] ) ) {
				$unmapped[] = $this->serialize_breakpoint_block( $breakpoint, $css );
				$warnings[] = $parsed['error'];
				continue;
			}

			foreach ( $parsed['blocks'] as $block ) {
				$selector = $block['selector'] ?? null;
				$block_css = $block['css'] ?? '';
				$state = $this->normalize_state( $selector );

				if ( null !== $selector && null === $state ) {
					$unmapped[] = $this->serialize_nested_block( $breakpoint, $selector, $block_css );
					continue;
				}

				foreach ( $this->parse_declarations( $block_css ) as $declaration ) {
					$property = $declaration['property'];
					$value = $declaration['value'];
					$match_key = null === $state ? $property : $property . '@' . $state;

					if ( isset( $overrides[ $match_key ] ) ) {
						$override = $overrides[ $match_key ];

						if ( isset( $override['typography_prefix'] ) ) {
							$bucket_key = $breakpoint . '|' . ( $state ?? '' ) . '|' . $override['typography_prefix'];
							$typography_buckets[ $bucket_key ]['prefix'] = $override['typography_prefix'];
							$typography_buckets[ $bucket_key ]['breakpoint'] = $breakpoint;
							$typography_buckets[ $bucket_key ]['responsive'] = ! empty( $override['responsive'] );
							$typography_buckets[ $bucket_key ]['declarations'][ $property ] = $value;
							continue;
						}

						$mapped = $this->apply_override( $override, $value, $breakpoint, $widget_config );
						if ( null === $mapped ) {
							$unmapped[] = $this->serialize_declaration( $breakpoint, $state, $property, $value );
							continue;
						}

						$settings_patch = array_merge( $settings_patch, $mapped );
						continue;
					}

					if ( isset( $generic_index[ $match_key ] ) ) {
						$mapped = $this->apply_generic_rule( $generic_index[ $match_key ], $value, $breakpoint, $widget_config );
						if ( null !== $mapped ) {
							$settings_patch = array_merge( $settings_patch, $mapped );
							continue;
						}
					}

					$unmapped[] = $this->serialize_declaration( $breakpoint, $state, $property, $value );
				}
			}
		}

		foreach ( $typography_buckets as $bucket ) {
			$group_patch = V3_Value_Resolvers::resolve_typography_group(
				$bucket['declarations'],
				$bucket['prefix']
			);

			if ( ! empty( $bucket['responsive'] ) && self::DESKTOP_BREAKPOINT !== $bucket['breakpoint'] ) {
				$group_patch = $this->suffix_responsive_keys( $group_patch, $bucket['breakpoint'], $widget_config );
			}

			$settings_patch = array_merge( $settings_patch, $group_patch );
		}

		if ( ! empty( $split['custom_css'] ) ) {
			$unmapped[] = trim( $split['custom_css'] );
		}

		return [
			'settings_patch' => $settings_patch,
			'unmapped_css' => $this->join_unmapped( $unmapped ),
			'warnings' => $warnings,
		];
	}

	/**
	 * @param array<string, mixed> $override
	 * @return array<string, mixed>|null
	 */
	private function apply_override( array $override, string $value, string $breakpoint, array $widget_config ): ?array {
		if ( isset( $override['border_prefix'] ) ) {
			$patch = V3_Value_Resolvers::resolve_border_shorthand( $value, $override['border_prefix'] );
			return $patch;
		}

		if ( isset( $override['box_shadow_prefix'] ) ) {
			$resolved = V3_Value_Resolvers::resolve_box_shadow( $value );
			if ( null === $resolved ) {
				return null;
			}
			$prefix = $override['box_shadow_prefix'];
			return [
				$prefix . '_box_shadow_type' => $resolved['box_shadow_type'],
				$prefix . '_box_shadow' => $resolved['box_shadow'],
			];
		}

		$resolver = $override['resolver'] ?? 'text';
		$setting = $override['setting'] ?? null;
		if ( ! is_string( $setting ) || '' === $setting ) {
			return null;
		}

		$resolved = V3_Value_Resolvers::resolve( $resolver, $value );
		if ( null === $resolved ) {
			return null;
		}

		if ( 'box_shadow' === $resolver && is_array( $resolved ) ) {
			return [
				$setting . '_type' => $resolved['box_shadow_type'],
				$setting => $resolved['box_shadow'],
			];
		}

		$key = $setting;
		if ( ! empty( $override['responsive'] ) && self::DESKTOP_BREAKPOINT !== $breakpoint ) {
			$suffixed = $setting . '_' . $breakpoint;
			if ( ! $this->control_exists( $widget_config, $suffixed ) ) {
				return null;
			}
			$key = $suffixed;
		}

		return [ $key => $resolved ];
	}

	/**
	 * @param array{setting: string, resolver: string, responsive: bool} $rule
	 * @return array<string, mixed>|null
	 */
	private function apply_generic_rule( array $rule, string $value, string $breakpoint, array $widget_config ): ?array {
		$resolved = V3_Value_Resolvers::resolve( $rule['resolver'], $value );
		if ( null === $resolved ) {
			return null;
		}

		$key = $rule['setting'];
		if ( self::DESKTOP_BREAKPOINT !== $breakpoint ) {
			$suffixed = $key . '_' . $breakpoint;
			if ( ! $this->control_exists( $widget_config, $suffixed ) ) {
				return null;
			}
			$key = $suffixed;
		}

		return [ $key => $resolved ];
	}

	/**
	 * @param array<string, mixed> $patch
	 * @return array<string, mixed>
	 */
	private function suffix_responsive_keys( array $patch, string $breakpoint, array $widget_config ): array {
		$suffixed = [];

		foreach ( $patch as $key => $value ) {
			if ( str_ends_with( (string) $key, '_typography' ) ) {
				$suffixed[ $key ] = $value;
				continue;
			}

			$candidate = $key . '_' . $breakpoint;
			if ( $this->control_exists( $widget_config, $candidate ) ) {
				$suffixed[ $candidate ] = $value;
				continue;
			}

			$suffixed[ $key ] = $value;
		}

		return $suffixed;
	}

	private function control_exists( array $widget_config, string $key ): bool {
		$controls = $widget_config['controls'] ?? [];

		return is_array( $controls ) && array_key_exists( $key, $controls );
	}

	private function normalize_state( $selector ): ?string {
		if ( null === $selector || '' === $selector ) {
			return null;
		}

		$state = strtolower( ltrim( (string) $selector, ':' ) );

		return in_array( $state, Style_Variants_Merger::PSEUDO_STATES, true ) ? $state : null;
	}

	/**
	 * @return array<int, array{property: string, value: string}>
	 */
	private function parse_declarations( string $css ): array {
		$rules = [];

		foreach ( explode( ';', $css ) as $declaration ) {
			$declaration = trim( $declaration );
			$separator = strpos( $declaration, ':' );

			if ( false === $separator ) {
				continue;
			}

			$property = strtolower( trim( substr( $declaration, 0, $separator ) ) );
			$value = trim( substr( $declaration, $separator + 1 ) );

			if ( '' === $property || '' === $value || 'null' === $value ) {
				continue;
			}

			$rules[] = [
				'property' => $property,
				'value' => $value,
			];
		}

		return $rules;
	}

	private function serialize_declaration( string $breakpoint, ?string $state, string $property, string $value ): string {
		$decl = $property . ': ' . $value . ';';

		if ( null !== $state ) {
			$decl = '&:' . $state . ' { ' . $decl . ' }';
		}

		return $this->serialize_breakpoint_block( $breakpoint, $decl );
	}

	private function serialize_nested_block( string $breakpoint, string $selector, string $css ): string {
		$inner = '&' . $selector . ' { ' . trim( $css ) . ' }';

		return $this->serialize_breakpoint_block( $breakpoint, $inner );
	}

	private function serialize_breakpoint_block( string $breakpoint, string $css ): string {
		$css = trim( $css );
		if ( '' === $css ) {
			return '';
		}

		if ( self::DESKTOP_BREAKPOINT === $breakpoint ) {
			return $css;
		}

		return '@media(--' . $breakpoint . ') { ' . $css . ' }';
	}

	/**
	 * @param string[] $parts
	 */
	private function join_unmapped( array $parts ): string {
		$parts = array_values( array_filter( array_map( 'trim', $parts ) ) );

		return implode( ' ', $parts );
	}

	private function get_active_breakpoints(): array {
		if ( ! empty( $this->active_breakpoints ) ) {
			return $this->active_breakpoints;
		}

		return [ self::DESKTOP_BREAKPOINT ];
	}
}
