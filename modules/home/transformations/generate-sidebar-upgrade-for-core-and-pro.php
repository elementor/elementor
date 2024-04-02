<?php
namespace elementor\modules\home\transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Abstract;
use Elementor\Utils;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Generate_Sidebar_Upgrade_For_Core_And_Pro extends Transformations_Abstract {
	public bool $has_pro;

	public function __construct( $args ) {
		parent::__construct( $args );

		$this->has_pro = Utils::has_pro();
	}

	public function transform( array $home_screen_data ): array {
		foreach ( $home_screen_data['sidebar_upgrade'] as $index => $item ) {
			if ( $this->has_pro && 'free' === $item['license'][0] ) {
				unset( $home_screen_data['sidebar_upgrade'][ $index ] );
				break;
			} elseif ( ! $this->has_pro &&  1 < count( $item['license'] ) ) {
				unset( $home_screen_data['sidebar_upgrade'][ $index ] );
				break;
			}
		}

		$home_screen_data['sidebar_upgrade'] = array_values( $home_screen_data['sidebar_upgrade'] );
		$home_screen_data['sidebar_upgrade'] = $home_screen_data['sidebar_upgrade'][0];
		if ( $home_screen_data['sidebar_upgrade']['show'] && 'false' === $home_screen_data['sidebar_upgrade']['show'] ) {
			unset( $home_screen_data['sidebar_upgrade'] );
		}

		return $home_screen_data;
	}
}
