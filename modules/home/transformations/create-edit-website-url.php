<?php
namespace Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Abstract;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Create_Edit_Website_Url extends Transformations_Abstract {

	public function transform( array $home_screen_data ): array {
		$home_screen_data['edit_website_url'] = wp_nonce_url( admin_url( 'admin.php?action=elementor_edit_website_redirect' ), 'elementor_action_edit_website' );

		return $home_screen_data;
	}
}
