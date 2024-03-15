<?php
namespace Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Base;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Create_New_Page_Url implements Transformations_Base {

	private $home_screen_data;

	public function __construct( $home_screen_data ) {
		$this->home_screen_data = $home_screen_data;
	}

	public function transform(): array {
		$this->home_screen_data['create_new_page_url'] = Plugin::$instance->documents->get_create_new_post_url( 'page' );

		return $this->home_screen_data;
	}
}
