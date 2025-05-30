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

	public function get_items( $request ) {
		$data = $this->get_app()->get_kits();

		if ( is_wp_error( $data ) ) {
			return [
				'data' => [],
			];
		}

		$kits = ( new Collection( $data ) )->map( function ( $kit ) {
			return [
				'id' => $kit['id'],
				'title' => $kit['title'],
				'thumbnail_url' => $kit['thumbnailUrl'],
				'created_at' => $kit['createdAt'],
				'updated_at' => $kit['updatedAt'],
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
		return Plugin::$instance->modules_manager->get_modules( 'kits-library' )->get_cloud_api();
	}
}
