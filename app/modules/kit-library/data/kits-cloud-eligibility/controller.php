<?php
namespace Elementor\App\Modules\KitLibrary\Data\KitsCloudEligibility;

use Elementor\Modules\CloudLibrary\Connect\Cloud_Library;
use Elementor\App\Modules\KitLibrary\Module as KitLibrary;
use Elementor\App\Modules\KitLibrary\Data\Base_Controller;
use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Controller extends Base_Controller {

	public function get_name() {
		return 'kits-cloud-eligibility';
	}

	public function get_items( $request ) {
		return [
			'data' => $this->get_app()->get_kits_quota(),
		];
	}

	public function get_permission_callback( $request ) {
		return current_user_can( 'manage_options' );
	}

	protected function get_app(): Cloud_Library {
		return KitLibrary::get_cloud_api();
	}
}
