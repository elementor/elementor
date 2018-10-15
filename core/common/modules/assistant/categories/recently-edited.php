<?php

namespace Elementor\Core\Common\Modules\Assistant\Categories;

use Elementor\Core\Base\Document;
use Elementor\Core\Common\Modules\Assistant\Base_Category;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Recently_Edited extends Base_Category {

	public function get_title() {
		return __( 'Recently Edited', 'elementor' );
	}

	public function is_remote() {
		return true;
	}

	public function get_category_items( array $options = [] ) {
		$post_types = get_post_types( [
			'exclude_from_search' => false,
		] );

		global $wpdb;

		$query = $wpdb->get_results( $wpdb->prepare(
			"SELECT ID FROM {$wpdb->posts} LEFT JOIN {$wpdb->postmeta} AS mt ON ID = mt.`post_id` LEFT JOIN {$wpdb->postmeta} AS mt1 ON ID = mt1.`post_id` LEFT JOIN {$wpdb->postmeta} AS mt2 ON ID = mt2.`post_id`
				WHERE ( post_title LIKE %s OR ( mt.`meta_key` = %s AND mt.`meta_value` = %s ) )
				AND post_status in ('publish', 'draft')
				AND mt1.`meta_key` = '_elementor_edit_mode'
				AND mt1.`meta_value` = 'builder'
				AND ( post_type in (%s) OR ( post_type = %s AND mt2.`meta_key` = %s AND mt2.`meta_value` != 'widget' ) )
				GROUP BY ID ORDER BY post_modified
				LIMIT 0,5",
			[
				'%' . $options['filter'] . '%',
				Document::TYPE_META_KEY,
				$options['filter'],
				implode( ',', $post_types ),
				Source_Local::CPT,
				Document::TYPE_META_KEY,
			]
		), ARRAY_A );

		$posts = [];

		foreach ( $query as $result ) {
			$document = Plugin::$instance->documents->get( $result['ID'] );

			if ( ! $document ) {
				continue;
			}

			$post = $document->get_post();

			$is_template = Source_Local::CPT === $post->post_type;

			if ( $is_template ) {
				$description = __( 'Template', 'elementor' ) . ' / ' . $document->get_title();

				$icon = 'post-title';
			} else {
				$description = $document->get_post_type_title();

				$icon = 'document-file';
			}

			$posts[] = [
				'icon' => $icon,
				'title' => $post->post_title,
				'description' => $description,
				'link' => $document->get_permalink(),
			];
		}

		return $posts;
	}
}
