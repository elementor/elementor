<?php

namespace Elementor\Modules\Components;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Plugin;
use Elementor\Core\Base\Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Components_Repository {

	public static function make(): Components_Repository {
		return new self();
	}

	public function all(): Collection {
		// Components count is limited to 100, if we increase this number, we need to iterate the posts in batches.
		$posts = get_posts( [
			'post_type' => Component_Document::TYPE,
			'post_status' => 'any',
			'posts_per_page' => Components_REST_API::MAX_COMPONENTS,
		] );

		$components = [];

		foreach ( $posts as $post ) {
			$component = $this->get( $post->ID );

			if ( ! $component ) {
				continue;
			}

			$components[] = [
				'id' => $component->get_main_id(),
				'title' => $component->get_post()->post_title,
				'uid' => $component->get_component_uid(),
				'is_archived' => $component->get_is_archived(),
				'styles' => $this->extract_styles( $component->get_elements_data() ),
			];
		}

		return Collection::make( $components );
	}

	public function get( $id, bool $include_autosave = true ) {
		$doc = $include_autosave
			? Plugin::$instance->documents->get_doc_or_auto_save( $id, get_current_user_id() )
			: Plugin::$instance->documents->get( $id );

		if ( ! $doc instanceof Component_Document ) {
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

		try {
			$saved = $document->save( [
				'elements' => $content,
				'settings' => $settings,
			] );
		} catch ( \Exception $e ) {
			$document->force_delete();
			throw $e;
		}

		if ( ! $saved ) {
			$document->force_delete();
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

	public function archive( array $ids, string $status ) {
		$failed_ids = [];
		$success_ids = [];

		foreach ( $ids as $id ) {
			try {
				$component = $this->get_component_for_edit( $id, $status );

				if ( ! $component ) {
					$failed_ids[] = $id;
					continue;
				}

				$component->archive();
				$success_ids[] = $id;
			} catch ( \Exception $e ) {
				$failed_ids[] = $id;
			}
		}

		return [
			'failedIds' => $failed_ids,
			'successIds' => $success_ids,
		];
	}

	public function update_title( int $component_id, string $title, string $status ): bool {
		$component = $this->get_component_for_edit( $component_id, $status );

		if ( ! $component ) {
			return false;
		}

		return $component->update_title( $title );
	}

	/**
	 * Get the component for edit.
	 *
	 * @param int    $component_id The component ID.
	 * @param string $target_status The target status, means the status the component should be saved as.
	 * @return ?Component_Document The component document for edit.
	 *
	 * If target status is an autosave / draft:
	 * - If the component main document is autosave / draft, it will return the main document.
	 * - If the component main document is published, it will create a new autosave document and return it.

	 * If target status is publish:
	 * - Will return the main document. If it's an autosave, it will be published later by the publish_component method.
	 */
	private function get_component_for_edit( int $component_id, string $target_status ): ?Component_Document {
		$component = $this->get( $component_id );

		if ( ! $component ) {
			return null;
		}

		$autosave_statuses = [ Document::STATUS_AUTOSAVE, Document::STATUS_DRAFT ];
		$autosave_exists = $component->is_autosave();
		$should_create_autosave = in_array( $target_status, $autosave_statuses, true ) && ! $autosave_exists;

		if ( ! $should_create_autosave ) {
			return $component;
		}

		// Create a new autosave document, based on the published version.
		return $component->get_autosave( 0, true );
	}

	public function publish_component( Component_Document $component ): bool {
		try {
			$main_id = $component->get_main_id();
			$main_component = $this->get( $main_id, false );

			$autosave = $main_component->get_newer_autosave();

			if ( $autosave ) {
				$success = $this->copy_autosave_data_to_main_component_document_and_publish( $autosave, $main_component, $main_id );
			} else {
				$success = $main_component->update_status( Document::STATUS_PUBLISH );
			}

			if ( ! $success ) {
				throw new \Exception( 'Failed to publish component' );
			}
		} catch ( \Exception $e ) {
			return false;
		}

		return true;
	}

	private function copy_autosave_data_to_main_component_document_and_publish( Component_Document $autosave, Component_Document $main_component_document, int $main_id ): bool {
		$autosave_id = $autosave->get_post()->ID;

		// Copy component custom meta keys from the autosave to the main component.
		Plugin::$instance->db->copy_elementor_meta( $autosave_id, $main_id, Component_Document::COMPONENT_CUSTOM_META_KEYS );

		$autosave_elements = $autosave->get_elements_data();
		$autosave_title = $autosave->get_post()->post_title;

		return $main_component_document->save( [
			'elements' => $autosave_elements,
			'settings' => [
				'post_status' => Document::STATUS_PUBLISH,
				'post_title' => $autosave_title,
			],
		] );
	}
}
