<?php

namespace Elementor\Modules\Mcp\Abilities\Build_Composition;

use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\Mcp\Abilities\Prop_Canonicalizer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Element_Config_Applier {

	private Widget_Type_Resolver $type_resolver;
	private Plain_Values_Resolver $plain_values_resolver;

	public function __construct( Widget_Type_Resolver $type_resolver, Plain_Values_Resolver $plain_values_resolver ) {
		$this->type_resolver = $type_resolver;
		$this->plain_values_resolver = $plain_values_resolver;
	}

	/**
	 * @param array<string, array&>               $config_id_index Index of subtree refs.
	 * @param array<string, array<string, mixed>> $element_config  Per-config-id settings.
	 * @param array<string, array>                $widget_configs  Resolved type configs.
	 *
	 * @return array{ error: ?\WP_Error, warnings: string[] }
	 */
	public function apply( array &$config_id_index, array $element_config, array $widget_configs ): array {
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

			$resolved = $this->resolve_settings_against_schema( $settings, $schema, $tag, $config_id, $errors, $warnings );

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
		string $element_type,
		string $config_id,
		array &$errors,
		array &$warnings
	): array {
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

		return $resolved;
	}

	private function validate_settings( array $settings, array $schema ): ?string {
		$result = Props_Parser::make( $schema )->parse( $settings );

		return $result->is_valid() ? null : $result->errors()->to_string();
	}
}
