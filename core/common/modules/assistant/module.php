<?php

namespace Elementor\Core\Common\Modules\Assistant;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\RoleManager\Role_Manager;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Tools;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	public function __construct() {
		$this->add_template();

		add_action( 'elementor/ajax/register_actions', [ $this, 'register_ajax_actions' ] );
	}

	public function get_name() {
		return 'assistant';
	}

	public function add_template() {
		Plugin::$instance->common->add_template( __DIR__ . '/template.php' );
	}

	public function register_ajax_actions() {
		/** @var \Elementor\Core\Common\Modules\Ajax\Module $ajax */
		$ajax = Plugin::$instance->common->get_component( 'ajax' );

		$ajax->register_ajax_action( 'assistant_get_category_data', [ $this, 'ajax_get_category_data' ] );
	}

	public function ajax_get_category_data( $data ) {
		$post_types = get_post_types( [
			'exclude_from_search' => false,
		] );

		$post_types[] = Source_Local::CPT;

		$recently_edited_query_args = [
			'post_type' => $post_types,
			'post_status' => [ 'publish', 'draft' ],
			'posts_per_page' => '5',
			'meta_key' => '_elementor_edit_mode',
			'meta_value' => 'builder',
			'orderby' => 'modified',
			's' => $data['filter'],
		];

		$recently_edited_query = new \WP_Query( $recently_edited_query_args );

		$posts = [];

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

			$posts[] = [
				'icon' => $icon,
				'title' => $post->post_title,
				'description' => $description,
				'link' => get_permalink( $post ),
			];
		}

		return $posts;
	}

	protected function get_init_settings() {
		return [
			'data' => [
				'recently_edited' => [
					'title' => __( 'Recently Edited', 'elementor' ),
					'remote' => true,
					'items' => [],
				],
				'configurations' => [
					'title' => __( 'Configurations', 'elementor' ),
					'items' => [
						[
							'title' => __( 'Role Manager', 'elementor' ),
							'icon' => 'person',
							'link' => Role_Manager::get_url(),
						],
						[
							'title' => __( 'Maintenance Mode', 'elementor' ),
							'icon' => 'time-line',
							'link' => Tools::get_url() . '#tab-maintenance_mode',
						],
					],
				],
			],
			'i18n' => [
				'assistant' => __( 'Assistant', 'elementor' ),
			],
		];
	}
}
