<?php
namespace Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Abstract;
use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Filter_Condition_Introduction_Meta extends Transformations_Abstract {

	public array $introduction_meta_data;

	public function __construct( $args ) {
		parent::__construct( $args );

		$this->introduction_meta_data = User::get_introduction_meta();
	}

	public function transform( array $home_screen_data ): array {
		$introduction_meta_conditions = $this->get_introduction_meta_conditions( $home_screen_data );

		foreach ( $introduction_meta_conditions as $add_on_title => $introduction_meta_value ) {
			if ( ! empty( $this->introduction_meta_data[ $introduction_meta_value ] ) ) {
				unset( $home_screen_data['add_ons']['repeater'][ $add_on_title ] );
			}
		}

		return $home_screen_data;
	}

	private function get_introduction_meta_conditions( $home_screen_data ) {
		$add_ons = $home_screen_data['add_ons']['repeater'];

		$conditions = [];

		foreach ( $add_ons as $add_on ) {
			if ( array_key_exists( 'condition', $add_on ) && 'introduction_meta' === $add_on['condition']['key'] ) {
				$conditions[ $add_on['title'] ] = $add_on['condition']['value'];
			}
		}

		return $conditions;
	}
}
