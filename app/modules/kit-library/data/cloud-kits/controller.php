<?php
namespace Elementor\App\Modules\KitLibrary\Data\CloudKits;

use Elementor\App\Modules\KitLibrary\Connect\Cloud_Kits;
use Elementor\App\Modules\KitLibrary\Module as KitLibrary;
use Elementor\App\Modules\KitLibrary\Data\Base_Controller;
use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Controller extends Base_Controller {

	public function get_name() {
		return 'cloud-kits';
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

	public function delete_item( $request ) {
		return [
			'data' => $this->get_app()->delete_kit( $request->get_param( 'id' ) ),
		];
	}

	public function get_item( $request ) {
		return [
			'data' => $this->get_app()->get_kit( [ 'id' => $request->get_param( 'id' ) ] ),
		];
	}

	public function register_endpoints() {
		$this->index_endpoint->register_item_route( \WP_REST_Server::DELETABLE, [
			'id' => [
				'description' => 'Unique identifier for the object.',
				'type' => 'integer',
				'required' => true,
			],
		] );

		$this->register_endpoint( new Endpoints\Eligibility( $this ) );
	}

	public function get_permission_callback( $request ) {
		return current_user_can( 'manage_options' );
	}

	protected function get_app(): Cloud_Kits {
		return KitLibrary::get_cloud_app();
	}
}
