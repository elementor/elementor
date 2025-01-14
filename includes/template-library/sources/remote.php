<?php
namespace Elementor\TemplateLibrary;

use Elementor\Api;
use Elementor\Core\Common\Modules\Connect\Module as ConnectModule;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor template library remote source.
 *
 * Elementor template library remote source handler class is responsible for
 * handling remote templates from Elementor.com servers.
 *
 * @since 1.0.0
 */
class Source_Remote extends Source_Remote_Base {

	const API_TEMPLATES_URL = 'https://my.elementor.com/api/connect/v1/library/templates';

	/**
	 * Get remote template ID.
	 *
	 * Retrieve the remote template ID.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string The remote template ID.
	 */
	public function get_id() {
		return 'remote';
	}

	/**
	 * Get remote template title.
	 *
	 * Retrieve the remote template title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string The remote template title.
	 */
	public function get_title() {
		return esc_html__( 'Remote', 'elementor' );
	}

	/**
	 * Register remote template data.
	 *
	 * Used to register custom template data like a post type, a taxonomy or any
	 * other data.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function register_data() {}

	/**
	 * Get the templates from a remote server and set a transient.
	 *
	 * @param string $editor_layout_type
	 * @return array
	 */
	protected function get_templates( string $editor_layout_type ): array {
		$templates_data_cache_key = static::TEMPLATES_DATA_TRANSIENT_KEY_PREFIX . ELEMENTOR_VERSION;

		$templates_data = $this->get_templates_remotely( $editor_layout_type );

		if ( empty( $templates_data ) ) {
			return [];
		}

		set_transient( $templates_data_cache_key, $templates_data, 12 * HOUR_IN_SECONDS );

		return $templates_data;
	}

	/**
	 * Fetch templates from the remote server.
	 *
	 * @param string $editor_layout_type
	 * @return array|false
	 */
	protected function get_templates_remotely( string $editor_layout_type ) {
		$response = wp_remote_get( static::API_TEMPLATES_URL, [
			'body' => $this->get_templates_body_args( $editor_layout_type ),
		] );

		if ( is_wp_error( $response ) || 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
			return false;
		}

		$templates_data = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( empty( $templates_data ) || ! is_array( $templates_data ) ) {
			return [];
		}

		return $templates_data;
	}

	/**
	 * Prepare the body arguments for the remote request.
	 *
	 * @param string $editor_layout_type
	 *
	 * @return array
	 */
	protected function get_templates_body_args( string $editor_layout_type ): array {
		return [
			'plugin_version' => ELEMENTOR_VERSION,
			'editor_layout_type' => $editor_layout_type,
		];
	}

	/**
	 * @since 2.2.0
	 * @access private
	 */
	protected function prepare_template( array $template_data ) {
		$favorite_templates = $this->get_user_meta( 'favorites' );

		// BC: Support legacy APIs that don't have access tiers.
		if ( isset( $template_data['access_tier'] ) ) {
			$access_tier = $template_data['access_tier'];
		} else {
			$access_tier = 0 === $template_data['access_level']
				? ConnectModule::ACCESS_TIER_FREE
				: ConnectModule::ACCESS_TIER_ESSENTIAL;
		}

		return [
			'template_id' => $template_data['id'],
			'source' => $this->get_id(),
			'type' => $template_data['type'],
			'subtype' => $template_data['subtype'],
			'title' => $template_data['title'],
			'thumbnail' => $template_data['thumbnail'],
			'date' => $template_data['tmpl_created'],
			'author' => $template_data['author'],
			'tags' => json_decode( $template_data['tags'] ),
			'isPro' => ( '1' === $template_data['is_pro'] ),
			'accessLevel' => $template_data['access_level'],
			'accessTier' => $access_tier,
			'popularityIndex' => (int) $template_data['popularity_index'],
			'trendIndex' => (int) $template_data['trend_index'],
			'hasPageSettings' => ( '1' === $template_data['has_page_settings'] ),
			'url' => $template_data['url'],
			'favorite' => ! empty( $favorite_templates[ $template_data['id'] ] ),
		];
	}
}
