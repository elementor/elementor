<?php

namespace elementor\modules\home\transformations;

use Elementor\Core\Common\Modules\Connect\Module as ConnectModule;
use Elementor\Modules\Home\Transformations\Base\Transformations_Abstract;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Filter_Top_Section_By_License extends Transformations_Abstract {
	public bool $has_pro;
	private array $supported_tiers;

	public function __construct( array $args = [] ) {
		parent::__construct( $args );

		$this->has_pro = Utils::has_pro();
		$this->supported_tiers = [
			ConnectModule::ACCESS_TIER_FREE,
			ConnectModule::ACCESS_TIER_ESSENTIAL,
			ConnectModule::ACCESS_TIER_PRO_LEGACY,
		];
	}

	private function is_valid_item( $item ) {
		if ( isset( $item['license'] ) ) {
			$item_tier = $item['license'][0];
			$user_tier = $this->get_tier();

			if ( $user_tier && $user_tier === $item_tier ) {
				return true;
			}

			return $this->validate_tier( $item_tier );
		}

		return false;
	}

	private function validate_tier( $tier ): bool {
		$is_valid = $this->has_pro
			? $tier !== ConnectModule::ACCESS_TIER_FREE
			: $tier === ConnectModule::ACCESS_TIER_FREE;

		return $is_valid && in_array( $tier, $this->supported_tiers, true );
	}

	public function transform( array $home_screen_data ): array {
		$new_top = [];

		foreach ( $home_screen_data['top_with_licences'] as $index => $item ) {
			if ( $this->is_valid_item( $item ) ) {
				$new_top[] = $item;
			}
		}

		$home_screen_data['top_with_licences'] = reset( $new_top );

		return $home_screen_data;
	}
}
