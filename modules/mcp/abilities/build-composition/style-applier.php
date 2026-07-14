<?php

namespace Elementor\Modules\Mcp\Abilities\Build_Composition;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\Parsers\Style_Parser;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Style_Applier {

	const LOCAL_STYLE_ID_PREFIX = 'e-';
	const LOCAL_STYLE_MARKER_PREFIX = 's-';
	const DESKTOP_BREAKPOINT = 'desktop';
	const LOCAL_STYLE_LABEL = 'local';
	const LOCAL_STYLE_TYPE = 'class';

	private Css_Converter $css_converter;

	public function __construct( Css_Converter $css_converter ) {
		$this->css_converter = $css_converter;
	}

	/**
	 * @param array<string, array&>               $config_id_index Index of subtree refs.
	 * @param array<string, array<string, mixed>> $styles          Per-config-id CSS blocks.
	 * @return array{error: \WP_Error|null, warnings: string[]}
	 */
	public function apply( array $config_id_index, array $styles ): array {
		if ( empty( $styles ) ) {
			return [
				'error' => null,
				'warnings' => [],
			];
		}

		$style_parser = Style_Parser::make( Style_Schema::get() );
		$errors = [];
		$warnings = [];

		foreach ( $styles as $config_id => $declarations ) {
			if ( ! isset( $config_id_index[ $config_id ] ) || ! is_array( $declarations ) ) {
				continue;
			}

			$conversion = $this->convert_style_block( $declarations );

			if ( ! empty( $conversion['rejected'] ) ) {
				$errors[] = sprintf(
					'[%s] Invalid variable usage: %s. Variables must exist in [elementor://global-variables] and use label-only references (e.g., var(--wc26-gold), NOT var(--e-gv-wc26-gold)).',
					$config_id,
					implode( ', ', $conversion['rejected'] )
				);
				continue;
			}

			if ( empty( $conversion['props'] ) && empty( $conversion['customCss'] ) ) {
				continue;
			}

			if ( ! empty( $conversion['customCss'] ) ) {
				$warnings[] = sprintf(
					'[%s] Some CSS properties fell back to custom_css which may not render on Pro 3.35+. Consider using longhand properties instead.',
					$config_id
				);
			}

			$node = &$config_id_index[ $config_id ];

			$apply_error = $this->apply_conversion_to_node(
				$node,
				$conversion,
				$style_parser,
				$config_id
			);

			if ( $apply_error ) {
				$errors[] = $apply_error;
			}
		}
		unset( $node );

		return [
			'error' => $errors ? new \WP_Error(
				'elementor_invalid_styles',
				implode( ' ', $errors ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			) : null,
			'warnings' => $warnings,
		];
	}

	private function apply_conversion_to_node(
		array &$node,
		array $conversion,
		Style_Parser $style_parser,
		string $config_id
	): ?string {
		$existing_style_id = $this->find_existing_local_style_id( $node );

		if ( $existing_style_id ) {
			$merged_definition = $this->merge_into_existing_style(
				$node['styles'][ $existing_style_id ] ?? [],
				$conversion['props'],
				$conversion['customCss']
			);
			$parse_result = $style_parser->parse( $merged_definition );

			if ( ! $parse_result->is_valid() ) {
				return sprintf( '[%s] %s', $config_id, $parse_result->errors()->to_string() );
			}

			$node['styles'][ $existing_style_id ] = $parse_result->unwrap();
			return null;
		}

		$style_id = $this->generate_local_style_id();
		$definition = $this->build_local_style_definition( $style_id, $conversion['props'], $conversion['customCss'] );

		$parse_result = $style_parser->parse( $definition );
		if ( ! $parse_result->is_valid() ) {
			return sprintf( '[%s] %s', $config_id, $parse_result->errors()->to_string() );
		}

		$node['styles'] = $node['styles'] ?? [];
		$node['styles'][ $style_id ] = $parse_result->unwrap();
		$node['settings'] = $this->add_style_to_classes( $node['settings'] ?? [], $style_id );

		return null;
	}

	/**
	 * @return array{props: array, customCss: string, rejected: string[]}
	 */
	private function convert_style_block( array $declarations ): array {
		$css_parts = [];
		foreach ( $declarations as $property => $value ) {
			$is_null_reset = null === $value || 'null' === $value;
			$css_parts[] = $property . ': ' . ( $is_null_reset ? 'null' : $value ) . ';';
		}

		$result = $this->css_converter->convert( implode( ' ', $css_parts ) );
		return [
			'props' => $result['props'] ?? [],
			'customCss' => $result['customCss'] ?? '',
			'rejected' => $result['rejected'] ?? [],
		];
	}

	private function find_existing_local_style_id( array $node ): ?string {
		foreach ( $node['styles'] ?? [] as $style_id => $_style ) {
			if ( str_starts_with( $style_id, self::LOCAL_STYLE_MARKER_PREFIX ) ) {
				return $style_id;
			}
		}

		return null;
	}

	private function merge_into_existing_style( array $existing_style, array $new_props, string $new_custom_css ): array {
		$variants = $existing_style['variants'] ?? [];
		$desktop_index = $this->find_or_create_desktop_variant_index( $variants );

		$variants[ $desktop_index ]['props'] = array_merge(
			$variants[ $desktop_index ]['props'] ?? [],
			$new_props
		);

		if ( '' !== $new_custom_css ) {
			$variants[ $desktop_index ]['custom_css'] = $this->merge_custom_css(
				$variants[ $desktop_index ]['custom_css']['raw'] ?? '',
				$new_custom_css
			);
		}

		return [
			'id' => $existing_style['id'] ?? null,
			'type' => $existing_style['type'] ?? self::LOCAL_STYLE_TYPE,
			'label' => $existing_style['label'] ?? self::LOCAL_STYLE_LABEL,
			'variants' => $variants,
		];
	}

	private function find_or_create_desktop_variant_index( array &$variants ): int {
		foreach ( $variants as $index => $variant ) {
			$is_desktop = ( $variant['meta']['breakpoint'] ?? self::DESKTOP_BREAKPOINT ) === self::DESKTOP_BREAKPOINT;
			$is_no_state = null === ( $variant['meta']['state'] ?? null );

			if ( $is_desktop && $is_no_state ) {
				return $index;
			}
		}

		$variants[] = [
			'meta' => [
				'breakpoint' => self::DESKTOP_BREAKPOINT,
				'state' => null,
			],
			'props' => [],
			'custom_css' => null,
		];

		return array_key_last( $variants );
	}

	private function merge_custom_css( string $existing_raw, string $new_custom_css ): array {
		$existing_decoded = $existing_raw ? base64_decode( $existing_raw ) : ''; // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode -- Local style custom_css.raw is stored as base64.
		$merged_raw = trim( $existing_decoded . "\n" . $new_custom_css );

		return [
			'raw' => base64_encode( $merged_raw ), // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Local style custom_css.raw is stored as base64.
		];
	}

	private function build_local_style_definition( string $style_id, array $props, string $custom_css ): array {
		$variant = [
			'meta' => [
				'breakpoint' => self::DESKTOP_BREAKPOINT,
				'state' => null,
			],
			'props' => $props,
			'custom_css' => '' !== $custom_css
				? [ 'raw' => base64_encode( $custom_css ) ] // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Local style custom_css.raw is stored as base64 for parity with client behavior.
				: null,
		];

		return [
			'id' => $style_id,
			'label' => self::LOCAL_STYLE_LABEL,
			'type' => self::LOCAL_STYLE_TYPE,
			'variants' => [ $variant ],
		];
	}

	private function add_style_to_classes( array $settings, string $style_id ): array {
		$existing = $settings['classes']['value'] ?? [];
		if ( ! is_array( $existing ) ) {
			$existing = [];
		}
		if ( ! in_array( $style_id, $existing, true ) ) {
			$existing[] = $style_id;
		}

		$settings['classes'] = [
			'$$type' => 'classes',
			'value' => array_values( $existing ),
		];

		return $settings;
	}

	private function generate_local_style_id(): string {
		return self::LOCAL_STYLE_ID_PREFIX . strtolower( \Elementor\Utils::generate_random_string() ) . '-' . dechex( wp_rand( 0x1000, 0xffff ) );
	}
}
