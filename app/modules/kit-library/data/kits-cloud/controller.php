<?php
namespace Elementor\App\Modules\KitLibrary\Data\KitsCloud;

use Elementor\App\Modules\KitLibrary\Connect\Cloud_Kits;
use Elementor\App\Modules\KitLibrary\Module as KitLibrary;
use Elementor\App\Modules\KitLibrary\Data\Base_Controller;
use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Controller extends Base_Controller {

	public function get_name() {
		return 'kits-cloud';
	}

	public function get_items( $request ) {
		$data = $this->get_app()->get_all();

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

	public function register_endpoints() {
		$this->register_endpoint( new Endpoints\Eligibility( $this ) );
	}

	public function get_permission_callback( $request ) {
		return current_user_can( 'manage_options' );
	}

	protected function get_app(): Cloud_Kits {
		return KitLibrary::get_cloud_api();
	}
}
