<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Core\Base\Document;
use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Non_Style_Allowlist;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Widget_Type_Resolver;
use Elementor\Modules\Mcp\Abilities\Prop_Canonicalizer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Element_Config_Applier {

	const COMPONENT_INSTANCE_WIDGET_TYPE = 'e-component';

	private Widget_Type_Resolver $type_resolver;
	private Plain_Values_Resolver $plain_values_resolver;

	public function __construct(
		Widget_Type_Resolver $type_resolver,
		Plain_Values_Resolver $plain_values_resolver
	) {
		$this->type_resolver = $type_resolver;
		$this->plain_values_resolver = $plain_values_resolver;
	}

	/**
	 * @param array<string, array&>               $config_id_index Index of subtree refs.
	 * @param array<string, array<string, mixed>> $element_config  Per-config-id settings.
	 * @param array<string, array>                $widget_configs  Resolved type configs.
	 * @param Document|null                       $document        Target document (required for <e-component> entries).
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
				$filter = V3_Non_Style_Allowlist::filter( (string) $tag, $settings );
				if ( $filter['error'] ) {
					$errors[] = sprintf( '[%s] %s', $config_id, $filter['error']->get_error_message() );
					continue;
				}

				$node['settings'] = $this->merge_with_clears( $node['settings'] ?? [], $filter['allowed'] );
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
		if ( ! $document ) {
			return new \WP_Error(
				'elementor_invalid_settings',
				sprintf(
					'<e-component> entries in element_config require document context, which was not provided. Config-ids: %s.',
					implode( ', ', array_keys( $component_entries ) )
				),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

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
}
