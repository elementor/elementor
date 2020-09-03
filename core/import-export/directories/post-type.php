<?php

namespace Elementor\Core\Import_Export\Directories;

use Elementor\Core\Import_Export\Iterator;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Post_Type extends Base {

	private $post_type;

	protected function get_name() {
		return $this->post_type;
	}

	public function __construct( Iterator $iterator, Base $parent, $post_type ) {
		parent::__construct( $iterator, $parent );

		$this->post_type = $post_type;
	}

	public function export() {
		$only_elementor = 'page' === $this->post_type;

		$query_args = [
			'post_type' => $this->post_type,
			'post_status' => 'publish',
			'posts_per_page' => 20,
		];

		if ( $only_elementor ) {
			$query_args['meta_query'] = [
				[
					'key' => '_elementor_data',
					'compare' => 'EXISTS',
				],
				[
					'key' => '_elementor_data',
					'compare' => '!=',
					'value' => '[]',
				],
			];
		}

		$query = new \WP_Query( $query_args );

		$manifest_data = [];

		foreach( $query->posts as $post ) {
			$manifest_data[] = [
				'id' => $post->ID,
				'title' => $post->post_title,
				'post_type' => $this->post_type,
				'thumbnail' => get_the_post_thumbnail_url( $post ),
				'url' => get_permalink( $post )
			];

			$document = Plugin::$instance->documents->get( $post->ID );

			if ( $only_elementor || $document->is_built_with_elementor() ) {
				$post_data = $document->get_export_data();
			} else {
				$post_data = [
					'content' => $post->post_content,
				];
			}

			$this->exporter->add_json_file( $post->ID, $post_data );
		}

		return $manifest_data;
	}
}
