<?php

namespace Elementor\Modules\Components;

use Elementor\Modules\Components\Documents\Component;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Components_Repository {

	public static function make(): Components_Repository {
		return new self();
	}

	/**
	 * Get all component documents
	 * 
	 * @return Component[]
	 */
	public function get_all(): array {
		$args = [
			'post_type' => 'component',
			'post_status' => 'publish',
			// 'meta_query' => [
			// 	[
			// 		'key' => '_elementor_template_type',
			// 		'value' => Component::get_type(),
			// 	],
			// ],
			'posts_per_page' => -1,
		];

		$posts = get_posts( $args );
		$components = [];

		foreach ( $posts as $post ) {
			try {
				$document = Plugin::$instance->documents->get( $post->ID );
				if ( $document instanceof Component ) {
					$components[] = $document;
				}
			} catch ( \Exception $e ) {
				// Skip invalid documents
				continue;
			}
		}

		return $components;
	}

	/**
	 * Create a new component
	 * 
	 * @param string $name Component name
	 * @param array $content Component content (elements)
	 * @return int|WP_Error Component ID or error
	 */
	public function create( string $name, array $content ) {
		if ( ! current_user_can( 'publish_posts' ) ) {
			return new \WP_Error( 'insufficient_permissions', __( 'Insufficient permissions', 'elementor' ) );
		}


		$document = Plugin::$instance->documents->create(
			Component::get_type(),
			[
				'post_title' => $name,
				'post_status' => 'publish',
			]
		);

		if ( is_wp_error( $document ) ) {
			return $document;
		}

		$document->save( [
			'elements' => $content,
		] );

		error_log('--------------------------------create end--------------------------------');
		error_log(print_r($document->get_elements_data(), true));

		error_log('--------------------------------get_post_types--------------------------------');
		error_log(print_r(get_post_types(), true));
		return $document->get_main_id();


		
	}
} 