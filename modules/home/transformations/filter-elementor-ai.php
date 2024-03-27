<?php
namespace Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Abstract;
use Elementor\User;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Filter_Elementor_AI extends Transformations_Abstract {

	public bool $is_ai_active;

	public function __construct( $args ) {
		parent::__construct( $args );

		$this->is_ai_active = ! empty( User::get_introduction_meta( 'ai_get_started' ) );
	}

	public function transform( array $home_screen_data ): array {
		if ( ! $this->is_ai_active ) {
			return $home_screen_data;
		}

		$home_screen_data['add_ons']['repeater'] = $this->filter_addons( $home_screen_data['add_ons']['repeater'] );

		return $home_screen_data;
	}

	private function filter_addons( array $add_ons ): array {
		$transformed_add_ons = [];

		foreach ( $add_ons as $add_on ) {
			if ( 'Elementor AI' === $add_on['title'] ) {
				continue;
			}

			$transformed_add_ons[] = $add_on;
		}

		return $transformed_add_ons;
	}
}
