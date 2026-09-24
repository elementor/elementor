<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Core\Base\Document;
use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Dynamic_Hoister;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Non_Style_Allowlist;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Settings_Validator;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Widget_Type_Resolver;
use Elementor\Modules\Mcp\Abilities\Prop_Canonicalizer;
use Elementor\Modules\Mcp\Abilities\Utils\Fixable_Warning;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;

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
	 * @return array{ error: ?\WP_Error, warnings: string[], warning_codes: string[], warning_details: array[] }
	 */
	public function apply( array &$config_id_index, array $element_config, array $widget_configs, ?Document $document = null ): array {
		$errors = [];
		$warnings = [];
		$warning_codes = [];
		$warning_details = [];
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

			if ( $this->is_v3_settings_node( $node ) ) {
				$widget_type = (string) $tag;
				$registry = V3_Widget_Map_Registry::instance();
				$is_standardized = $registry->is_experiment_active() && null !== $registry->get_validation_contract( $widget_type );
				$filter = V3_Non_Style_Allowlist::filter( $widget_type, $settings );
				if ( $filter['error'] ) {
					$errors[] = sprintf( '[%s] %s', $config_id, $filter['error']->get_error_message() );
					continue;
				}

				$widget_config = is_array( $widget_configs[ $widget_type ] ?? null ) ? $widget_configs[ $widget_type ] : [];
				$controls = is_array( $widget_config['controls'] ?? null ) ? $widget_config['controls'] : [];

				$hoist_outcome = $this->get_v3_dynamic_hoister()->hoist( $widget_type, $filter['allowed'], $controls );

				foreach ( $hoist_outcome['errors'] as $error_message ) {
					$errors[] = sprintf( '[%s] %s', $config_id, $error_message );
				}

				$shape = V3_Settings_Validator::validate_shape( $widget_type, $hoist_outcome['primitives'], $widget_config );

				if ( ! empty( $shape['valid'] ) ) {
					$node['settings'] = $this->merge_with_clears( $node['settings'] ?? [], $shape['valid'] );

					if ( $is_standardized ) {
						$existing_dynamic = is_array( $node['settings']['__dynamic__'] ?? null ) ? $node['settings']['__dynamic__'] : [];
						$node['settings']['__dynamic__'] = array_diff_key( $existing_dynamic, $shape['valid'] );

						if ( empty( $node['settings']['__dynamic__'] ) ) {
							unset( $node['settings']['__dynamic__'] );
						}
					}
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

			$outcome = $this->resolve_settings_against_schema(
				$settings,
				$schema,
				$tag,
				$config_id,
				$warnings,
				$warning_codes,
				$warning_details
			);

			$node_settings = $node['settings'] ?? [];
			$this->apply_resolved_v4_settings(
				$node_settings,
				$schema,
				$config_id,
				$tag,
				$outcome['resolved'],
				$outcome['cleared'],
				$warnings,
				$warning_codes,
				$warning_details
			);
			$node['settings'] = $node_settings;
		}
		unset( $node );

		$component_outcome = empty( $component_entries )
			? [ 'error' => null, 'warnings' => [], 'warning_codes' => [], 'warning_details' => [] ]
			: $this->apply_component_entries( $config_id_index, $component_entries, $document );

		$warnings = array_merge( $warnings, $component_outcome['warnings'] );
		$warning_codes = array_merge( $warning_codes, $component_outcome['warning_codes'] );
		$warning_details = array_merge( $warning_details, $component_outcome['warning_details'] );

		return [
			'error' => $this->combine_errors( $errors, $component_outcome['error'] ),
			'warnings' => $warnings,
			'warning_codes' => array_values( array_unique( $warning_codes ) ),
			'warning_details' => $warning_details,
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

	private function apply_component_entries( array &$config_id_index, array $component_entries, ?Document $document ): array {
		$applier = $this->create_component_applier();
		$error = $applier->apply( $config_id_index, $component_entries, $document );

		return [
			'error' => $error,
		] + $applier->consume_fixable_warnings();
	}

	private function create_component_applier(): Component_Instance_Applier {
		return new Component_Instance_Applier( new Components_Repository(), $this->plain_values_resolver );
	}

	private function resolve_settings_against_schema(
		array $settings,
		array $schema,
		string $element_type,
		string $config_id,
		array &$warnings,
		array &$warning_codes,
		array &$warning_details
	): array {
		$alias_map = Prop_Canonicalizer::build_alias_map( $schema );
		$resolved = [];
		$cleared = [];

		foreach ( $settings as $name => $value ) {
			$canonical = Prop_Canonicalizer::resolve_canonical_key( $schema, $name, $alias_map );

			if ( null === $canonical ) {
				Fixable_Warning::push(
					$warnings,
					$warning_codes,
					$warning_details,
					'prop_not_in_schema',
					$config_id,
					sprintf(
						'Property "%s" is not in the schema for "%s" and was skipped. See elementor://widgets/schema/%s.',
						$name,
						$element_type,
						$element_type
					)
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
				Fixable_Warning::push(
					$warnings,
					$warning_codes,
					$warning_details,
					'prop_value_invalid',
					$config_id,
					sprintf(
						'Property "%s" on "%s" could not be resolved. See elementor://widgets/schema/%s.',
						$canonical,
						$element_type,
						$element_type
					)
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

	private function apply_resolved_v4_settings(
		array &$node_settings,
		array $schema,
		string $config_id,
		string $element_type,
		array $resolved,
		array $cleared,
		array &$warnings,
		array &$warning_codes,
		array &$warning_details
	): void {
		foreach ( $resolved as $key => $value ) {
			$trial = array_merge( $node_settings, [ $key => $value ] );
			$validation_error = $this->validate_settings( $trial, $schema );

			if ( $validation_error ) {
				Fixable_Warning::push(
					$warnings,
					$warning_codes,
					$warning_details,
					'prop_value_invalid',
					$config_id,
					sprintf(
						'Property "%s" on "%s" failed validation and was skipped: %s See elementor://widgets/schema/%s.',
						$key,
						$element_type,
						$validation_error,
						$element_type
					)
				);
				continue;
			}

			$node_settings[ $key ] = $value;
		}

		foreach ( $cleared as $cleared_key ) {
			if ( ! array_key_exists( $cleared_key, $node_settings ) ) {
				continue;
			}

			$trial = $node_settings;
			unset( $trial[ $cleared_key ] );
			$validation_error = $this->validate_settings( $trial, $schema );

			if ( $validation_error ) {
				Fixable_Warning::push(
					$warnings,
					$warning_codes,
					$warning_details,
					'prop_value_invalid',
					$config_id,
					sprintf(
						'Property "%s" on "%s" could not be cleared: %s See elementor://widgets/schema/%s.',
						$cleared_key,
						$element_type,
						$validation_error,
						$element_type
					)
				);
				continue;
			}

			unset( $node_settings[ $cleared_key ] );
		}
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

	private function is_v3_settings_node( array $node ): bool {
		if ( V3_Node_Bridge::is_v3_node( $node ) ) {
			return true;
		}

		if ( ! Widget_Context_Helper::is_standardized_maps_active() ) {
			return false;
		}

		$type = $node['widgetType'] ?? $node['elType'] ?? null;

		return is_string( $type ) && Widget_Context_Helper::is_v3_supported( $type );
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
