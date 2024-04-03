<?php
namespace elementor\modules\home\transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Abstract;
use Elementor\Utils;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Filter_Get_Started_By_License extends Transformations_Abstract {
	public bool $has_pro;

	public function __construct( $args ) {
		parent::__construct( $args );

		$this->has_pro = Utils::has_pro();
	}

	public function transform( array $home_screen_data ): array {
		$new_get_started = [];

		foreach ( $home_screen_data['get_started'] as $index => $item ) {
			$has_pro_json_free = $this->has_pro && 'free' === $item['license'][0];
			$not_pro_json_pro = ! $this->has_pro && 'pro' === $item['license'][0];

			if ( $has_pro_json_free || $not_pro_json_pro ) {
				continue;
			}
			$new_get_started[] = $item;

		}

		$home_screen_data['get_started'] = reset( $new_get_started );

		return $home_screen_data;
	}
}
