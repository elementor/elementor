<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Core\Base\Document;
use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Dynamic_Hoister;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Non_Style_Allowlist;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Patch_Bisector;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Render_Probe;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Settings_Validator;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Widget_Type_Resolver;
use Elementor\Modules\Mcp\Abilities\Prop_Canonicalizer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Element_Config_Applier {

	const COMPONENT_INSTANCE_WIDGET_TYPE = 'e-component';

	private Widget_Type_Resolver $type_resolver;
	private Plain_Values_Resolver $plain_values_resolver;
	private ?V3_Dynamic_Hoister $v3_dynamic_hoister;

	public function __construct(
		Widget_Type_Resolver $type_resolver,
		Plain_Values_Resolver $plain_values_resolver,
		?V3_Dynamic_Hoister $v3_dynamic_hoister = null
	) {
		$this->type_resolver = $type_resolver;
		$this->plain_values_resolver = $plain_values_resolver;
		$this->v3_dynamic_hoister = $v3_dynamic_hoister;
	}

	/**
	 * @param array<string, array&>               $config_id_index Index of subtree refs.
	 * @param array<string, array<string, mixed>> $element_config  Per-config-id settings.
	 * @param array<string, array>                $widget_configs  Resolved type configs.
	 * @param Document|null                       $document        Target document, when one already exists.
	 *
	 * @return array{ error: ?\WP_Error, warnings: string[] }
	 */
	public function apply( array &$config_id_index, array $element_config, array $widget_configs, ?Document $document = null ): array {
		$errors = [];
		$warnings = [];
		$component_entries = [];

		foreach ( $element_config as $config_id => $settings ) {
			if ( ! isset( $config_id_index[ $config_id ] ) || ! is_array( $settings ) ) {
				continue;
			}

			$node = &$config_id_index[ $config_id ];
			$tag = $node['widgetType'] ?? $node['elType'] ?? null;

			if ( self::COMPONENT_INSTANCE_WIDGET_TYPE === $tag ) {
				$component_entries[ $config_id ] = $settings;
				continue;
			}

			if ( V3_Node_Bridge::is_v3_node( $node ) ) {
				$widget_type = (string) $tag;
				$widget_config = is_array( $widget_configs[ $widget_type ] ?? null ) ? $widget_configs[ $widget_type ] : [];
				$controls = is_array( $widget_config['controls'] ?? null ) ? $widget_config['controls'] : [];

				$filter = V3_Non_Style_Allowlist::filter( $widget_type, $settings, $controls );
				if ( $filter['error'] ) {
					$errors[] = sprintf( '[%s] %s', $config_id, $filter['error']->get_error_message() );
					continue;
				}

				$hoist_outcome = $this->get_v3_dynamic_hoister()->hoist( $widget_type, $filter['allowed'], $controls );

				foreach ( $hoist_outcome['errors'] as $error_message ) {
					$errors[] = sprintf( '[%s] %s', $config_id, $error_message );
				}

				$shape = V3_Settings_Validator::validate_shape( $widget_type, $hoist_outcome['primitives'], $widget_config );

				if ( ! empty( $shape['valid'] ) ) {
					$base_settings = $node['settings'] ?? [];
					$safe_valid = self::guard_v3_render(
						$widget_type,
						$base_settings,
						$shape['valid'],
						$config_id,
						$warnings
					);
					$node['settings'] = $this->merge_with_clears( $base_settings, $safe_valid );
				}

				if ( $shape['error'] ) {
					$errors[] = sprintf( '[%s] %s', $config_id, $shape['error']->get_error_message() );
				}

				if ( ! empty( $hoist_outcome['shortcodes'] ) ) {
					$existing = is_array( $node['settings']['__dynamic__'] ?? null ) ? $node['settings']['__dynamic__'] : [];
					$node['settings']['__dynamic__'] = array_merge( $existing, $hoist_outcome['shortcodes'] );
				}

				continue;
			}

			$schema = $this->type_resolver->get_props_schema( $tag, $widget_configs );

			if ( ! $schema ) {
				$node['settings'] = $this->merge_with_clears( $node['settings'] ?? [], $settings );
				continue;
			}

			$outcome = $this->resolve_settings_against_schema( $settings, $schema, $tag, $config_id, $errors, $warnings );

			$node['settings'] = array_merge( $node['settings'] ?? [], $outcome['resolved'] );

			foreach ( $outcome['cleared'] as $cleared_key ) {
				unset( $node['settings'][ $cleared_key ] );
			}

			$validation_error = $this->validate_settings( $node['settings'], $schema );
			if ( $validation_error ) {
				$errors[] = sprintf(
					'[%s] Settings validation failed on element type "%s": %s. See elementor://widgets/schema/%s.',
					$config_id,
					$tag,
					$validation_error,
					$tag
				);
			}
		}
		unset( $node );

		$component_error = empty( $component_entries )
			? null
			: $this->apply_component_entries( $config_id_index, $component_entries, $document );

		return [
			'error' => $this->combine_errors( $errors, $component_error ),
			'warnings' => $warnings,
		];
	}

	private function combine_errors( array $settings_errors, ?\WP_Error $component_error ): ?\WP_Error {
		if ( empty( $settings_errors ) ) {
			return $component_error;
		}

		if ( $component_error ) {
			$settings_errors[] = $component_error->get_error_message();
		}

		return new \WP_Error(
			'elementor_invalid_settings',
			implode( ' ', $settings_errors ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}

	private function apply_component_entries( array &$config_id_index, array $component_entries, ?Document $document ): ?\WP_Error {
		return $this->create_component_applier()->apply( $config_id_index, $component_entries, $document );
	}

	private function create_component_applier(): Component_Instance_Applier {
		return new Component_Instance_Applier( new Components_Repository(), $this->plain_values_resolver );
	}

	private function resolve_settings_against_schema(
		array $settings,
		array $schema,
		string $element_type,
		string $config_id,
		array &$errors,
		array &$warnings
	): array {
		$alias_map = Prop_Canonicalizer::build_alias_map( $schema );
		$resolved = [];
		$cleared = [];

		foreach ( $settings as $name => $value ) {
			$canonical = Prop_Canonicalizer::resolve_canonical_key( $schema, $name, $alias_map );

			if ( null === $canonical ) {
				$warnings[] = sprintf(
					'[%s] Property "%s" is not supported on element type "%s" and was skipped.',
					$config_id,
					$name,
					$element_type
				);
				continue;
			}

			if ( null === $value ) {
				$cleared[] = $canonical;
				continue;
			}

			$prop_type = $schema[ $canonical ] ?? null;

			if ( ! $prop_type instanceof Prop_Type ) {
				continue;
			}

			$resolved_value = $this->plain_values_resolver->resolve( $value, $prop_type );

			if ( null === $resolved_value ) {
				$errors[] = sprintf(
					'[%s] Property "%s" on "%s" could not be resolved. See elementor://widgets/schema/%s.',
					$config_id,
					$canonical,
					$element_type,
					$element_type
				);
				continue;
			}

			$resolved[ $canonical ] = $resolved_value;
		}

		return [
			'resolved' => $resolved,
			'cleared' => $cleared,
		];
	}

	/**
	 * @param array<string, mixed> $base
	 * @param array<string, mixed> $incoming Validated settings the applier wants to merge on top.
	 * @param string[]             $warnings
	 * @return array<string, mixed> Incoming with offending keys removed.
	 */
	private static function guard_v3_render(
		string $widget_type,
		array $base,
		array $incoming,
		string $config_id,
		array &$warnings
	): array {
		if ( ! apply_filters( 'elementor/mcp/v3_render_probe', true ) ) {
			return $incoming;
		}

		$merged_preview = array_merge( $base, $incoming );
		foreach ( $incoming as $key => $value ) {
			if ( null === $value ) {
				unset( $merged_preview[ $key ] );
			}
		}

		$initial = V3_Render_Probe::probe( $widget_type, $merged_preview );

		if ( $initial['ok'] || $initial['timed_out'] ) {
			return $incoming;
		}

		$probe = static function ( array $settings ) use ( $widget_type ): bool {
			$result = V3_Render_Probe::probe( $widget_type, $settings );
			return $result['ok'] || $result['timed_out'];
		};

		$offending = V3_Patch_Bisector::find_offending( $base, $incoming, $probe );

		if ( empty( $offending ) ) {
			return $incoming;
		}

		$safe = $incoming;
		foreach ( $offending as $key ) {
			unset( $safe[ $key ] );
		}

		$warnings[] = sprintf(
			/* translators: 1: config id, 2: widget type, 3: comma-separated setting keys, 4: PHP error message. */
			__( '[%1$s] V3 render fatal on %2$s for keys [%3$s]: %4$s. Props dropped.', 'elementor' ),
			$config_id,
			$widget_type,
			implode( ',', $offending ),
			(string) $initial['error']
		);

		return $safe;
	}

	private function merge_with_clears( array $existing, array $incoming ): array {
		$merged = $existing;
		foreach ( $incoming as $key => $value ) {
			if ( null === $value ) {
				unset( $merged[ $key ] );
				continue;
			}
			$merged[ $key ] = $value;
		}
		return $merged;
	}

	private function validate_settings( array $settings, array $schema ): ?string {
		$result = Props_Parser::make( $schema )->parse( $settings );

		return $result->is_valid() ? null : $result->errors()->to_string();
	}

	private function get_v3_dynamic_hoister(): V3_Dynamic_Hoister {
		if ( null === $this->v3_dynamic_hoister ) {
			$this->v3_dynamic_hoister = new V3_Dynamic_Hoister();
		}

		return $this->v3_dynamic_hoister;
	}
}
