<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Media_Splitter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Context_Meta;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Conversion_Context;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Converter_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Css_Declaration_Parser;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Responsive_Key_Resolver;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Unmapped_Css_Serializer;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\V3_Style_Target_Splitter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\V3_Unknown_Breakpoint_Filter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Maps LLM CSS strings onto legacy V3 style settings; unmapped rules become custom_css.
 *
 * Breakpoints:
 * The input CSS is split by `Css_Media_Splitter` using the site's active breakpoint names.
 * Only `desktop` writes to bare setting keys. Non-desktop breakpoints look up
 * `<setting>_<breakpoint>` on the widget config; if the responsive variant does not exist
 * and the base setting does, the rule is dropped (to avoid overwriting desktop with mobile).
 *
 * Overrides (per-widget CSS -> V3 setting map, see {@see V3_Widget_Bridge_Registry}):
 * Four mutually-exclusive shapes are dispatched by the {@see V3_Converter_Registry},
 * one converter class per shape. A fallback `Generic_Index_Converter` uses
 * {@see V3_Style_Settings_Index} for auto-discovered mappings.
 */
class V3_Style_Mapper {

	private Css_Converter $css_converter;
	private array $active_breakpoints;
	private V3_Converter_Registry $converter_registry;
	private Css_Declaration_Parser $declaration_parser;
	private Unmapped_Css_Serializer $unmapped_serializer;
	private Responsive_Key_Resolver $responsive_resolver;

	public function __construct(
		Css_Converter $css_converter,
		array $active_breakpoints,
		V3_Converter_Registry $converter_registry,
		Css_Declaration_Parser $declaration_parser,
		Unmapped_Css_Serializer $unmapped_serializer,
		Responsive_Key_Resolver $responsive_resolver
	) {
		$this->css_converter = $css_converter;
		$this->active_breakpoints = $active_breakpoints;
		$this->converter_registry = $converter_registry;
		$this->declaration_parser = $declaration_parser;
		$this->unmapped_serializer = $unmapped_serializer;
		$this->responsive_resolver = $responsive_resolver;
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
			return $this->empty_result();
		}

		$meta = $this->build_meta( $widget_type, $widget_config );
		$ctx = new V3_Conversion_Context();
		$routing = $meta->is_map_driven() ? V3_Widget_Map_Registry::instance()->get_style_routing( $widget_type ) : null;

		if ( null !== $routing ) {
			$css_string = $this->drop_unknown_breakpoints( $ctx, $css_string );
		}

		$split = ( new Css_Media_Splitter( $this->get_active_breakpoints() ) )->split( $css_string );
		if ( null !== $split['error'] ) {
			$ctx->warn( $split['error'] );
			$ctx->mark_unmapped( $css_string );

			return $this->finalize( $ctx, $meta );
		}

		foreach ( $split['breakpoints'] as $breakpoint => $css ) {
			if ( '' === trim( $css ) ) {
				continue;
			}

			if ( null !== $routing ) {
				$this->process_target_blocks( $ctx, $meta, $routing, (string) $breakpoint, (string) $css );
				continue;
			}

			$this->process_breakpoint( $ctx, $meta, (string) $breakpoint, (string) $css );
		}

		if ( ! empty( $split['custom_css'] ) ) {
			$this->handle_custom_media_css( $ctx, $meta, (string) $split['custom_css'] );
		}

		return $this->finalize( $ctx, $meta );
	}

	private function drop_unknown_breakpoints( V3_Conversion_Context $ctx, string $css_string ): string {
		$filtered = ( new V3_Unknown_Breakpoint_Filter() )->filter( $css_string, $this->get_active_breakpoints() );

		foreach ( $filtered['dropped'] as $breakpoint ) {
			$ctx->warn(
				sprintf(
					/* translators: %s: Breakpoint alias */
					__( 'Breakpoint --%s is not supported and its CSS was dropped.', 'elementor' ),
					$breakpoint
				)
			);
		}

		return $filtered['css'];
	}

	private function handle_custom_media_css( V3_Conversion_Context $ctx, V3_Context_Meta $meta, string $custom_css ): void {
		if ( ! $meta->is_map_driven() ) {
			$ctx->mark_unmapped( $custom_css );

			return;
		}

		$ctx->warn( __( 'Only @media(--<breakpoint>) blocks are supported by this Elementor widget. Other media queries were dropped.', 'elementor' ) );
	}

	/**
	 * @param V3_Conversion_Context                                              $ctx
	 * @param V3_Context_Meta                                                    $meta
	 * @param array{default_target: string, targets: string[], states: string[]} $routing
	 * @param string                                                             $breakpoint
	 * @param string                                                             $css
	 */
	private function process_target_blocks( V3_Conversion_Context $ctx, V3_Context_Meta $meta, array $routing, string $breakpoint, string $css ): void {
		$split = ( new V3_Style_Target_Splitter() )->split( $css, $routing );

		foreach ( $split['dropped'] as $dropped ) {
			$this->report_dropped_block( $ctx, $dropped );
		}

		foreach ( $split['blocks'] as $block ) {
			foreach ( $this->declaration_parser->parse_declarations( $block['css'] ) as $declaration ) {
				$rule = [
					'property' => $declaration['property'],
					'value' => $declaration['value'],
					'state' => $block['state'],
					'breakpoint' => $breakpoint,
					'target' => $block['target'],
				];

				if ( ! $this->dispatch_rule( $ctx, $meta, $rule ) ) {
					$this->report_unsupported_property( $ctx, $meta, $rule );
				}
			}
		}
	}

	/**
	 * @param V3_Conversion_Context                   $ctx
	 * @param array{selector: string, reason: string} $dropped
	 */
	private function report_dropped_block( V3_Conversion_Context $ctx, array $dropped ): void {
		$messages = [
			/* translators: %s: CSS block selector */
			V3_Style_Target_Splitter::REASON_UNKNOWN_TARGET => __( 'Style target %s is not supported by this Elementor widget and was dropped.', 'elementor' ),
			/* translators: %s: CSS block selector */
			V3_Style_Target_Splitter::REASON_UNKNOWN_STATE => __( 'The state in %s is not supported by this Elementor widget and was dropped.', 'elementor' ),
		];
		/* translators: %s: CSS block selector */
		$fallback = __( 'CSS block %s could not be parsed and was dropped.', 'elementor' );

		$ctx->warn( sprintf( $messages[ $dropped['reason'] ] ?? $fallback, $dropped['selector'] ) );
	}

	private function process_breakpoint( V3_Conversion_Context $ctx, V3_Context_Meta $meta, string $breakpoint, string $css ): void {
		$parsed = $this->css_converter->parse_nested( $css );

		if ( isset( $parsed['error'] ) ) {
			$ctx->mark_unmapped( $this->unmapped_serializer->serialize_breakpoint_block( $breakpoint, $css ) );
			$ctx->warn( (string) $parsed['error'] );

			return;
		}

		foreach ( $parsed['blocks'] as $block ) {
			$this->process_block( $ctx, $meta, $breakpoint, $block );
		}
	}

	private function process_block( V3_Conversion_Context $ctx, V3_Context_Meta $meta, string $breakpoint, array $block ): void {
		$selector = $block['selector'] ?? null;
		$block_css = (string) ( $block['css'] ?? '' );
		$state = $this->declaration_parser->normalize_state( $selector );

		if ( null !== $selector && null === $state ) {
			$ctx->mark_unmapped( $this->unmapped_serializer->serialize_nested_block( $breakpoint, (string) $selector, $block_css ) );

			return;
		}

		foreach ( $this->declaration_parser->parse_declarations( $block_css ) as $declaration ) {
			$rule = [
				'property' => $declaration['property'],
				'value' => $declaration['value'],
				'state' => $state,
				'breakpoint' => $breakpoint,
			];

			if ( ! $this->dispatch_rule( $ctx, $meta, $rule ) ) {
				if ( $meta->is_map_driven() ) {
					$this->report_unsupported_property( $ctx, $meta, $rule );
					continue;
				}

				$ctx->mark_unmapped( $this->unmapped_serializer->serialize_declaration(
					$breakpoint,
					$state,
					$rule['property'],
					$rule['value']
				) );
			}
		}
	}

	private function dispatch_rule( V3_Conversion_Context $ctx, V3_Context_Meta $meta, array $rule ): bool {
		foreach ( $this->converter_registry->all() as $converter ) {
			if ( ! $converter->is_supported( $rule, $meta ) ) {
				continue;
			}

			return $converter->convert( $ctx, $rule, $meta );
		}

		return false;
	}

	private function report_unsupported_property( V3_Conversion_Context $ctx, V3_Context_Meta $meta, array $rule ): void {
		$property = (string) ( $rule['property'] ?? '' );
		$target = $rule['target'] ?? null;

		if ( null !== $target ) {
			$ctx->warn(
				sprintf(
					/* translators: 1: CSS property name, 2: Style target alias */
					__( 'CSS property %1$s is not supported for style target %2$s and was skipped.', 'elementor' ),
					$property,
					$target
				)
			);

			return;
		}

		$ctx->warn(
			sprintf(
				/* translators: %s: CSS property name */
				__( 'CSS property %s is not supported by this Elementor widget and was skipped.', 'elementor' ),
				$property
			)
		);
	}

	private function build_meta( string $widget_type, array $widget_config ): V3_Context_Meta {
		$registry = V3_Widget_Map_Registry::instance();
		$map_overrides = $registry->get_style_overrides_from_map( $widget_type );
		$overrides = $map_overrides ?? V3_Widget_Bridge_Registry::get_style_overrides( $widget_type );
		$is_map_driven = null !== $map_overrides;

		if ( $is_map_driven ) {
			$widget_config['controls'] = $registry->get_registered_controls( $widget_type );
		}

		$controls = $widget_config['controls'] ?? [];
		$generic_index = $is_map_driven
			? []
			: V3_Style_Settings_Index::build( is_array( $controls ) ? $controls : [], $overrides );

		return new V3_Context_Meta( $widget_type, $widget_config, $overrides, $generic_index, $is_map_driven );
	}

	private function finalize( V3_Conversion_Context $ctx, V3_Context_Meta $meta ): array {
		$settings_patch = $ctx->settings_patch();

		foreach ( $ctx->typography_buckets() as $bucket ) {
			$group_patch = V3_Value_Resolvers::resolve_typography_group(
				$bucket['declarations'],
				$bucket['prefix']
			);

			if ( ! empty( $bucket['responsive'] ) && Responsive_Key_Resolver::BASE_BREAKPOINT !== $bucket['breakpoint'] ) {
				$group_patch = $this->responsive_resolver->suffix_patch( $group_patch, $bucket['breakpoint'], $meta );
			}

			$settings_patch = array_merge( $settings_patch, $group_patch );
		}

		return [
			'settings_patch' => $settings_patch,
			'unmapped_css' => $this->unmapped_serializer->join( $ctx->unmapped_parts() ),
			'warnings' => $ctx->warnings(),
		];
	}

	private function empty_result(): array {
		return [
			'settings_patch' => [],
			'unmapped_css' => '',
			'warnings' => [],
		];
	}

	private function get_active_breakpoints(): array {
		if ( ! empty( $this->active_breakpoints ) ) {
			return $this->active_breakpoints;
		}

		return [ Responsive_Key_Resolver::BASE_BREAKPOINT ];
	}
}
