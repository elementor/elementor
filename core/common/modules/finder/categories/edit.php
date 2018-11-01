<?php

namespace Elementor\Core\Common\Modules\Finder\Categories;

use Elementor\Core\Base\Document;
use Elementor\Core\Common\Modules\Finder\Base_Category;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Edit extends Base_Category {

	public function get_title() {
		return __( 'Edit', 'elementor' );
	}

	public function is_remote() {
		return true;
	}

	public function get_category_items( array $options = [] ) {
		$post_types = get_post_types( [
			'exclude_from_search' => false,
		] );

		$post_types[] = Source_Local::CPT;

		$document_types = Plugin::$instance->documents->get_document_types();

		unset( $document_types['widget'] );

		$recently_edited_query_args = [
			'post_type' => $post_types,
			'post_status' => [ 'publish', 'draft' ],
			'posts_per_page' => '10',
			'meta_query' => [
				[
					'key' => '_elementor_edit_mode',
					'value' => 'builder',
				],
				[
					'relation' => 'or',
					[
						'key' => Document::TYPE_META_KEY,
						'compare' => 'NOT EXISTS',
					],
					[
						'key' => Document::TYPE_META_KEY,
						'value' => array_keys( $document_types ),
					],
				],
			],
			'orderby' => 'modified',
			's' => $options['filter'],
		];

		$recently_edited_query = new \WP_Query( $recently_edited_query_args );

		$items = [];

		/** @var \WP_Post $post */
		foreach ( $recently_edited_query->posts as $post ) {
			$document = Plugin::$instance->documents->get( $post->ID );

			if ( ! $document ) {
				continue;
			}

			$is_template = Source_Local::CPT === $post->post_type;

			$description = $document->get_title();

			$icon = 'document-file';

			if ( $is_template ) {
				$description = __( 'Template', 'elementor' ) . ' / ' . $description;

				$icon = 'post-title';
			}

			$items[] = [
				'icon' => $icon,
				'title' => $post->post_title,
				'description' => $description,
				'link' => $document->get_edit_url(),
				'actions' => [
					[
						'name' => 'view',
						'link' => $document->get_permalink(),
						'icon' => 'eye',
					],
				],
			];
		}

		return $items;
	}
}
