<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Media_Splitter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Context_Meta;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Conversion_Context;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Converter_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Compiled_Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Style_Writer;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Css_Declaration_Parser;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Responsive_Key_Resolver;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Unmapped_Css_Serializer;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\V3_Style_Target_Router;
use Elementor\Modules\Mcp\Abilities\Utils\Style_Variants_Merger;

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
	private V3_Map_Style_Writer $map_writer;
	private V3_Style_Target_Router $target_router;

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
		$this->map_writer = new V3_Map_Style_Writer( $css_converter, V3_Control_Adapter_Registry::create_default(), $declaration_parser );
		$this->target_router = new V3_Style_Target_Router();
	}

	/**
	 * @param string $css_string
	 * @param string $widget_type
	 * @param array  $widget_config From Widget_Context_Helper::get_widget_config().
	 * @return array{settings_patch: array<string, mixed>, unmapped_css: string, fallback_rules: array[], fallback_notes: string[], required_settings: array<string, array{value: mixed, declaration: string}>, warnings: string[], error: string|null}
	 */
	public function apply( string $css_string, string $widget_type, array $widget_config ): array {
		$css_string = trim( $css_string );

		if ( '' === $css_string ) {
			return $this->empty_result();
		}

		$meta = $this->build_meta( $widget_type, $widget_config );

		if ( $meta->is_map_driven() ) {
			return $this->apply_map( $meta, $css_string );
		}

		$ctx = new V3_Conversion_Context();

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

			$this->process_breakpoint( $ctx, $meta, (string) $breakpoint, (string) $css );
		}

		if ( ! empty( $split['custom_css'] ) ) {
			$ctx->mark_unmapped( (string) $split['custom_css'] );
		}

		return $this->finalize( $ctx, $meta );
	}

	/**
	 * Unknown breakpoints fail the whole style like V4 does. Declarations a target cannot store
	 * become `fallback_rules` scoped to the target's selector, for {@see Maps\V3_Custom_Css_Fallback};
	 * targets without a selector drop them with a warning. Media queries other than
	 * `@media(--<breakpoint>)` are returned verbatim as `unmapped_css`.
	 *
	 * @return array{settings_patch: array<string, mixed>, unmapped_css: string, fallback_rules: array[], fallback_notes: string[], required_settings: array<string, array{value: mixed, declaration: string}>, warnings: string[], error: string|null}
	 */
	private function apply_map( V3_Context_Meta $meta, string $css_string ): array {
		$ctx = new V3_Conversion_Context();
		$split = ( new Css_Media_Splitter( $this->get_active_breakpoints() ) )->split( $css_string );

		if ( null !== $split['error'] ) {
			return array_merge( $this->empty_result(), [
				'error' => Style_Variants_Merger::invalid_breakpoints_message( $split['error'], $this->get_active_breakpoints() ),
			] );
		}

		foreach ( $split['breakpoints'] as $breakpoint => $css ) {
			if ( '' !== trim( $css ) ) {
				$this->route_to_targets( $ctx, $meta, (string) $breakpoint, (string) $css );
			}
		}

		$ctx->mark_unmapped( $split['custom_css'] );

		return $this->finalize( $ctx, $meta );
	}

	private function route_to_targets( V3_Conversion_Context $ctx, V3_Context_Meta $meta, string $breakpoint, string $css ): void {
		$map = $meta->map();
		$targets = $map->get_targets();
		$routed = $this->target_router->route(
			$css,
			$map->get_default_target(),
			array_map( fn( Compiled_Style_Target $target ) => $target->get_states(), $targets )
		);

		foreach ( $routed['dropped'] as $dropped ) {
			$ctx->warn( self::dropped_block_message( $dropped, array_keys( $targets ) ) );
		}

		foreach ( $routed['blocks'] as $block ) {
			$target = $targets[ $block['target'] ];
			$fallbacks = $this->map_writer->write( $ctx, $target->get_bindings(), $meta->controls(), $breakpoint, $block['state'], $block['css'] );

			$this->collect_fallback( $ctx, $target, $breakpoint, $block, $fallbacks );
		}
	}

	/**
	 * Every block of a target with a selector yields a rule, so properties it now writes natively
	 * replace an older fallback for them.
	 *
	 * @param V3_Conversion_Context                                              $ctx
	 * @param Compiled_Style_Target                                              $target
	 * @param string                                                             $breakpoint
	 * @param array{target: string, state: string|null, css: string}             $block
	 * @param array<int, array{property: string, value: string, reason: string}> $fallbacks
	 */
	private function collect_fallback( V3_Conversion_Context $ctx, Compiled_Style_Target $target, string $breakpoint, array $block, array $fallbacks ): void {
		$skip_reason = self::fallback_skip_reason( $target, $block['state'] );

		if ( null !== $skip_reason ) {
			foreach ( $fallbacks as $fallback ) {
				$ctx->warn( $fallback['reason'] . ' ' . $skip_reason );
			}

			return;
		}

		$ctx->add_fallback_rule( [
			'target' => $target->get_alias(),
			'state' => $block['state'],
			'breakpoint' => $breakpoint,
			'declarations' => array_column( $fallbacks, 'value', 'property' ),
			'replaces' => array_values( array_unique( array_column( $this->declaration_parser->parse_declarations( $block['css'] ), 'property' ) ) ),
		] );

		foreach ( $fallbacks as $fallback ) {
			$ctx->add_fallback_note( sprintf( '%1$s: %2$s (%3$s): %4$s', $fallback['property'], $fallback['value'], $target->get_alias(), $fallback['reason'] ) );
		}
	}

	private static function fallback_skip_reason( Compiled_Style_Target $target, ?string $state ): ?string {
		if ( null === $target->get_selector() ) {
			return sprintf(
				/* translators: %s: Style target name */
				__( 'It was skipped because style target %s cannot hold custom CSS.', 'elementor' ),
				$target->get_alias()
			);
		}

		if ( null !== $state && ! in_array( $state, Style_Variants_Merger::PSEUDO_STATES, true ) ) {
			return sprintf(
				/* translators: 1: State name, 2: Style target name */
				__( 'It was skipped because the :%1$s state of style target %2$s cannot hold custom CSS.', 'elementor' ),
				$state,
				$target->get_alias()
			);
		}

		return null;
	}

	/**
	 * @param array{selector: string, reason: string} $dropped
	 * @param string[]                                $aliases
	 */
	private static function dropped_block_message( array $dropped, array $aliases ): string {
		switch ( $dropped['reason'] ) {
			case V3_Style_Target_Router::REASON_UNKNOWN_TARGET:
				return sprintf(
					/* translators: 1: CSS block selector, 2: Comma-separated style target names */
					__( 'Style target %1$s is not supported by this Elementor widget and was dropped. Valid style targets: %2$s.', 'elementor' ),
					$dropped['selector'],
					implode( ', ', $aliases )
				);
			case V3_Style_Target_Router::REASON_UNKNOWN_STATE:
				return sprintf(
					/* translators: %s: CSS block selector */
					__( 'The state in %s is not supported by this style target and was dropped.', 'elementor' ),
					$dropped['selector']
				);
			default:
				return sprintf(
					/* translators: %s: CSS block selector */
					__( 'CSS block %s could not be parsed and was dropped. Style target blocks cannot be nested.', 'elementor' ),
					$dropped['selector']
				);
		}
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

	private function build_meta( string $widget_type, array $widget_config ): V3_Context_Meta {
		$registry = V3_Widget_Map_Registry::instance();
		$map = $registry->get_map( $widget_type );

		if ( null !== $map ) {
			$widget_config['controls'] = $registry->get_registered_controls( $widget_type );

			return new V3_Context_Meta( $widget_type, $widget_config, [], [], $map );
		}

		$overrides = V3_Widget_Bridge_Registry::get_style_overrides( $widget_type );
		$controls = $widget_config['controls'] ?? [];
		$generic_index = V3_Style_Settings_Index::build( is_array( $controls ) ? $controls : [], $overrides );

		return new V3_Context_Meta( $widget_type, $widget_config, $overrides, $generic_index );
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
			'fallback_rules' => $ctx->fallback_rules(),
			'fallback_notes' => $ctx->fallback_notes(),
			'required_settings' => $ctx->required_settings(),
			'warnings' => $ctx->warnings(),
			'error' => null,
		];
	}

	private function empty_result(): array {
		return [
			'settings_patch' => [],
			'unmapped_css' => '',
			'fallback_rules' => [],
			'fallback_notes' => [],
			'required_settings' => [],
			'warnings' => [],
			'error' => null,
		];
	}

	private function get_active_breakpoints(): array {
		if ( ! empty( $this->active_breakpoints ) ) {
			return $this->active_breakpoints;
		}

		return [ Responsive_Key_Resolver::BASE_BREAKPOINT ];
	}
}
