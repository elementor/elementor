<?php

namespace Elementor\Modules\Mcp\Abilities\Build_Composition;

use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type;
use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Dynamic_Tag_Llm_Resolver;
use Elementor\Modules\Mcp\Abilities\Llm_Prop_Value_Adjuster;
use Elementor\Modules\Mcp\Abilities\Prop_Canonicalizer;
use Elementor\Modules\Variables\Services\Variables_Service;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Element_Config_Applier {

	private Widget_Type_Resolver $type_resolver;
	private ?Variables_Service $variables_service;

	public function __construct( Widget_Type_Resolver $type_resolver, ?Variables_Service $variables_service ) {
		$this->type_resolver = $type_resolver;
		$this->variables_service = $variables_service;
	}

	/**
	 * @param array<string, array&>               $config_id_index Index of subtree refs.
	 * @param array<string, array<string, mixed>> $element_config  Per-config-id settings.
	 * @param array<string, array>                $widget_configs  Resolved type configs.
	 *
	 * @return array{ error: ?\WP_Error, warnings: string[] }
	 */
	public function apply( array $config_id_index, array $element_config, array $widget_configs ): array {
		$transformers = array_merge(
			Llm_Prop_Value_Adjuster::create_global_variable_transformers( $this->variables_service ),
			[ Dynamic_Prop_Type::get_key() => Dynamic_Tag_Llm_Resolver::make() ]
		);
		$errors = [];
		$warnings = [];

		foreach ( $element_config as $config_id => $settings ) {
			if ( ! isset( $config_id_index[ $config_id ] ) || ! is_array( $settings ) ) {
				continue;
			}

			$node = &$config_id_index[ $config_id ];
			$tag = $node['widgetType'] ?? $node['elType'] ?? null;
			$schema = $this->type_resolver->get_props_schema( $tag, $widget_configs );

			if ( ! $schema ) {
				$node['settings'] = array_merge( $node['settings'] ?? [], $settings );
				continue;
			}

			$resolved = $this->resolve_settings_against_schema( $settings, $schema, $transformers, $tag, $config_id, $errors, $warnings );

			$node['settings'] = array_merge( $node['settings'] ?? [], $resolved );

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

		$error = empty( $errors )
			? null
			: new \WP_Error(
				'elementor_invalid_settings',
				implode( ' ', $errors ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);

		return [
			'error' => $error,
			'warnings' => $warnings,
		];
	}

	private function resolve_settings_against_schema(
		array $settings,
		array $schema,
		array $transformers,
		string $element_type,
		string $config_id,
		array &$errors,
		array &$warnings
	): array {
		// Precompute the alias map once; resolve every incoming key against it.
		$alias_map = Prop_Canonicalizer::build_alias_map( $schema );
		$resolved = [];

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

			$prop_type = $schema[ $canonical ] ?? null;

			if ( ! is_array( $value ) ) {
				$errors[] = sprintf(
					'[%s] Property "%s" on "%s" expects a PropValue envelope, not a scalar. %s',
					$config_id,
					$canonical,
					$element_type,
					$this->format_expected_envelope_hint( $prop_type, $element_type )
				);
				continue;
			}

			$adjusted = Llm_Prop_Value_Adjuster::adjust(
				$value,
				[
					'force_key' => $this->resolve_force_key( $prop_type ),
					'transformers' => $transformers,
				]
			);

			if ( null === $adjusted ) {
				$errors[] = sprintf(
					'[%s] Property "%s" on "%s" could not be adjusted. %s',
					$config_id,
					$canonical,
					$element_type,
					$this->format_expected_envelope_hint( $prop_type, $element_type )
				);
				continue;
			}

			$resolved[ $canonical ] = $adjusted;
		}

		return $resolved;
	}

	private function validate_settings( array $settings, array $schema ): ?string {
		$result = Props_Parser::make( $schema )->parse( $settings );

		return $result->is_valid() ? null : $result->errors()->to_string();
	}

	/**
	 * When the schema slot is a single (non-union) Prop_Type, force LLM-adjusted values
	 * into that concrete $$type envelope so loosely typed payloads get coerced correctly.
	 * Unions stay ambiguous and return null.
	 */
	private function resolve_force_key( ?Prop_Type $prop_type ): ?string {
		if ( ! $prop_type || $prop_type instanceof Union_Prop_Type ) {
			return null;
		}

		return $prop_type::get_key();
	}

	private function resolve_primary_static_type_key( ?Prop_Type $prop_type ): ?string {
		if ( ! $prop_type ) {
			return null;
		}

		if ( $prop_type instanceof Union_Prop_Type ) {
			$member_keys = array_keys( $prop_type->get_prop_types() );
			$static_keys = array_values(
				array_filter(
					$member_keys,
					fn( $key ) => 'dynamic' !== $key
				)
			);

			return $static_keys[0] ?? null;
		}

		return $prop_type::get_key();
	}

	private function format_expected_envelope_hint( ?Prop_Type $prop_type, string $element_type ): string {
		$type_key = $this->resolve_primary_static_type_key( $prop_type );

		if ( $type_key ) {
			return sprintf(
				'Send { "$$type": "%s", "value": <your value> }. See elementor://widgets/schema/%s.',
				$type_key,
				$element_type
			);
		}

		return sprintf(
			'Send a PropValue envelope with $$type from elementor://widgets/schema/%s.',
			$element_type
		);
	}
}
