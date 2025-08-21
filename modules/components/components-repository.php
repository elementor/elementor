<?php

namespace Elementor\Modules\Components;

use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Plugin;
use Elementor\Core\Utils\Api\Error_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Components_Repository {

	public static function make(): Components_Repository {
		return new self();
	}

	public function all() {
		$posts = get_posts( [
			'post_type' => Component_Document::TYPE,
			'post_status' => 'publish',
			'posts_per_page' => -1,
		] );

		$components = [];
		$styles = [];
		foreach ( $posts as $post ) {
			$doc = Plugin::$instance->documents->get( $post->ID );

			if ( ! $doc ) {
				continue;
			}

			$components[] = $doc;
			$styles[ $doc->get_main_id() ] = $this->extract_styles( $doc->get_elements_data() );
		}

		return Components::make( $components, $styles );
	}

	public function create( string $name, array $content ) {
		$document = Plugin::$instance->documents->create(
			Component_Document::get_type(),
			[
				'post_title' => $name,
				'post_status' => 'publish',
			]
		);

		try {
			$saved = $document->save( [
				'elements' => $content,
			] );

			if ( ! $saved ) {
				throw new \Exception( 'Failed to create component' );
			}

			return [
				'component_id' => $document->get_main_id(),
				'error' => null,
			];
		} catch ( \Exception $e ) {
			$error_message = $e->getMessage();
			
			if ( str_contains( $error_message, 'validation failed' ) || str_contains( $error_message, 'Invalid data' ) ) {
				return [
					'component_id' => null,
					'error' => Error_Builder::make( 'content_validation_failed' )
											->set_status( 400 )
											->set_message( $error_message )
											->build(),
				];
			}

			throw $e;
		}
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
