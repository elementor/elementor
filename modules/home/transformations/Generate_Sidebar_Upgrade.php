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
		if ( $this->has_pro ) {
			foreach ($home_screen_data['sidebar_upgrade'] as $index => $item) {
				// Check if the condition is met (in this case, if the 'id' key equals $keyToRemove)
				if ( $item['license'][0] === 'free' ) {
					// Remove the object from the array

					unset( $home_screen_data[ $index ] );
					// Stop the loop since we found and removed the object
					break;
				}
			}

		} else {
				foreach ( $home_screen_data['sidebar_upgrade'] as $index => $item ) {
					// Check if the condition is met (in this case, if the 'id' key equals $keyToRemove)
					if ( $item['license'][0] === "essential-empty" ) {
						// Remove the object from the array

						unset( $home_screen_data[ $index ] );
						// Stop the loop since we found and removed the object
						break;
					}
				}
			}

			$home_screen_data = array_values( $home_screen_data );

		return $home_screen_data;
	}

}
