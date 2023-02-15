<?php

namespace Elementor\Modules\DesignGuidelines\Components;

use Elementor\App\Modules\ImportExport\Utils;
use Elementor\Core\Base\Document;
use Elementor\Modules\DesignGuidelines\Documents\Design_Guidelines;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Design_Guidelines_Post {
	const OPTION_KEY = '_elementor_design_guidelines_post_id';

	public function __construct() {
		// add action in activation to create post? todo

		add_action( 'elementor/init', function() {
			$post = $this->get_post_id();
		} );

		//		add_action( 'init', [ $this, 'register_post_type' ] );
		//		add_action( 'pre_get_posts', [ $this, 'hide_post' ] ); todo - not working properly
	}

	public function hide_post( $query ) {
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
		if ( $_POST['action'] === 'heartbeat' ) {
			return 0;
		}

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

		$post_id = wp_insert_post( [
			'post_title' => 'Design Guidelines',
			'post_type' => Source_Local::CPT,
			'post_status' => 'publish',
			'meta_input' => [
				Document::BUILT_WITH_ELEMENTOR_META_KEY => 'builder',
			],
		] );

		if ( ! is_wp_error( $post_id ) ) {
			$json_data = Utils::read_json_file( ELEMENTOR_PATH . '/assets/data/design-guidelines.json' );
			$document = Plugin::$instance->documents->get( $post_id );

			if ( ! $document ) {
				return new WP_Error( 'elementor_design_guidelines_post', 'Could not get document' );
			}

			// TODO 14/02/2023 : Should be removed when bug is fixed in document->import
			if ( isset( $json_data['page_settings'] ) ) {
				$json_data['settings'] = $json_data['page_settings'];
			}

			$document->import( $json_data );

			// Meta is returned to default after import so we need to update it here
			$document->update_meta( '_wp_page_template', 'elementor_canvas' );

			// Update document type after import because Design Guidelines prevents saving
			$document->update_meta( Document::TYPE_META_KEY, Design_Guidelines::TYPE );
		}

		return $post_id;
	}
}

