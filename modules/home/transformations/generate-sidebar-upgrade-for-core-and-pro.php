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
		$new_sidebar_upgrade = [];

		foreach ( $home_screen_data['sidebar_upgrade'] as $index => $item ) {
			$has_pro_json_free = $this->has_pro && 'free' === $item['license'][0];
			$not_pro_json_pro = ! $this->has_pro && 1 < count( $item['license'] );
			$should_not_show = isset( $item['show'] ) && 'false' === $item['show'];

			if ( $has_pro_json_free || $not_pro_json_pro || $should_not_show ) {
				continue;
			}
			$new_sidebar_upgrade[] = $item;

		}

		if ( empty( $new_sidebar_upgrade ) ) {
			unset( $home_screen_data['sidebar_upgrade'] );
			return $home_screen_data;
		}
		$home_screen_data['sidebar_upgrade'] = reset( $new_sidebar_upgrade );

		return $home_screen_data;
	}
}
