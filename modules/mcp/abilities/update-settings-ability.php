<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Document\Document_Mutator;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Mcp\Abilities\Utils\Document_Mutation_Links;
use Elementor\Modules\Mcp\Abilities\Utils\Document_Mutation_Save;
use Elementor\Modules\Mcp\Abilities\Utils\Document_Revision_Snapshots;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Update_Settings_Ability extends Abstract_Ability {

	// Post fields that a draft copy of a published document can't carry to the live post on publish.
	const UNSTAGEABLE_SETTINGS = [ 'post_status', 'menu_order', 'comment_status' ];

	const FEATURED_IMAGE_SETTING = 'post_featured_image';

	const EXCERPT_SETTING = 'post_excerpt';

	const TITLE_SETTING = 'post_title';

	const FEATURED_IMAGE_META_KEY = '_thumbnail_id';

	// The autosave snapshots every post field when it is created, so publish-document promotes only the ones listed
	// here and doesn't overwrite live changes made since. Must not start with `_elementor`: `DB::copy_elementor_meta`
	// copies those keys from the autosave to the live post.
	const STAGED_POST_FIELDS_META_KEY = '_mcp_staged_post_fields';

	private ?Document_Mutator $mutator;

	public function __construct( ?Document_Mutator $mutator = null ) {
		$this->mutator = $mutator;
	}

	protected function get_ability_id(): string {
		return 'elementor/update-page-settings';
	}

	public function is_exposed_via_proxy(): bool {
		return false;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Update Elementor Page Settings', 'elementor' ),
			__( 'Updates Elementor document-level settings for a post (for example page layout, title visibility, or custom page settings). Pass only the keys you want to change. Ask the user for the URL or post ID. Use get-page-structure when you also need the element tree. On published documents the change is staged in a draft copy like other MCP edits (staged=true): the live page is unchanged until you call elementor/publish-document, and post_status, menu_order and comment_status cannot be changed there. Requires permission to edit the target post.', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'success' => [ 'type' => 'boolean' ],
					'post_id' => [ 'type' => 'integer' ],
					'staged' => [
						'type' => 'boolean',
						'description' => 'True when the settings were written to a draft copy of a published document and still need publishing to go live.',
					],
					'preview_url' => Document_Mutation_Links::preview_schema_property(),
					'llm_instructions' => Document_Mutation_Links::llm_instructions_schema_property(),
					'undo_revision_id' => Document_Mutation_Links::undo_revision_id_schema_property(),
				],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => true,
				],
				'mutates_page' => true,
			],
			function () {
				return current_user_can( 'edit_posts' );
			},
			[
				'type' => 'object',
				'required' => [ 'post_id', 'settings' ],
				'properties' => [
					'post_id' => [
						'type' => 'integer',
						'description' => 'WordPress post ID of the Elementor document.',
					],
					'settings' => [
						'type' => 'object',
						'description' => 'Partial document settings object; merged into existing settings. Schema enforcement is delegated to document->save().',
						'additionalProperties' => true,
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$post_id = isset( $input['post_id'] ) ? absint( $input['post_id'] ) : 0;
		$settings = isset( $input['settings'] ) && is_array( $input['settings'] ) ? $input['settings'] : null;

		if ( ! $post_id ) {
			return new \WP_Error( 'invalid_post_id', __( 'A valid post_id is required.', 'elementor' ), [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		if ( null === $settings ) {
			return new \WP_Error( 'invalid_settings', __( 'The settings object is required.', 'elementor' ), [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			return new \WP_Error( 'document_not_found', __( 'Document not found.', 'elementor' ), [ 'status' => \WP_Http::NOT_FOUND ] );
		}

		if ( ! $document->is_editable_by_current_user() ) {
			return new \WP_Error( 'rest_cannot_edit', __( 'Sorry, you are not allowed to edit this document.', 'elementor' ), [ 'status' => \WP_Http::FORBIDDEN ] );
		}

		$is_staged = $this->is_live( $document );

		if ( $is_staged ) {
			$stageable_error = $this->validate_stageable_settings( $document, $settings );

			if ( $stageable_error ) {
				return $stageable_error;
			}
		}

		$undo_point = Document_Revision_Snapshots::capture( $document, $this->get_id() );
		$saved = $is_staged ? $this->save_staged( $document, $settings ) : $this->save_live( $document, $settings );

		if ( is_wp_error( $saved ) ) {
			return $saved;
		}

		$response = [
			'success' => true,
			'post_id' => $post_id,
			'staged' => $is_staged,
		] + Document_Mutation_Links::for_document( $document, $this->get_staged_message( $document, $is_staged ) );

		if ( $undo_point ) {
			$undo_point->commit();
			$response = $undo_point->add_to_response( $response );
		}

		return $response;
	}

	private function is_live( Document $document ): bool {
		return in_array( get_post_status( $document->get_main_id() ), Document_Mutator::LIVE_STATUSES, true );
	}

	private function validate_stageable_settings( Document $document, array $settings ): ?\WP_Error {
		$unstageable = array_values( array_intersect( self::UNSTAGEABLE_SETTINGS, array_keys( $settings ) ) );

		if ( $unstageable ) {
			return new \WP_Error(
				'invalid_settings',
				sprintf(
					/* translators: %s: Comma-separated setting keys. */
					__( '%s cannot be changed on a published document, because MCP changes there are staged in a draft copy. Remove these keys and retry. Publish staged changes with elementor/publish-document; change the post status, order or comments in WordPress.', 'elementor' ),
					implode( ', ', $unstageable )
				),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( ! $this->should_stage_featured_image( $document, $settings ) ) {
			return null;
		}

		if ( ! current_user_can( 'publish_posts' ) ) {
			return new \WP_Error( 'rest_cannot_edit', __( 'You do not have permission to modify the featured image.', 'elementor' ), [ 'status' => \WP_Http::FORBIDDEN ] );
		}

		$attachment_id = $this->get_featured_image_id( $settings );

		if ( $attachment_id && ! wp_attachment_is_image( $attachment_id ) ) {
			return new \WP_Error(
				'invalid_settings',
				__( 'post_featured_image.id must be the ID of an image in the media library. Pass an empty id to remove the featured image.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return null;
	}

	/**
	 * @return bool|\WP_Error
	 */
	private function save_live( Document $document, array $settings ) {
		if ( ! $document->save( [ 'settings' => $settings ] ) ) {
			return new \WP_Error( 'save_failed', __( 'Could not save document settings.', 'elementor' ), [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );
		}

		return true;
	}

	/**
	 * The featured image and excerpt are staged here because core can't write them to an autosave: `set_post_thumbnail`
	 * writes through `update_post_meta`, which redirects revision IDs to the live post, and the excerpt is only saved
	 * when the `revision` post type supports excerpts, which it never does.
	 *
	 * @return Document|\WP_Error
	 */
	private function save_staged( Document $document, array $settings ) {
		$stage_featured_image = $this->should_stage_featured_image( $document, $settings );
		$attachment_id = $this->get_featured_image_id( $settings );
		$excerpt = $this->get_stageable_excerpt( $document, $settings );
		$staged_post_fields = $this->get_staged_post_fields( $settings, $stage_featured_image );
		unset( $settings[ self::FEATURED_IMAGE_SETTING ], $settings[ self::EXCERPT_SETTING ] );

		$target = Document_Mutation_Save::settings_preserving_live_status( $this->get_mutator(), $document, $settings );

		if ( is_wp_error( $target ) ) {
			return $target;
		}

		$target_id = (int) $target->get_post()->ID;

		if ( $stage_featured_image ) {
			$this->stage_featured_image( $target_id, $attachment_id );
		}

		$this->mark_staged_post_fields( $target_id, $staged_post_fields );

		if ( null === $excerpt ) {
			return $target;
		}

		$excerpt_result = $this->stage_excerpt( $target_id, $excerpt );

		if ( is_wp_error( $excerpt_result ) ) {
			return $excerpt_result;
		}

		$this->mark_staged_post_fields( $target_id, [ self::EXCERPT_SETTING ] );

		return $target;
	}

	/**
	 * Core stages a non-empty title on the autosave itself (`Page\Manager::ajax_before_save_settings`).
	 *
	 * @return string[]
	 */
	private function get_staged_post_fields( array $settings, bool $stage_featured_image ): array {
		$fields = [];

		if ( ! empty( $settings[ self::TITLE_SETTING ] ) ) {
			$fields[] = self::TITLE_SETTING;
		}

		if ( $stage_featured_image ) {
			$fields[] = self::FEATURED_IMAGE_SETTING;
		}

		return $fields;
	}

	private function mark_staged_post_fields( int $target_id, array $fields ): void {
		if ( ! $fields ) {
			return;
		}

		$already_staged = (array) get_metadata( 'post', $target_id, self::STAGED_POST_FIELDS_META_KEY, true );

		update_metadata( 'post', $target_id, self::STAGED_POST_FIELDS_META_KEY, array_values( array_unique( array_merge( array_filter( $already_staged ), $fields ) ) ) );
	}

	private function stage_featured_image( int $target_id, int $attachment_id ): void {
		if ( $attachment_id ) {
			update_metadata( 'post', $target_id, self::FEATURED_IMAGE_META_KEY, $attachment_id );

			return;
		}

		delete_metadata( 'post', $target_id, self::FEATURED_IMAGE_META_KEY );
	}

	/**
	 * An empty `page_template` stops `wp_update_post` from re-validating the revision's template, which would
	 * write `default` to the live post.
	 *
	 * @return true|\WP_Error
	 */
	private function stage_excerpt( int $target_id, string $excerpt ) {
		$updated = wp_update_post( wp_slash( [
			'ID' => $target_id,
			'post_excerpt' => $excerpt,
			'page_template' => '',
		] ), true );

		if ( is_wp_error( $updated ) ) {
			return new \WP_Error(
				'save_failed',
				sprintf(
					/* translators: %s: Error message returned by WordPress. */
					__( 'The settings were staged, but post_excerpt could not be saved to the draft copy: %s', 'elementor' ),
					$updated->get_error_message()
				),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		return true;
	}

	private function get_stageable_excerpt( Document $document, array $settings ): ?string {
		if ( ! isset( $settings[ self::EXCERPT_SETTING ] ) || ! post_type_supports( get_post_type( $document->get_main_id() ), 'excerpt' ) ) {
			return null;
		}

		return (string) $settings[ self::EXCERPT_SETTING ];
	}

	private function should_stage_featured_image( Document $document, array $settings ): bool {
		return isset( $settings[ self::FEATURED_IMAGE_SETTING ] ) && post_type_supports( get_post_type( $document->get_main_id() ), 'thumbnail' );
	}

	private function get_featured_image_id( array $settings ): int {
		return absint( $settings[ self::FEATURED_IMAGE_SETTING ]['id'] ?? 0 );
	}

	private function get_staged_message( Document $document, bool $is_staged ): ?string {
		if ( ! $is_staged ) {
			return null;
		}

		if ( $document instanceof Component_Document ) {
			return __( 'Settings saved to a draft copy of the component. Pages using it are unchanged until you call elementor/manage-component with action=publish.', 'elementor' );
		}

		return __( 'Settings saved to a draft copy. The live page is unchanged until you call elementor/publish-document.', 'elementor' );
	}

	private function get_mutator(): Document_Mutator {
		return $this->mutator ?? Document_Mutator::instance();
	}
}
