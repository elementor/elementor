<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Document\Document_Mutator;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Composition_Persister;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Xml_Parser;
use Elementor\Modules\Mcp\Abilities\Utils\Composition_Compiler;
use Elementor\Modules\Mcp\Abilities\Utils\Document_Mutation_Links;
use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Abilities\Utils\Tool_Performance_Metrics;
use Elementor\Modules\Mcp\Events\Mcp_Event_Dispatcher;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Build_Composition_Ability extends Abstract_Ability {

	const CONFIGURATION_ID_ATTRIBUTE = Xml_Parser::CONFIGURATION_ID_ATTRIBUTE;
	const DEFAULT_PARENT_ID = 'document';
	const MODE_APPEND = 'append';
	const MODE_REPLACE_CHILDREN = 'replace_children';

	private ?Document_Mutator $mutator;

	public function __construct( ?Document_Mutator $mutator = null ) {
		$this->mutator = $mutator;
	}

	protected function get_ability_id(): string {
		return 'elementor/build-composition';
	}

	public function is_exposed_via_proxy(): bool {
		return false;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Build Composition', 'elementor' ),
			$this->get_ability_description(),
			'elementor',
			$this->get_output_schema(),
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => true,
				],
			],
			fn() => current_user_can( 'edit_posts' ),
			$this->get_input_schema()
		);
	}

	public function execute( $input = [] ) {
		$started_at = hrtime( true );
		$input      = is_array( $input ) ? $input : [];

		$post_id   = isset( $input['post_id'] ) ? (int) $input['post_id'] : 0;
		$parent_id = $input['parent_id'] ?? self::DEFAULT_PARENT_ID;
		$dry_run   = ! empty( $input['dry_run'] );
		$mode      = is_string( $input['mode'] ?? null ) ? $input['mode'] : self::MODE_APPEND;

		$validation_error = $this->validate_input( $input );
		if ( $validation_error ) {
			$this->emit_mcp_build_composition_executed( $started_at, $post_id, $mode, $dry_run, $validation_error );
			return $validation_error;
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			$error = new \WP_Error(
				'elementor_forbidden',
				__( 'You do not have permission to edit this post.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
			$this->emit_mcp_build_composition_executed( $started_at, $post_id, $mode, $dry_run, $error );
			return $error;
		}

		$document = $this->resolve_document( $post_id );
		if ( is_wp_error( $document ) ) {
			$this->emit_mcp_build_composition_executed( $started_at, $post_id, $mode, $dry_run, $document );
			return $document;
		}

		$elements_data = $document->get_elements_data();
		$compiled = Composition_Compiler::make()->compile(
			$input,
			$document,
			is_array( $elements_data ) ? $elements_data : [],
			$parent_id
		);
		if ( is_wp_error( $compiled ) ) {
			$this->emit_mcp_build_composition_executed( $started_at, $post_id, $mode, $dry_run, $compiled, null, [], $document );
			return $compiled;
		}

		$subtrees      = $compiled['elements'];
		$warnings      = $compiled['warnings'];
		$warning_codes = $compiled['warning_codes'] ?? [];
		$dom           = $compiled['dom'];
		$xml_parser    = $compiled['xml_parser'];

		if ( $dry_run ) {
			$response = $this->build_response( $post_id, $document, $xml_parser, $dom, [], $warnings, $mode, [] );
			$this->emit_mcp_build_composition_executed( $started_at, $post_id, $mode, $dry_run, null, $subtrees, $warning_codes, $document, $response, [] );
			return $response;
		}

		$persister = new Composition_Persister( $this->get_mutator(), $xml_parser );
		$persisted = $persister->insert_and_save( $document, $subtrees, $parent_id, $mode );
		if ( is_wp_error( $persisted ) ) {
			$this->emit_mcp_build_composition_executed( $started_at, $post_id, $mode, $dry_run, $persisted, $subtrees, $warning_codes, $document );
			return $persisted;
		}

		$persister->embed_ids_into_dom( $dom, $persisted['tree'], $parent_id, $persisted['root_ids'] );

		$response = $this->build_response( $post_id, $document, $xml_parser, $dom, $persisted['root_ids'], $warnings, $mode, $persisted['removed_ids'] );
		$this->emit_mcp_build_composition_executed( $started_at, $post_id, $mode, $dry_run, null, $subtrees, $warning_codes, $document, $response, $persisted['removed_ids'] );

		return $response;
	}

	private function emit_mcp_build_composition_executed(
		int $started_at,
		int $post_id,
		string $mode,
		bool $dry_run,
		?\WP_Error $error = null,
		?array $subtrees = null,
		array $warning_codes = [],
		?Document $document = null,
		array $response = [],
		array $removed_ids = []
	): void {
		$duration_ms = Tool_Performance_Metrics::duration_ms_since( $started_at );

		$status     = null === $error ? 'success' : 'error';
		$error_code = null !== $error ? $error->get_error_code() : null;

		$operations_count   = 0;
		$operations_by_type = [];
		$class_attachments  = 0;
		$interactions_count = 0;
		$removed_count      = count( $removed_ids );

		if ( null !== $subtrees ) {
			$this->collect_composition_counts( $subtrees, $operations_count, $operations_by_type, $class_attachments, $interactions_count );
		}

		$style_input       = [];
		$vars_referenced   = 0;
		$document_type     = null !== $document ? $this->resolve_document_type( $document ) : null;

		$payload = [
			'tool_name'                  => $this->get_ability_id(),
			'status'                     => $status,
			'duration_ms'                => $duration_ms,
			'post_id'                    => $post_id,
			'mode'                       => $mode,
			'dry_run'                    => $dry_run,
			'operations_count'           => $operations_count,
			'operations_by_type'         => $operations_by_type,
			'class_attachments_count'    => $class_attachments,
			'interactions_applied_count' => $interactions_count,
			'removed_count'              => $removed_count,
			'warning_count'              => count( $warning_codes ),
			'warning_types'              => array_values( array_unique( $warning_codes ) ),
		];

		if ( null !== $document_type ) {
			$payload['document_type'] = $document_type;
		}

		if ( null !== $error_code ) {
			$payload['error_code'] = $error_code;
		}

		Mcp_Event_Dispatcher::emit( 'mcp_build_composition_executed', $payload );
	}

	private function collect_composition_counts( array $subtrees, int &$count, array &$by_type, int &$class_attachments, int &$interactions ): void {
		$stack = $subtrees;

		while ( ! empty( $stack ) ) {
			$node = array_pop( $stack );
			$type = $node['widgetType'] ?? $node['elType'] ?? '';

			if ( '' !== $type ) {
				++$count;
				$by_type[ $type ] = ( $by_type[ $type ] ?? 0 ) + 1;
			}

			$classes = $node['settings']['classes']['value'] ?? [];
			$class_attachments += count( array_filter( (array) $classes, fn( $c ) => is_string( $c ) && str_starts_with( $c, 'g-' ) ) );

			if ( ! empty( $node['interactions']['items'] ) && is_array( $node['interactions']['items'] ) ) {
				$interactions += count( $node['interactions']['items'] );
			}

			foreach ( $node['elements'] ?? [] as $child ) {
				$stack[] = $child;
			}
		}
	}

	private function resolve_document_type( Document $document ): string {
		return $document->get_name();
	}

	private function get_ability_description(): string {
		return Prompt_Loader::load( 'build-composition' );
	}

	private function get_output_schema(): array {
		return [
			'type' => 'object',
			'required' => [ 'success', 'post_id', 'root_element_ids', 'edit_url', 'version' ],
			'properties' => [
				'success' => [ 'type' => 'boolean' ],
				'post_id' => [ 'type' => 'integer' ],
				'root_element_ids' => [
					'type' => 'array',
					'items' => [ 'type' => 'string' ],
					'description' => 'IDs of the created root-level elements.',
				],
				'edit_url' => [
					'type' => 'string',
					'format' => 'uri',
					'description' => 'Elementor editor URL for the document. Share with the user when they need a link (they must be logged into WordPress as an editor).',
				],
				'version' => [ 'type' => 'string' ],
				'resolved_xml' => [
					'type' => 'string',
					'description' => 'The XML with element IDs embedded.',
				],
				'warnings' => [
					'type' => 'array',
					'items' => [ 'type' => 'string' ],
					'description' => 'Non-fatal notices, e.g. props skipped because the target widget does not support them, or CSS that fell back to custom_css. The composition was still built.',
				],
				'removed_element_ids' => [
					'type' => 'array',
					'items' => [ 'type' => 'string' ],
					'description' => 'Element IDs removed when mode is replace_children (empty when none existed).',
				],
			],
		];
	}

	private function get_input_schema(): array {
		return [
			'type' => 'object',
			'required' => [ 'post_id', 'xml_structure' ],
			'properties' => [
				'post_id' => [
					'type' => 'integer',
					'description' => 'WordPress post ID of the document to mutate.',
				],
				'xml_structure' => [
					'type' => 'string',
					'description' => 'Valid XML structure with custom Elementor widget tags. Every element MUST have a unique configuration-id attribute (e.g. <e-heading configuration-id="hero-title"></e-heading>). No attributes, classes, IDs, or text nodes in XML.',
				],
				'element_config' => [
					'type' => 'object',
					'default' => (object) [],
					'description' => 'Record mapping configuration-id → plain widget settings matching elementor://widgets/schema/{type}. Keys MUST match configuration-id attributes in xml_structure. For <e-component> configuration-ids, the value is { component_id: int, overrides?: {<override_key>: <plain value>} } — see elementor/list-components.',
				],
				'style' => [
					'type' => 'object',
					'default' => (object) [],
					'description' => 'Record mapping configuration-id → plain CSS string. Supports &:hover/&:focus/&:active nesting and @media(--breakpoint) blocks. Keys MUST match configuration-id attributes in xml_structure.',
					'additionalProperties' => [ 'type' => 'string' ],
				],
				'classes' => [
					'type' => 'object',
					'default' => (object) [],
					'description' => 'Record mapping configuration-id → list of existing global class labels to attach to that element. Create classes first via elementor/manage-classes.',
					'additionalProperties' => [
						'type' => 'array',
						'items' => [ 'type' => 'string' ],
					],
				],
				'interactions' => [
					'type' => 'object',
					'default' => (object) [],
					'description' => 'Record mapping configuration-id → array of interaction items in the native shape. Read elementor://interactions/schema for the full shape and allowed enum values. Send [] for a configuration-id to clear its interactions.',
					'additionalProperties' => [
						'type' => 'array',
						'items' => [ 'type' => 'object' ],
					],
				],
				'parent_id' => [
					'type' => 'string',
					'default' => self::DEFAULT_PARENT_ID,
					'description' => 'ID of the parent container. Omit to insert at document root.',
				],
				'dry_run' => [
					'type' => 'boolean',
					'default' => false,
					'description' => 'If true, validate and return resolved tree without persisting.',
				],
				'mode' => [
					'type' => 'string',
					'enum' => [ self::MODE_APPEND, self::MODE_REPLACE_CHILDREN ],
					'default' => self::MODE_APPEND,
					'description' => 'append (default) inserts under parent_id; replace_children removes existing direct children of parent_id first, then inserts.',
				],
			],
		];
	}

	private function validate_input( array $input ): ?\WP_Error {
		if ( empty( $input['post_id'] ) ) {
			return new \WP_Error(
				'invalid_input',
				__( 'post_id is required.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( empty( $input['xml_structure'] ) || ! is_string( $input['xml_structure'] ) ) {
			return new \WP_Error(
				'invalid_input',
				__( 'xml_structure is required and must be a string.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$mode = $input['mode'] ?? self::MODE_APPEND;
		$valid_modes = [ self::MODE_APPEND, self::MODE_REPLACE_CHILDREN ];
		if ( ! in_array( $mode, $valid_modes, true ) ) {
			return new \WP_Error(
				'invalid_input',
				sprintf(
					/* translators: 1: Provided mode value, 2: List of valid modes */
					__( 'Invalid mode "%1$s". Must be one of: %2$s', 'elementor' ),
					$mode,
					implode( ', ', $valid_modes )
				),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return null;
	}

	private function resolve_document( int $post_id ) {
		$document = Plugin::$instance->documents->get_doc_or_auto_save( $post_id, get_current_user_id() )
			?? Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			return new \WP_Error(
				'elementor_not_found',
				__( 'Post not found.', 'elementor' ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		return $document;
	}

	private function build_response(
		int $post_id,
		Document $document,
		Xml_Parser $xml_parser,
		\DOMDocument $dom,
		array $root_ids,
		array $warnings,
		string $mode,
		array $removed_ids
	): array {
		$post = get_post( $post_id );

		$response = [
			'success' => true,
			'post_id' => $post_id,
			'root_element_ids' => $root_ids,
			'edit_url' => $document->get_edit_url(),
			'version' => $post ? $post->post_modified_gmt : current_time( 'mysql', true ),
			'resolved_xml' => $xml_parser->serialize_children( $dom ),
		];

		if ( ! empty( $warnings ) ) {
			$response['warnings'] = $warnings;
		}

		if ( self::MODE_REPLACE_CHILDREN === $mode ) {
			$response['removed_element_ids'] = $removed_ids;
		}

		return $response;
	}

	private function get_mutator(): Document_Mutator {
		return $this->mutator ?? Document_Mutator::instance();
	}
}
