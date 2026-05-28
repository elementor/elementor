<?php

namespace Elementor\Modules\Mcp\Abilities\Services;

use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Css_Prop_Converter;
use Elementor\Modules\AtomicWidgets\Utils\Utils as Atomic_Utils;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Walks an element tree, converts each node's friendly `css` declaration string into a typed
 * local style entry, and records any declarations that fell back to `custom_css` for reporting.
 *
 * Declaration parsing is fully delegated to `Css_Prop_Converter` in `modules/atomic-widgets/services/css-prop-converter/`.
 * That service is the canonical CSS-to-v4-props pipeline (façade + classifier + per-shape converters
 * across ~15 small files). This transformer focuses on the tree-walk + Elementor-specific concerns
 * (per-element style id generation, `settings.classes.value` mirroring, base-style resets, and the
 * `text-gradient:` shorthand expansion).
 */
class Element_Css_Transformer {

	private array $unconverted_per_element = [];

	public static function make(): self {
		return new self();
	}

	public function transform( array $elements ): array {
		$transformed = [];

		foreach ( $elements as $element ) {
			if ( ! is_array( $element ) ) {
				continue;
			}
			$transformed[] = $this->transform_element_with_css( $element );
		}

		return $transformed;
	}

	public function get_unconverted_css(): array {
		return $this->unconverted_per_element;
	}

	private function transform_element_with_css( array $element ): array {
		if ( isset( $element['elements'] ) && is_array( $element['elements'] ) ) {
			$children = [];
			foreach ( $element['elements'] as $child ) {
				if ( is_array( $child ) ) {
					$children[] = $this->transform_element_with_css( $child );
				}
			}
			$element['elements'] = $children;
		}

		$css = isset( $element['css'] ) && is_string( $element['css'] ) ? trim( $element['css'] ) : '';

		unset( $element['css'] );

		$el_type = $this->resolve_element_type_for_css( $element );
		$needs_base_reset = Base_Styles_Reset::has_resets_for( $el_type );

		if ( '' === $css && ! $needs_base_reset ) {
			return $element;
		}

		$id = isset( $element['id'] ) && is_string( $element['id'] ) && '' !== $element['id']
			? $element['id']
			: Atomic_Utils::generate_id();
		$element['id'] = $id;

		$converted = '' !== $css
			? self::convert_node_css( $css )
			: [ 'props' => [], 'custom_css' => '', 'unconverted' => [] ];

		$merged_props = Base_Styles_Reset::apply( $converted['props'], $el_type );

		if ( empty( $merged_props ) && '' === $converted['custom_css'] ) {
			return $element;
		}

		$variant = [
			'meta' => [
				'breakpoint' => 'desktop',
				'state' => null,
			],
			'props' => $merged_props,
		];

		if ( '' !== $converted['custom_css'] ) {
			$variant['custom_css'] = [ 'raw' => $converted['custom_css'] ];
		}

		if ( ! empty( $converted['unconverted'] ) ) {
			$this->unconverted_per_element[] = [
				'element_id' => $id,
				'declarations' => $converted['unconverted'],
			];
		}

		$style_id = 'e-' . $id . '-s';

		$existing_styles = isset( $element['styles'] ) && is_array( $element['styles'] ) ? $element['styles'] : [];
		$existing_styles[ $style_id ] = [
			'id' => $style_id,
			'type' => 'class',
			'label' => 'local',
			'variants' => [ $variant ],
		];
		$element['styles'] = $existing_styles;

		$classes = $this->extract_element_classes( $element );
		array_unshift( $classes, $style_id );
		$classes = array_values( array_unique( $classes ) );

		if ( ! isset( $element['settings'] ) || ! is_array( $element['settings'] ) ) {
			$element['settings'] = [];
		}
		$element['settings']['classes'] = [
			'$$type' => 'classes',
			'value' => $classes,
		];

		return $element;
	}

	private function resolve_element_type_for_css( array $element ): string {
		$el_type = isset( $element['elType'] ) && is_string( $element['elType'] ) ? $element['elType'] : '';

		if ( 'widget' === $el_type && isset( $element['widgetType'] ) && is_string( $element['widgetType'] ) ) {
			return $element['widgetType'];
		}

		return '' !== $el_type ? $el_type : 'e-paragraph';
	}

	private function extract_element_classes( array $element ): array {
		if (
			! isset( $element['settings']['classes']['value'] ) ||
			! is_array( $element['settings']['classes']['value'] )
		) {
			return [];
		}

		return array_values( array_filter( $element['settings']['classes']['value'], 'is_string' ) );
	}

	/**
	 * Converts one node's raw `css` declaration string into typed props + custom_css blob + an
	 * unconverted-declarations report.
	 *
	 * Pipeline:
	 *  1. Expand the Elementor-specific `text-gradient:` shorthand into 4 standard declarations.
	 *  2. Hand the resulting string to `Css_Prop_Converter`.
	 *  3. Merge the converter's `custom_css` (base64) with our pre-resolved gradient declarations,
	 *     and merge the unconverted-declarations metadata.
	 *
	 * IMPORTANT: This transformer (`transform_element_with_css` above) OVERWRITES any pre-existing
	 * `styles[e-<id>-s]` entry with a single fresh variant — fine for first-write paths
	 * (`create` / `replace_content` / `append_content`) but wrong for surgical patches.
	 * Surgical patches must use {@see Element_Style_Patcher::merge_into_local()} which calls this
	 * static converter for typing but merges prop-by-prop into the existing variant.
	 *
	 * @internal Promoted to public-static for reuse by Element_Style_Patcher.
	 */
	public static function convert_node_css( string $css ): array {
		[ $cleaned_css, $extra_decls, $extra_unconverted ] = self::expand_text_gradient( $css );

		$result = Css_Prop_Converter::make()->convert( $cleaned_css );

		$converter_decls = array_map(
			static function ( array $entry ): string {
				return rtrim( $entry['declaration'], ';' ) . ';';
			},
			$result->get_unconverted()
		);

		$all_decls = array_merge( $extra_decls, $converter_decls );
		$custom_css = empty( $all_decls )
			? ''
			: Utils::encode_string( implode( "\n", $all_decls ) );

		return [
			'props' => $result->get_props(),
			'custom_css' => $custom_css,
			'unconverted' => array_merge( $extra_unconverted, $result->get_unconverted() ),
		];
	}

	/**
	 * Extracts any `text-gradient: <value>;` declarations and returns:
	 *  - the css string with those declarations removed
	 *  - the 4 standard CSS declarations they expand to (for custom_css)
	 *  - one unconverted entry per shorthand, explaining the expansion
	 *
	 * @internal Promoted to public-static for reuse by `convert_node_css` (also static).
	 */
	private static function expand_text_gradient( string $css ): array {
		if ( false === stripos( $css, 'text-gradient' ) ) {
			return [ $css, [], [] ];
		}

		$cleaned = [];
		$extra_decls = [];
		$extra_unconverted = [];

		foreach ( array_filter( array_map( 'trim', explode( ';', $css ) ) ) as $decl ) {
			$colon = strpos( $decl, ':' );
			if ( false === $colon ) {
				continue;
			}

			$prop = strtolower( trim( substr( $decl, 0, $colon ) ) );
			$value = trim( substr( $decl, $colon + 1 ) );

			if ( 'text-gradient' !== $prop || '' === $value ) {
				$cleaned[] = $decl;
				continue;
			}

			$extra_decls[] = 'background: ' . $value . ';';
			$extra_decls[] = '-webkit-background-clip: text;';
			$extra_decls[] = '-webkit-text-fill-color: transparent;';
			$extra_decls[] = 'background-clip: text;';

			$extra_unconverted[] = [
				'declaration' => 'text-gradient: ' . $value,
				'hint' => 'Shorthand for gradient-text effect. Expanded to 4 CSS declarations in custom_css.',
			];
		}

		return [ implode( '; ', $cleaned ), $extra_decls, $extra_unconverted ];
	}
}
