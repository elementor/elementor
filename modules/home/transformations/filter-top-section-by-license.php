<?php
namespace elementor\modules\home\transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Abstract;
use Elementor\Utils;
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Filter_Top_Section_By_License extends Transformations_Abstract {
	public bool $has_pro;

	public function __construct( $args ) {
		parent::__construct( $args );

		$this->has_pro = Utils::has_pro();
	}

	private function is_valid_item( $item ) {
		if ( isset( $item['license'] ) ) {
			$has_pro_json_not_free = $this->has_pro && 'pro' === $item['license'][0];
			$is_not_pro_json_not_pro = ! $this->has_pro && 'free' === $item['license'][0];

			return $has_pro_json_not_free || $is_not_pro_json_not_pro;
		}
	}

	public function transform( array $home_screen_data ): array {
		foreach ( $home_screen_data['top_with_licences'] as $index => $item ) {
			if ( $this->is_valid_item( $item ) ) {
				$new_top[] = $item;
			}
		}

		$home_screen_data['top_with_licences'] = reset( $new_top );
		unset( $home_screen_data['top'] );

		return $home_screen_data;
	}
}
