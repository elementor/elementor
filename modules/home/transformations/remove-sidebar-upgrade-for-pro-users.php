<?php
namespace Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Abstract;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Remove_Sidebar_Upgrade_For_Pro_Users extends Transformations_Abstract {

	public bool $has_pro;

	public function __construct( $args ) {
		parent::__construct( $args );

		$this->has_pro = Utils::has_pro();
	}

	public function transform( array $home_screen_data ): array {
		if ( $this->has_pro ) {
			unset( $home_screen_data['sidebar_upgrade'] );
		}

		return $home_screen_data;
	}
}
