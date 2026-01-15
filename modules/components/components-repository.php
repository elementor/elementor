<?php

namespace Elementor\Modules\Components;

use Elementor\Core\Base\Document;
use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Core\Utils\Api\Parse_Result;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\Components\Documents\Component;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Components_Repository {

	public static function make(): Components_Repository {
		return new self();
	}

	public function all() {
		// Components count is limited to 50, if we increase this number, we need to iterate the posts in batches.
		$posts = get_posts( [
			'post_type' => Component_Document::TYPE,
			'post_status' => 'any',
			'posts_per_page' => Components_REST_API::MAX_COMPONENTS,
		] );

		$components = [];

		foreach ( $posts as $post ) {
			$doc = Plugin::$instance->documents->get( $post->ID );

			if ( ! $doc || ! $doc instanceof Component_Document ) {
				continue;
			}

			$components[] = [
				'id' => $doc->get_main_id(),
				'title' => $doc->get_post()->post_title,
				'uid' => $doc->get_component_uid(),
				'is_archived' => (bool) $doc->get_is_archived(),
				'styles' => $this->extract_styles( $doc->get_elements_data() ),
			];
		}

		return Collection::make( $components );
	}

	public function get( $id, bool $include_autosave = false ) {
		$should_get_autosave = $include_autosave || is_preview();

		$doc = $should_get_autosave
			? Plugin::$instance->documents->get_doc_or_auto_save( $id, get_current_user_id() )
			: Plugin::$instance->documents->get( $id );

		if ( ! $doc instanceof Component ) {
			return null;
		}

		return $doc;
	}

	public function create( string $title, array $content, string $status, string $uid, array $settings = [] ) {
		$document = Plugin::$instance->documents->create(
			Component_Document::get_type(),
			[
				'post_title' => $title,
				'post_status' => $status,
			],
			[
				Component_Document::COMPONENT_UID_META_KEY => $uid,
			]
		);

		$saved = $document->save( [
			'elements' => $content,
			'settings' => $settings,
		] );

		if ( ! $saved ) {
			throw new \Exception( 'Failed to create component' );
		}

		return $document->get_main_id();
	}
	private function extract_styles( array $elements, array $styles = [] ) {
		foreach ( $elements as $element ) {
			if ( isset( $element['styles'] ) ) {
				$styles = array_merge( $styles, $element['styles'] );
			}

			if ( isset( $element['elements'] ) ) {
				$styles = $this->extract_styles( $element['elements'], $styles );
			}
		}

		return $styles;
	}

	public function put(
		array $created_items,
		array $published_ids,
		array $archived_ids,
		array $renamed_items,
		string $status
	): array {
		$created_result = $this->create_new_components( $created_items, $status );
		$update_results = $this->update_existing_components( $published_ids, $archived_ids, $renamed_items, $status );

		return [
			'created' => $created_result,
			'published' => $update_results['published'],
			'archived' => $update_results['archived'],
			'renamed' => $update_results['renamed'],
		];
	}

	private function create_new_components( array $items, string $status ): array {
		$result = [ 'success' => [], 'failed' => [] ];

		if ( empty( $items ) ) {
			return $result;
		}

		$existing_components = $this->all();

		$batch_validation = $this->validate_batch( $items, $existing_components );
		if ( ! $batch_validation->is_valid() ) {
			return $this->fail_all_items( $items, $batch_validation->errors()->to_string() );
		}

		$create_status = Document::STATUS_AUTOSAVE === $status
			? Document::STATUS_DRAFT
			: $status;

		$unsaved_components = $this->build_unsaved_components_map( $items );

		foreach ( $items as $item ) {
			$uid = $item['uid'];
			$settings = $item['settings'] ?? [];

			if ( isset( $settings['validation_error'] ) ) {
				$result['failed'][] = [
					'uid' => $uid,
					'error' => $settings['validation_error'],
				];
				continue;
			}

			$validation = $this->validate_single_component_to_create( $item, $existing_components, $unsaved_components );

			if ( ! $validation->is_valid() ) {
				$result['failed'][] = [
					'uid' => $uid,
					'error' => $validation->errors()->to_string(),
				];
				continue;
			}

			try {
				$component_id = $this->create(
					$item['title'],
					$item['elements'],
					$create_status,
					$item['uid'],
					$settings
				);
				$result['success'][ $uid ] = $component_id;
			} catch ( \Exception $e ) {
				$result['failed'][] = [
					'uid' => $uid,
					'error' => $e->getMessage(),
				];
				continue;
			}
		}

		return $result;
	}

	private function fail_all_items( array $items, string $error ): array {
		$failed = [];

		foreach ( $items as $item ) {
			$failed[] = [
				'uid' => $item['uid'],
				'error' => $error,
			];
		}

		return [ 'success' => [], 'failed' => $failed ];
	}

	private function validate_batch( array $items, Collection $existing_components ): Parse_Result {
		$result = Parse_Result::make();

		$total_count = $existing_components->count() + count( $items );
		if ( $total_count > Components_REST_API::MAX_COMPONENTS ) {
			$result->errors()->add( 'count', esc_html__( 'Maximum number of components exceeded', 'elementor' ) );
			return $result;
		}

		$duplicates_result = $this->validate_internal_duplicates( $items );
		$result->errors()->merge( $duplicates_result->errors() );

		return $result;
	}

	private function validate_internal_duplicates( array $items ): Parse_Result {
		$result = Parse_Result::make();
		$titles = [];
		$uids = [];

		foreach ( $items as $item ) {
			$title = $item['title'];
			$uid = $item['uid'];

			if ( isset( $titles[ $title ] ) ) {
				$result->errors()->add(
					'title',
					sprintf( esc_html__( "Duplicate title '%s' in request", 'elementor' ), $title )
				);
			}
			$titles[ $title ] = true;

			if ( isset( $uids[ $uid ] ) ) {
				$result->errors()->add(
					'uid',
					sprintf( esc_html__( "Duplicate uid '%s' in request", 'elementor' ), $uid )
				);
			}
			$uids[ $uid ] = true;
		}

		return $result;
	}

	private function build_unsaved_components_map( array $items ): array {
		$map = [];

		foreach ( $items as $item ) {
			$map[ $item['uid'] ] = $item['elements'] ?? [];
		}

		return $map;
	}

	private function validate_single_component_to_create( array $item, Collection $existing_components, array $unsaved_components ): Parse_Result {
		$result = Parse_Result::make();

		$duplicates_result = $this->validate_duplicates_against_existing( $item, $existing_components );
		$result->errors()->merge( $duplicates_result->errors() );

		$elements_result = $this->validate_non_atomic_elements( $item );
		$result->errors()->merge( $elements_result->errors() );

		$circular_result = $this->validate_circular_dependency( $item, $unsaved_components );
		$result->errors()->merge( $circular_result->errors() );

		return $result;
	}

	private function validate_duplicates_against_existing( array $item, Collection $existing_components ): Parse_Result {
		$result = Parse_Result::make();
		$title = $item['title'];
		$uid = $item['uid'];

		$has_duplicate_title = $existing_components->some(
			fn( $component ) => ! ( $component['is_archived'] ?? false ) && $component['title'] === $title
		);

		if ( $has_duplicate_title ) {
			$result->errors()->add(
				'title',
				sprintf( esc_html__( "Component title '%s' already exists", 'elementor' ), $title )
			);
		}

		$has_duplicate_uid = $existing_components->some(
			fn( $component ) => $component['uid'] === $uid
		);

		if ( $has_duplicate_uid ) {
			$result->errors()->add(
				'uid',
				sprintf( esc_html__( "Component uid '%s' already exists", 'elementor' ), $uid )
			);
		}

		return $result;
	}

	private function validate_non_atomic_elements( array $item ): Parse_Result {
		$result = Parse_Result::make();
		$elements = $item['elements'] ?? [];
		$validation = Non_Atomic_Widget_Validator::make()->validate( $elements );

		if ( ! $validation['success'] ) {
			$result->errors()->add( 'elements', $validation['messages'][0] ?? 'Invalid elements' );
		}

		return $result;
	}

	private function validate_circular_dependency( array $item, array $unsaved_components ): Parse_Result {
		$result = Parse_Result::make();
		$uid = $item['uid'];
		$elements = $item['elements'] ?? [];
		$validation = Circular_Dependency_Validator::make()->validate( $uid, $elements, $unsaved_components );

		if ( ! $validation['success'] ) {
			$result->errors()->add( 'circular', $validation['messages'][0] ?? 'Circular dependency detected' );
		}

		return $result;
	}

	private function update_existing_components(
		array $published_ids,
		array $archived_ids,
		array $renamed_items,
		string $status
	): array {
		$results = [
			'published' => [ 'successIds' => [], 'failed' => [] ],
			'archived' => [ 'successIds' => [], 'failed' => [] ],
			'renamed' => [ 'successIds' => [], 'failed' => [] ],
		];

		$titles_map = [];
		foreach ( $renamed_items as $item ) {
			$titles_map[ $item['id'] ] = $item['title'];
		}

		$renamed_ids = array_keys( $titles_map );
		$all_ids = array_unique( array_merge( $published_ids, $archived_ids, $renamed_ids ) );

		foreach ( $all_ids as $id ) {
			$component = $this->get( $id, true );

			if ( ! $component ) {
				$results = $this->add_failed_for_missing_component( $results, $id, $published_ids, $archived_ids, $titles_map );
				continue;
			}

			$rename_result = $this->rename_component( $component, $id, $titles_map );
			$results['renamed'] = $this->merge_result( $results['renamed'], $id, $rename_result );

			$archive_result = $this->archive_component( $component, $id, $archived_ids );
			$results['archived'] = $this->merge_result( $results['archived'], $id, $archive_result );

			$publish_result = $this->publish_component( $component, $id, $published_ids, $status );
			$results['published'] = $this->merge_result( $results['published'], $id, $publish_result );
		}

		return $results;
	}

	private function merge_result( array $results, int $id, ?Parse_Result $result ): array {
		if ( null === $result ) {
			return $results;
		}

		if ( $result->is_valid() ) {
			$results['successIds'][] = $id;
		} else {
			$results['failed'][] = [ 'id' => $id, 'error' => $result->errors()->to_string() ];
		}

		return $results;
	}

	private function rename_component( Component $component, int $id, array $titles_map ): ?Parse_Result {
		if ( ! isset( $titles_map[ $id ] ) ) {
			return null;
		}

		$result = Parse_Result::make();
		$success = $component->update_title( $titles_map[ $id ] );

		if ( ! $success ) {
			$result->errors()->add( 'rename', 'Failed to update title' );
		}

		return $result;
	}

	private function archive_component( Component $component, int $id, array $archived_ids ): ?Parse_Result {
		if ( ! in_array( $id, $archived_ids, true ) ) {
			return null;
		}

		$result = Parse_Result::make();

		try {
			$component->archive();
		} catch ( \Exception $e ) {
			$result->errors()->add( 'archive', $e->getMessage() );
		}

		return $result;
	}

	private function publish_component( Component $component, int $id, array $published_ids, string $status ): ?Parse_Result {
		if ( ! in_array( $id, $published_ids, true ) || Document::STATUS_PUBLISH !== $status ) {
			return null;
		}

		$result = Parse_Result::make();

		try {
			$main_id = $component->get_main_id();
			$autosave = $component->get_newer_autosave();
	
			if ( $autosave ) {
				$autosave_id = $autosave->get_post()->ID;
	
				Plugin::$instance->db->copy_elementor_meta( $autosave_id, $main_id );
	
				$post_css = Post_CSS::create( $main_id );
				$post_css->update();
	
				wp_delete_post_revision( $autosave_id );
			}
	
			/** @var Component $main_component */
			$main_component = Plugin::$instance->documents->get( $main_id );
			$success = $main_component->publish();
	
			if ( ! $success ) {
				throw new \Exception( 'Failed to publish component' );
			}
		} catch ( \Exception $e ) {
			$result->errors()->add( 'publish', $e->getMessage() );
		}

		return $result;
	}

	private function add_failed_for_missing_component(
		array $results,
		int $id,
		array $published_ids,
		array $archived_ids,
		array $titles_map
	): array {
		$error = 'Component not found';

		if ( in_array( $id, $published_ids, true ) ) {
			$results['published']['failed'][] = [ 'id' => $id, 'error' => $error ];
		}
		if ( in_array( $id, $archived_ids, true ) ) {
			$results['archived']['failed'][] = [ 'id' => $id, 'error' => $error ];
		}
		if ( isset( $titles_map[ $id ] ) ) {
			$results['renamed']['failed'][] = [ 'id' => $id, 'error' => $error ];
		}

		return $results;
	}
}
