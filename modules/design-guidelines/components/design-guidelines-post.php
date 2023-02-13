<?php

namespace Elementor\Modules\DesignGuidelines\Components;

use Elementor\Core\Base\Document;
use Elementor\Modules\DesignGuidelines\Documents\Design_Guidelines;
use Elementor\TemplateLibrary\Source_Local;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Design_Guidelines_Post {
	const OPTION_KEY = '_elementor_design_guidelines_post_id';
	const POST_TYPE = 'design-guidelines';

	public function __construct() {
		// add action in activation to create post? todo

		add_action( 'init', [ $this, 'register_post_type' ] );

		add_action( 'pre_get_posts', [ $this, 'hide_post' ] );
	}

	public function hide_post($query) {
		return; // todo
		// get current meta_query
		$meta_query = (array) $query->get( 'meta_query' );

		// exclude meta query
		$meta_query[] = [
			'key' => Document::TYPE_META_KEY,
			'value' => Design_Guidelines::TYPE,
			'compare' => '!=',
		];
		// set new meta query
		$query->set( 'meta_query', $meta_query );
	}


	public function get_post_id(): int {
		$post_id = get_option( self::OPTION_KEY );

		if ( ! $post_id ) {
			$post_id = $this->create_post();

			if ( ! is_wp_error( $post_id ) ) {
				update_option( self::OPTION_KEY, $post_id );
			}
		}

		return $post_id;
	}

	/**
	 * @return int|WP_Error
	 */
	private function create_post() {

		//TODO insert skeleton content

		return wp_insert_post( [
			'post_title' => 'Design Guidelines',
			'post_type' => Source_Local::CPT,
			'post_status' => 'publish',
			'meta_input' => [
				Document::TYPE_META_KEY => 'design-guidelines',
				Document::BUILT_WITH_ELEMENTOR_META_KEY => 'builder',
				'_wp_page_template' => 'elementor_canvas',
			],
		] );
	}
}

