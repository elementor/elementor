<?php
namespace Elementor\Core\App\Modules\KitLibrary\Connect;

use Elementor\Core\Common\Modules\Connect\Apps\Library;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Kit_Library extends Library {
	// TODO: NEED TO BE CHANGED!
	const DEFAULT_BASE_ENDPOINT = 'https://kits.dev.elementor.red';

	public function get_title() {
		return __( 'Kit Library', 'elementor' );
	}

	protected function get_api_url() {
		return defined( 'ELEMENTOR_KIT_LIBRARY_BASE_ENDPOINT' ) ?
			ELEMENTOR_KIT_LIBRARY_BASE_ENDPOINT :
			static::DEFAULT_BASE_ENDPOINT;
	}

	protected function init() {
		// Remove parent init actions.
	}
}
