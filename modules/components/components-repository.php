<?php

namespace Elementor\Modules\Components;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\Components\Documents\Component;
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

	public function all( bool $filter_out_archived = false ) {
		// Components count is limited to 50, if we increase this number, we need to iterate the posts in batches.
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

			$is_archived = $component->get_is_archived();

			if ( $filter_out_archived && $is_archived ) {
				continue;
			}

			$components[] = [
				'id' => $component->get_main_id(),
				'title' => $component->get_post()->post_title,
				'uid' => $component->get_component_uid(),
				'is_archived' => $is_archived,
				'styles' => $this->extract_styles( $component->get_elements_data() ),
			];
		}

		return Collection::make( $components );
	}

	public function get( $id, bool $include_autosave = true ) {
		$doc = $include_autosave
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

	public function archive( $ids ) {
		$failed_ids = [];
		$success_ids = [];

		foreach ( $ids as $id ) {
			try {
				$component = $this->get( $id );

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

	public function update_title( $component_id, $title ) {
		$component = $this->get( $component_id );

		if ( ! $component ) {
			return false;
		}

		return $component->update_title( $title );
	}

	public function publish_component( Component $component ): bool {
		try {
			$main_id = $component->get_main_id();
			$main_component = $this->get( $main_id, false );

			$autosave = $main_component->get_newer_autosave();

			if ( $autosave ) {
				$autosave_id = $autosave->get_post()->ID;

				// Copy component custom meta keys from the autosave to the main component.
				Plugin::$instance->db->copy_elementor_meta( $autosave_id, $main_id, Component_Document::COMPONENT_CUSTOM_META_KEYS );

				$autosave_elements = $autosave->get_elements_data();
				$autosave_title = $autosave->get_post()->post_title;

				$success = $main_component->save( [
					'elements' => $autosave_elements,
					'settings' => [
						'post_status' => Document::STATUS_PUBLISH,
						'post_title' => $autosave_title,
					],
				] );
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
}
