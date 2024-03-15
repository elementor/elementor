<?php
namespace Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Filter_Plugins implements Transformations_Base {

	private $home_screen_data;

	public function __construct( $home_screen_data ) {
		$this->home_screen_data = $home_screen_data;
	}

	public function transform(): array {
		$plugin = get_plugins();
		$this->home_screen_data['active_plugins'] = $plugin;

		return $this->home_screen_data;
	}
}
