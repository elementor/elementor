<?php
namespace Elementor\App\Modules\KitLibrary\Data\KitsCloud;

use Elementor\Modules\CloudLibrary\Connect\Cloud_Library;
use Elementor\App\Modules\KitLibrary\Data\Base_Controller;
use Elementor\Core\Utils\Collection;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Controller extends Base_Controller {

	public function get_name() {
		return 'kits-cloud';
	}

	public function get_collection_params() {
		return [
			'force' => [
				'description' => 'Force an API request and skip the cache.',
				'required' => false,
				'default' => false,
				'type' => 'boolean',
			],
		];
	}

	public function get_items( $request ) {
		$data = $this->get_app()->get_kits();

		$kits = ( new Collection( $data ) )->map( function ( $kit ) {
			return [
				'id' => $kit['id'],
				'title' => $kit['title'],
				'thumbnail_url' => isset( $kit['thumbnailUrl'] ) ? $kit['thumbnailUrl'] : null,
				'created_at' => isset( $kit['created_at'] ) ? $kit['created_at'] : null,
				'updated_at' => isset( $kit['updated_at'] ) ? $kit['updated_at'] : null,
			];
		} );

		return [
			'data' => $kits->values(),
		];
	}

	public function get_permission_callback( $request ) {
		return current_user_can( 'manage_options' );
	}

	protected function get_app(): Cloud_Library {
		$cloud_library_app = Plugin::$instance->common->get_component( 'connect' )->get_app( 'cloud-library' );

		if ( ! $cloud_library_app ) {
			$error_message = esc_html__( 'Cloud-Library is not instantiated.', 'elementor' );

			throw new \Exception( $error_message, Exceptions::FORBIDDEN ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		return $cloud_library_app;
	}
}
