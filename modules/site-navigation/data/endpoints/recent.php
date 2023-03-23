<?php

namespace Elementor\Modules\SiteNavigation\Data\Endpoints;

use Elementor\Core\Base\Document;
use Elementor\Core\Kits\Documents\Kit;
use Elementor\Data\V2\Base\Endpoint;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Utils;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Recent extends Endpoint {


	public function register_items_route( $methods = WP_REST_Server::READABLE, $args = [] ) {
		$args = [
			'posts_per_page' => [
				'description' => 'Number of posts to return',
				'type' => 'integer',
				'required' => true,
				'sanitize_callback' => 'absint',
				'validate_callback' => 'rest_validate_request_arg',
			],
			'post_type' => [
				'description' => 'Post types to retrieve',
				'type' => 'string',
				'required' => false,
				'default' => implode( ',', [ 'page', 'post', Source_Local::CPT ] ),
				'sanitize_callback' => 'sanitize_text_field',
				'validate_callback' => 'rest_validate_request_arg',
			],
			'post__not_in' => [
				'description' => 'Number of posts to return',
				'type' => 'string',
				'required' => false,
				'sanitize_callback' => 'sanitize_text_field',
				'validate_callback' => 'rest_validate_request_arg',
			],
		];

		parent::register_items_route( $methods, $args );
	}

	public function get_name() {
		return 'recent';
	}

	public function get_format() {
		return 'site-navigation/recent';
	}


	public function get_items( $request ) {
		$args = [
			'posts_per_page' => $request->get_param( 'posts_per_page' ),
			'post_type' => explode( ',', $request->get_param( 'post_type' ) ),
			'fields' => 'ids',
			// Exclude kits.
			'meta_query' => [
				[
					'key' => Document::TYPE_META_KEY,
					'value' => Kit::get_type(),
					'compare' => '!=',
				],
			],
		];

		$exclude = $request->get_param( 'post__not_in' );

		if ( ! empty( $exclude ) ) {
			$args['post__not_in'] = explode( ',', $exclude );
		}

		$recently_edited_query = Utils::get_recently_edited_posts_query( $args );

		$recent = [];

		if ( $recently_edited_query->have_posts() ) {
			while ( $recently_edited_query->have_posts() ) {
				$recently_edited_query->the_post();
				$document = Plugin::$instance->documents->get( get_the_ID() );

				$recent[] = [
					'id' => get_the_ID(),
					'title' => get_the_title(),
					'edit_url' => $document->get_edit_url(),
					'date_modified' => get_post_timestamp(),
					'type' => [
						'post_type' => get_post_type(),
						'doc_type' => $document->get_name(),
						'label' => $document->get_title(),
					],
				];
			}
		}

		return $recent;
	}
}
