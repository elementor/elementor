<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\System_Info\Reporters\Base_Plugin;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Get_System_Info_Ability extends Abstract_Ability {

	const REPORT_FORMAT = 'raw';

	protected function get_ability_id(): string {
		return 'elementor/get-system-info';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Get Elementor System Info', 'elementor' ),
			Prompt_Loader::load( 'get-system-info' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'reports' => [
						'type' => 'object',
						'description' => 'System info reports keyed by report name.',
						'additionalProperties' => [
							'type' => 'object',
							'properties' => [
								'label' => [ 'type' => 'string' ],
								'fields' => [
									'type' => 'array',
									'items' => [
										'type' => 'object',
										'properties' => [
											'name' => [ 'type' => 'string' ],
											'label' => [ 'type' => 'string' ],
											'value' => [
												'type' => [ 'string', 'array' ],
												'description' => 'Plain text, or a list of plugins for the plugin reports.',
											],
											'warning' => [
												'type' => 'boolean',
												'description' => 'True when this value is a problem worth reporting.',
											],
											'recommendation' => [ 'type' => 'string' ],
										],
									],
								],
							],
						],
					],
				],
			],
			[
				'annotations' => [
					'readonly' => true,
					'idempotent' => true,
					'destructive' => false,
				],
				'mutates_page' => false,
			],
			fn() => current_user_can( 'manage_options' ),
			[
				'type' => 'object',
				'properties' => [
					'reports' => [
						'type' => 'array',
						'items' => [ 'type' => 'string' ],
						'description' => 'Optional report names to return, for example server, wordpress, theme, user, plugins. Omit to get every report.',
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];
		$requested = $this->resolve_requested_reports( $input );

		$reports = Plugin::$instance->system_info->get_reports_data( self::REPORT_FORMAT );
		$selected = empty( $requested ) ? $reports : array_intersect_key( $reports, array_flip( $requested ) );

		if ( ! empty( $requested ) && empty( $selected ) ) {
			return new \WP_Error(
				'report_not_found',
				sprintf(
					/* translators: %s: Comma separated report names. */
					__( 'None of the requested reports exist. Available reports: %s.', 'elementor' ),
					implode( ', ', array_keys( $reports ) )
				),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		return [
			'reports' => array_map( [ $this, 'format_report' ], $selected ),
		];
	}

	private function resolve_requested_reports( array $input ): array {
		$reports = $input['reports'] ?? [];
		$reports = is_string( $reports ) ? wp_parse_list( $reports ) : $reports;
		$reports = is_array( $reports ) ? $reports : [];

		return array_values( array_filter( array_map( 'sanitize_key', array_filter( $reports, 'is_string' ) ) ) );
	}

	private function format_report( array $report ): array {
		return [
			'label' => wp_strip_all_tags( (string) $report['label'] ),
			'fields' => array_values( array_map( [ $this, 'format_field' ], $report['report'] ) ),
		];
	}

	private function format_field( array $field ): array {
		$formatted = [
			'name' => (string) $field['name'],
			'label' => wp_strip_all_tags( (string) $field['label'] ),
			'value' => $this->format_value( $field['value'] ?? '' ),
		];

		if ( ! empty( $field['warning'] ) ) {
			$formatted['warning'] = true;
		}

		if ( ! empty( $field['recommendation'] ) ) {
			$formatted['recommendation'] = wp_strip_all_tags( (string) $field['recommendation'] );
		}

		return $formatted;
	}

	private function format_value( $value ) {
		if ( is_array( $value ) ) {
			return array_values( array_map( [ $this, 'format_list_item' ], $value ) );
		}

		return $this->to_plain_text( $value );
	}

	private function format_list_item( $item ) {
		if ( ! is_array( $item ) ) {
			return $this->to_plain_text( $item );
		}

		$plugin_properties = array_intersect_key( $item, array_flip( Base_Plugin::$required_plugins_properties ) );

		return array_map( [ $this, 'to_plain_text' ], $plugin_properties );
	}

	private function to_plain_text( $value ): string {
		return trim( wp_strip_all_tags( (string) $value ) );
	}
}
