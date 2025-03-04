<?php
namespace Elementor\Modules\CloudLibrary\Connect;

use Elementor\Core\Common\Modules\Connect\Apps\Library;
use Elementor\Modules\CloudLibrary\Render_Mode_Preview;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Cloud_Library extends Library {
//	const API_URL = 'https://my.elementor.com/api/v1';
	const API_URL = 'http://localhost:3000/api/v1';

	public function get_title(): string {
		return esc_html__( 'Cloud Library', 'elementor' );
	}

//	protected function get_slug(): string {
//		return 'cloud-library';
//	}

	protected function get_api_url()
	{
		return 'http://localhost:3000/api/v1/cloud-library';
	}

	public function get_resources( $args = [] ): array {
		$templates = [];

		$endpoint = 'resources';

		$query_string = http_build_query( [
			'limit' => $args['limit'] ? (int) $args['limit'] : null,
			'offset' => $args['offset'] ? (int) $args['offset'] : null,
			'search' => $args['search'],
			'parentId' => $args['parentId'],
			'templateType' => $args['templateType'] ?? null,
		] );

		$endpoint .= '?' . $query_string;

		$cloud_templates = $this->http_request( 'GET', $endpoint, $args, [
			'return_type' => static::HTTP_RETURN_TYPE_ARRAY,
		] );

		if ( is_wp_error( $cloud_templates ) || ! is_array( $cloud_templates['data'] ) ) {
			return $templates;
		}

		foreach ( $cloud_templates['data'] as $cloud_template ) {
			$templates[] = $this->prepare_template( $cloud_template );
		}

		return [
			'templates' => $templates,
			'total' => $cloud_templates['total'],
		];
	}

	public function get_resource( array $args ): array {
		return $this->http_request( 'GET', 'resources/' . $args['id'], $args, [
			'return_type' => static::HTTP_RETURN_TYPE_ARRAY,
		] );
	}

	protected function prepare_template( array $template_data ): array {
		$template_id = $template_data['id'];

		$query_args = [
			'preview' => true,
			'render_mode_nonce' => wp_create_nonce( 'render_mode_' . $template_id ),
			'template_id' => $template_id,
			'render_mode' => Render_Mode_Preview::MODE,
		];

		$preview_url = set_url_scheme( add_query_arg( $query_args, site_url() ) );

		return [
			'template_id' => $template_id,
			'source' => 'cloud',
			'type' => $template_data['templateType'],
			'subType' => $template_data['type'],
			'title' => $template_data['title'],
			'author' => $template_data['authorEmail'],
			'human_date' => date_i18n( get_option( 'date_format' ), strtotime( $template_data['createdAt'] ) ),
			'export_link' => $this->get_export_link( $template_data['id'] ),
			'hasPageSettings' => $template_data['hasPageSettings'],
			'parentId' => $template_data['parentId'],
			'preview_url' => $preview_url,
		];
	}

	private function get_export_link( $template_id ) {
		return add_query_arg(
			[
				'action' => 'elementor_library_direct_actions',
				'library_action' => 'export_template',
				'source' => 'cloud',
				'_nonce' => wp_create_nonce( 'elementor_ajax' ),
				'template_id' => $template_id,
			],
			admin_url( 'admin-ajax.php' )
		);
	}

	public function post_resource( $data ): array {
		$resource = [
			'headers' => [
				'Content-Type' => 'application/json',
			],
			'body' => wp_json_encode( $data ),
		];

		return $this->http_request( 'POST', 'resources', $resource, [
			'return_type' => static::HTTP_RETURN_TYPE_ARRAY,
		] );
	}

	public function delete_resource( $template_id ): bool {
		$request = $this->http_request( 'DELETE', 'resources/' . $template_id );

		if ( isset( $request->errors[204] ) && 'No Content' === $request->errors[204][0] ) {
			return true;
		}

		if ( is_wp_error( $request ) ) {
			return false;
		}

		return true;
	}

	public function update_resource( array $template_data ) {
		$endpoint = 'resources/' . $template_data['id'];

		$request = $this->http_request( 'PATCH', $endpoint, [ 'body' => $template_data ], [
			'return_type' => static::HTTP_RETURN_TYPE_ARRAY,
		] );

		if ( is_wp_error( $request ) ) {
			return false;
		}

		return true;
	}

	protected function init() {}
}
