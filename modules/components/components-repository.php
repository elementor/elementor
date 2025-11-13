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
				'styles' => $this->extract_styles( $doc->get_elements_data() ),
			];
		}

		return Collection::make( $components );
	}

	public function get( $id ) {
		$doc = Plugin::$instance->documents->get( $id );

		if ( ! $doc instanceof Component ) {
			return null;
		}

		return $doc;
	}

	public function create( string $title, array $content, string $status, string $uid ) {
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
}
