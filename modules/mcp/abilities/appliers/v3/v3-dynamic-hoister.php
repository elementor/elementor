<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Core\DynamicTags\Manager;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Utils\V3_Json_Schema_Builder;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Dynamic_Hoister {

	/** @var Manager */
	private $manager;

	public function __construct( ?Manager $manager = null ) {
		$this->manager = $manager ?? Plugin::$instance->dynamic_tags;
	}

	/**
	 * @param string                              $widget_type
	 * @param array<string, mixed>                $allowed
	 * @param array<string, array<string, mixed>> $controls
	 *
	 * @return array{primitives: array<string, mixed>, shortcodes: array<string, string>, errors: string[]}
	 */
	public function hoist( string $widget_type, array $allowed, array $controls ): array {
		$primitives = [];
		$shortcodes = [];
		$errors = [];
		$registry = V3_Widget_Map_Registry::instance();
		$contract = $registry->is_experiment_active() ? $registry->get_validation_contract( $widget_type ) : null;
		$map_settings = is_array( $contract['settings'] ?? null ) ? $contract['settings'] : null;

		foreach ( $allowed as $key => $value ) {
			$map_schema = is_array( $map_settings[ $key ] ?? null ) ? $map_settings[ $key ] : [];
			$control_key = is_string( $map_schema['key'] ?? null ) ? $map_schema['key'] : $key;
			$control = is_array( $controls[ $control_key ] ?? null ) ? $controls[ $control_key ] : [];

			if ( null !== $map_settings && true !== ( $map_schema['dynamic'] ?? false ) ) {
				if ( $this->value_contains_disallowed_dynamic( $value, $control ) ) {
					$errors[] = sprintf(
						'V3 widget "%s" property "%s": dynamic tags are not supported on this field.',
						$widget_type,
						$key
					);
					continue;
				}

				$primitives[ $key ] = $value;
				continue;
			}

			if ( ! V3_Dynamic_Resolver::is_dynamic_capable( $control ) ) {
				$primitives[ $key ] = $value;
				continue;
			}

			if ( null !== $map_settings && is_array( $value ) ) {
				$public_schema = V3_Json_Schema_Builder::build_from_map( [ $key => $map_schema ] )['properties'][ $key ];

				if ( null !== V3_Json_Schema_Builder::check_value_shape( $value, $public_schema, true ) ) {
					$primitives[ $key ] = $value;
					continue;
				}
			}

			$control_dynamic = is_array( $control['dynamic'] ?? null ) ? $control['dynamic'] : [];
			$property = is_string( $control_dynamic['property'] ?? null ) ? $control_dynamic['property'] : null;

			$input = V3_Dynamic_Resolver::extract_input( $value, $property );
			if ( null === $input ) {
				$primitives[ $key ] = $value;
				continue;
			}

			$tag = $this->manager->create_tag(
				$this->generate_tag_id( $widget_type, $key, $input ),
				$input['name'],
				$input['settings']
			);
			if ( ! $tag ) {
				$errors[] = sprintf(
					'V3 widget "%s" property "%s": dynamic tag "%s" is not registered.',
					$widget_type,
					$key,
					$input['name']
				);
				continue;
			}

			$control_categories = $control_dynamic['categories'] ?? [];
			if ( ! empty( $control_categories ) && empty( array_intersect( $tag->get_categories(), $control_categories ) ) ) {
				$errors[] = sprintf(
					'V3 widget "%s" property "%s": dynamic tag "%s" (categories: [%s]) is not compatible with field "%s" (allowed categories: [%s]).',
					$widget_type,
					$key,
					$input['name'],
					implode( ', ', $tag->get_categories() ),
					$key,
					implode( ', ', $control_categories )
				);
				continue;
			}

			$shortcode = $this->manager->tag_to_text( $tag );
			if ( '' === $shortcode ) {
				$errors[] = sprintf(
					'V3 widget "%s" property "%s": failed to serialize dynamic tag "%s".',
					$widget_type,
					$key,
					$input['name']
				);
				continue;
			}

			$shortcodes[ $control_key ] = $shortcode;

			if ( is_array( $value ) ) {
				$remainder = V3_Dynamic_Resolver::extract_primitive_remainder( $value, $property );
				if ( ! empty( $remainder ) ) {
					$primitives[ $key ] = $remainder;
				}
			}
		}

		return [
			'primitives' => $primitives,
			'shortcodes' => $shortcodes,
			'errors' => $errors,
		];
	}

	private function value_contains_disallowed_dynamic( $value, array $control ): bool {
		$control_dynamic = is_array( $control['dynamic'] ?? null ) ? $control['dynamic'] : [];
		$property = is_string( $control_dynamic['property'] ?? null ) ? $control_dynamic['property'] : null;

		if ( V3_Dynamic_Resolver::contains_dynamic_input( $value, $property ) ) {
			return true;
		}

		return V3_Dynamic_Resolver::contains_nested_dynamic_input( $value );
	}

	/**
	 * @param string $widget_type
	 * @param string $key
	 * @param array  $input
	 */
	private function generate_tag_id( string $widget_type, string $key, array $input ): string {
		$encoded_settings = wp_json_encode( $input['settings'] );

		return substr(
			md5( $widget_type . ':' . $key . ':' . $input['name'] . ':' . $encoded_settings ),
			0,
			7
		);
	}
}
