<?php
namespace Elementor\App\Modules\KitLibrary\Data\KitsCloud\Endpoints;

use Elementor\App\Modules\KitLibrary\Data\KitsCloud\Controller;
use Elementor\App\Modules\KitLibrary\Module as KitLibrary;
use Elementor\Data\V2\Base\Endpoint;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @property Controller $controller
 */
class Eligibility extends Endpoint {
	public function get_name() {
		return 'eligibility';
	}

	public function get_format() {
		return 'kits-cloud/eligibility';
	}

	public function get_items( $request ) {
		return [
			'data' => KitLibrary::get_cloud_api()->get_quota(),
		];
	}
}
