<?php
namespace elementor\modules\home\transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Abstract;
use Elementor\Utils;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Generate_Sidebar_Upgrade extends Transformations_Abstract {
	public bool $has_pro;

	public function __construct( $args ) {
		parent::__construct( $args );

		$this->has_pro = Utils::has_pro();
	}

	public function transform( array $home_screen_data ): array {
		foreach ( $home_screen_data['sidebar_upgrade'] as $index => $item ) {
			if ( $item['header'] === "" ) {
				unset( $home_screen_data['sidebar_upgrade'][$index] );
				break;
			}
			if ( $this->has_pro && $item['license'][0] === 'free' ) {
				unset( $home_screen_data['sidebar_upgrade'][$index] );
				break;
			} elseif ( ! $this->has_pro && $item['license'].length() > 1 ) {
				unset( $home_screen_data['sidebar_upgrade'][ $index ] );
				break;
			}
		}
		$home_screen_data['sidebar_upgrade'] = array_values( $home_screen_data['sidebar_upgrade'] ) ;

		return $home_screen_data;
	}
}
