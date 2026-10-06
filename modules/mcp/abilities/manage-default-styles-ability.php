<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Expander_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\CssConverter\Variable_Prop_Value_Transformer;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Modules\DefaultStyles\Default_Styles_Repository;
use Elementor\Modules\Mcp\Abilities\Utils\Bulk_Operations_Result;
use Elementor\Modules\Mcp\Abilities\Utils\Style_Variants_Merger;
use Elementor\Modules\Variables\Module as Variables_Module;
use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Processor;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Manage_Default_Styles_Ability extends Abstract_Ability {

	const CLASS_TYPE = 'class';
	const MAX_BATCH_SIZE = 20;

	private ?Default_Styles_Repository $repository;
	private ?Css_Converter $css_converter;

	public function __construct( ?Default_Styles_Repository $repository = null, ?Css_Converter $css_converter = null ) {
		$this->repository = $repository;
		$this->css_converter = $css_converter;
	}

	protected function get_ability_id(): string {
		return 'elementor/manage-default-styles';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Manage Default Styles (Site-Wide)', 'elementor' ),
			__( 'Bulk manage the active kit\'s site-wide default styles, keyed by HTML wrapper tag (h1..h6, p, a, section, div, ...). These styles apply to every V4 atomic element that renders that tag on the whole site, sitting on top of each widget\'s built-in base_styles and beneath any inline or global class overrides. Use action=update to upsert (patch or replace) a tag\'s variants via a raw CSS string (supports @media(--breakpoint) + &:hover/&:focus/&:active), and action=delete to remove a tag\'s default style entirely.', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'required' => [ 'status', 'results' ],
				'properties' => [
					'status' => [ 'type' => 'string' ],
					'results' => [ 'type' => 'array' ],
				],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => true,
				],
			],
			fn() => current_user_can( 'manage_options' ),
			[
				'type' => 'object',
				'required' => [ 'operations' ],
				'properties' => [
					'operations' => [
						'type' => 'array',
						'description' => 'Bulk operations (1–20). Each item requires action and tag. update needs css (raw CSS string, same format as manage-classes) and applies site-wide to that HTML tag. Use mode to control merge behaviour on update (patch = upsert variants, replace = overwrite variants for the affected breakpoints). delete removes the tag\'s default style entirely.',
						'items' => [
							'type' => 'object',
							'required' => [ 'action', 'tag' ],
							'properties' => [
								'action' => [
									'type' => 'string',
									'enum' => [ 'update', 'delete' ],
								],
								'tag' => [
									'type' => 'string',
									'description' => 'HTML wrapper tag to target (e.g. h1, h2, p, a). Must be one of Elementor\'s allowed wrapper tags.',
								],
								'css' => [
									'type' => 'string',
									'description' => 'Plain CSS string. Supports &:hover/&:focus/&:active nesting and @media(--breakpoint) blocks. In patch mode: "prop: null" removes that prop; "all: null" wipes the variant.',
								],
								'mode' => [
									'type' => 'string',
									'enum' => [ 'patch', 'replace' ],
									'default' => 'patch',
									'description' => 'patch (default): upsert variants, preserving untouched ones; null/all:null deletions apply. replace: discard all variants for the affected breakpoints, then store new ones; null values have no effect.',
								],
							],
						],
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];
		$operations = $input['operations'] ?? null;

		if ( ! is_array( $operations ) ) {
			return $this->bad_request( __( 'operations array is required.', 'elementor' ) );
		}

		if ( empty( $operations ) ) {
			return $this->bad_request( __( 'operations must not be empty.', 'elementor' ) );
		}

		if ( count( $operations ) > self::MAX_BATCH_SIZE ) {
			return new \WP_Error(
				'batch_size_exceeded',
				sprintf(
					/* translators: %d: maximum operations per request */
					__( 'Maximum %d operations per request.', 'elementor' ),
					self::MAX_BATCH_SIZE
				),
				[
					'status' => \WP_Http::BAD_REQUEST,
					'max_allowed' => self::MAX_BATCH_SIZE,
				]
			);
		}

		return $this->handle_bulk( $operations );
	}

	private function handle_bulk( array $operations ): array {
		$results = new Bulk_Operations_Result();

		foreach ( $operations as $index => $operation ) {
			$this->process_operation( (int) $index, $operation, $results );
		}

		return $results->to_array();
	}

	private function process_operation( int $index, $operation, Bulk_Operations_Result $results ): void {
		if ( ! is_array( $operation ) ) {
			$results->add_error( $index, '', 'invalid_input', __( 'Invalid operation.', 'elementor' ) );
			return;
		}

		$action = $operation['action'] ?? '';
		$tag = isset( $operation['tag'] ) ? (string) $operation['tag'] : '';

		if ( '' === $tag ) {
			$results->add_error( $index, (string) $action, 'invalid_input', __( 'tag is required.', 'elementor' ) );
			return;
		}

		if ( ! Default_Styles_Repository::is_allowed_tag( $tag ) ) {
			$results->add_error( $index, (string) $action, 'invalid_tag', sprintf(
				/* translators: %s: HTML tag */
				__( 'Invalid HTML tag: %s.', 'elementor' ),
				$tag
			) );
			return;
		}

		switch ( $action ) {
			case 'update':
				$this->handle_update( $index, $tag, $operation, $results );
				return;

			case 'delete':
				$this->handle_delete( $index, $tag, $results );
				return;

			default:
				$results->add_error( $index, (string) $action, 'invalid_input', sprintf(
					/* translators: %s: action name */
					__( 'Unknown action: %s.', 'elementor' ),
					$action
				) );
		}
	}

	private function handle_update( int $index, string $tag, array $operation, Bulk_Operations_Result $results ): void {
		$css_string = $operation['css'] ?? null;

		if ( ! is_string( $css_string ) || '' === trim( $css_string ) ) {
			$results->add_error( $index, 'update', 'invalid_input', __( 'update requires css.', 'elementor' ) );
			return;
		}

		$mode = $operation['mode'] ?? 'patch';
		if ( ! in_array( $mode, [ 'patch', 'replace' ], true ) ) {
			$results->add_error( $index, 'update', 'invalid_input', sprintf( 'Unknown mode: %s. Valid modes: patch, replace.', $mode ) );
			return;
		}

		$parsed = Style_Variants_Merger::parse_css_string(
			$css_string,
			$this->get_active_breakpoint_keys(),
			$index,
			'update',
			$results,
			fn() => $this->get_css_converter()
		);

		if ( null === $parsed ) {
			return;
		}

		$new_variants = Style_Variants_Merger::build_variants( $parsed['breakpoint_blocks'], $this->get_css_converter() );

		$existing = $this->get_repository()->get( $tag );
		$existing_variants = is_array( $existing['variants'] ?? null ) ? $existing['variants'] : [];

		$existing_after_removal = array_values(
			array_filter(
				$existing_variants,
				fn( $v ) => ! in_array( $v['meta']['breakpoint'] ?? null, $parsed['removal_breakpoints'], true )
			)
		);

		$merged = Style_Variants_Merger::apply_mode(
			$existing_after_removal,
			$new_variants,
			$mode,
			array_column( $parsed['breakpoint_blocks'], 'breakpoint' )
		);

		$merged = $this->strip_null_props( $merged );

		$persisted = $this->get_repository()->put( $tag, [
			'type' => self::CLASS_TYPE,
			'variants' => $merged,
		] );

		if ( ! $persisted ) {
			$results->add_error( $index, 'update', 'persist_failed', __( 'Failed to save default style.', 'elementor' ) );
			return;
		}

		$results->add_success( $index, 'update', [ 'tag' => $tag ] );
	}

	private function handle_delete( int $index, string $tag, Bulk_Operations_Result $results ): void {
		$existing = $this->get_repository()->get( $tag );

		if ( null === $existing ) {
			$results->add_error( $index, 'delete', 'not_found', __( 'Default style not found for this tag.', 'elementor' ) );
			return;
		}

		$this->get_repository()->delete( $tag );

		$results->add_success( $index, 'delete', [ 'tag' => $tag ] );
	}

	private function strip_null_props( array $variants ): array {
		foreach ( $variants as &$variant ) {
			unset( $variant['null_props'] );
		}

		return $variants;
	}

	private function bad_request( string $message ): \WP_Error {
		return new \WP_Error( 'invalid_input', $message, [ 'status' => \WP_Http::BAD_REQUEST ] );
	}

	protected function get_active_breakpoint_keys(): array {
		return Plugin::$instance->breakpoints->get_active_devices_list();
	}

	private function get_repository(): Default_Styles_Repository {
		if ( $this->repository ) {
			return $this->repository;
		}

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		return Default_Styles_Repository::make( $kit );
	}

	private function get_css_converter(): Css_Converter {
		if ( $this->css_converter ) {
			return $this->css_converter;
		}

		$variables_service = $this->create_variables_service();

		$variable_transformer = $variables_service
			? new Variable_Prop_Value_Transformer( $variables_service )
			: null;

		$this->css_converter = new Css_Converter(
			Converter_Registry_Factory::create( $variables_service ),
			new Null_Failure_Reporter(),
			Expander_Registry_Factory::create( $variables_service ),
			$variable_transformer
		);

		return $this->css_converter;
	}

	private function create_variables_service(): ?Variables_Service {
		if ( ! $this->is_variables_active() ) {
			return null;
		}

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( ! $kit ) {
			return null;
		}

		return new Variables_Service(
			new Variables_Repository( $kit ),
			new Batch_Processor()
		);
	}

	private function is_variables_active(): bool {
		$experiments = Plugin::$instance->experiments;

		return $experiments->is_feature_active( Variables_Module::EXPERIMENT_NAME )
			&& $experiments->is_feature_active( AtomicWidgetsModule::EXPERIMENT_NAME );
	}
}
