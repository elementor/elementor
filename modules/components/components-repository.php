<?php

namespace Elementor\Modules\Components;

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

	public function archive( $ids ) {
		$failed_ids = [];
		$success_ids = [];

		foreach ( $ids as $id ) {
			try {
				$doc = Plugin::$instance->documents->get( $id );

				if ( ! $doc instanceof Component_Document ) {
					$failed_ids[] = $id;
					continue;
				}

				$doc->archive();
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
}
