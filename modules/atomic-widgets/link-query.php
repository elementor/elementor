<?php

namespace Elementor\Modules\AtomicWidgets;

use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Todo: Rework with REST API as part of ED-16723
 */
trait Link_Query {
	private function get_post_query(): array {
		$excluded_types = $this->get_excluded_post_types();
		$posts_map = $this->get_posts_per_post_type_map( $excluded_types );
		$options = new Collection( [] );

		foreach ( $posts_map as $post_type_slug => $data ) {
			$options = $options->union( $this->get_formatted_post_options( $data['items'], $posts_map[ $post_type_slug ]['label'] ) );
		}

		return $options->all();
	}

	private function get_excluded_post_types( ?array $additional_exclusions = [] ) {
		return array_merge( [ 'e-floating-buttons', 'e-landing-page', 'elementor_library', 'attachment' ], $additional_exclusions );
	}

	private function get_formatted_post_options( $items, $group_label ) {
		$options = [];

		foreach ( $items as $post ) {
			$options[ $post->guid ] = [
				'label' => $post->post_title,
				'groupLabel' => $group_label,
			];
		}

		return $options;
	}

	private function get_posts_per_post_type_map( $excluded_types = [] ) {
		$post_types = new Collection( get_post_types( [ 'public' => true ], 'object' ) );

		if ( ! empty( $excluded_types ) ) {
			$post_types = $post_types->filter( function( $post_type ) use ( $excluded_types ) {
				return ! in_array( $post_type->name, $excluded_types, true );
			} );
		}

		$post_type_slugs = $post_types->map( function( $post_type ) {
			return $post_type->name;
		} );

		$posts = new Collection( get_posts( [
			'post_type' => $post_type_slugs->all(),
			'numberposts' => -1,
		] ) );

		return $posts->reduce( function ( $carry, $post ) use ( $post_types ) {
			$post_type_label = $post_types->get( $post->post_type )->label;

			if ( ! isset( $carry[ $post->post_type ] ) ) {
				$carry[ $post->post_type ] = [
					'label' => $post_type_label,
					'items' => [],
				];
			}

			$carry[ $post->post_type ]['items'][] = $post;

			return $carry;
		}, [] );
	}
}
