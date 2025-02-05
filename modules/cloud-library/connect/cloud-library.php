<?php
namespace Elementor\Modules\CloudLibrary\Connect;

use Elementor\Core\Common\Modules\Connect\Apps\Library;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Cloud_Library extends Library {
	const API_URL = 'https://my.elementor.com/api/v1';

	public function get_title(): string {
		return esc_html__( 'Cloud Library', 'elementor' );
	}

	protected function get_slug(): string {
		return 'cloud-library';
	}

	public function get_resources( $args = [] ): array {
		$templates = [];

		$endpoint = 'resources';
		if ( ! empty( $args['template_id'] ) ) {
			$endpoint .= '?parentId=' . $args['template_id'];
		}

		$cloud_templates = $this->http_request( 'GET', $endpoint, $args, [
			'return_type' => static::HTTP_RETURN_TYPE_ARRAY,
		] );

		if ( is_wp_error( $cloud_templates ) || ! is_array( $cloud_templates['data'] ) ) {
			return $templates;
		}

		foreach ( $cloud_templates['data'] as $cloud_template ) {
			$templates[] = $this->prepare_template( $cloud_template );
		}

		return $templates;
	}

	public function get_resource( array $args ): array {
		return $this->http_request( 'GET', 'resources/' . $args['template_id'], $args, [
			'return_type' => static::HTTP_RETURN_TYPE_ARRAY,
		] );
	}

	protected function prepare_template( array $template_data ): array {
		return [
			'template_id' => $template_data['id'],
			'source' => 'cloud',
			'type' => ucfirst( $template_data['templateType'] ),
			'subType' => $template_data['type'],
			'title' => $template_data['title'],
			'human_date' => date_i18n( get_option( 'date_format' ), strtotime( $template_data['createdAt'] ) ),
		];
	}

	public function delete_resource( $template_id ) {
		$request = $this->http_request( 'DELETE', 'resources/' . $template_id );

		if ( isset( $request->errors[ 204 ] ) && 'No Content' === $request->errors[ 204 ][ 0 ] ) {
            return true;
        }

		if ( is_wp_error( $request ) ) {
			return false;
		}

		return true;
	}

	public function update_resource( array $template_data ) {
		$endpoint = 'resources/' . $template_data['template_id'];

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
