<?php

namespace Elementor\Modules\Design_System_Generator;

class Load_Posts_Meta {
	public function load() {
		$args = array(
			'post_type'      => 'any', // or 'post', 'page', or your custom post type
			'posts_per_page' => -1,
			'post_status'    => 'publish', // only published posts
			'meta_query'     => array(
				array(
					'key'     => '_elementor_edit_mode',
					'value'   => 'builder',
					'compare' => '=', // indicates it was edited with Elementor
				),
			),
		);
		$query = new \WP_Query($args);

		if ( ! $query->have_posts() ) {
			return [];
		}

		$posts = [];

		foreach ( $query->posts as $post ) {
			$posts[] = [
				'post_type' => $post->post_type,
				'post_id' => $post->ID,
				'meta_value' => $this->asArray( \get_post_meta( $post->ID, '_elementor_data', true ) ),
			];
		}
		return $posts;
	}

	private function asArray( $meta_value ) {
		return json_decode( $meta_value, true );
	}
}