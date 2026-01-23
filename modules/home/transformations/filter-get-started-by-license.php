<?php
namespace Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Abstract;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Filter_Get_Started_By_License extends Transformations_Abstract {

	public bool $has_pro;

	private array $supported_tiers;

	public function __construct( $args ) {
		parent::__construct( $args );

		$this->has_pro = Utils::has_pro();

		$this->supported_tiers = [
			self::USER_TIER_FREE,
			self::USER_TIER_PRO,
			self::USER_TIER_ONE,
		];
	}

	private function is_valid_item( $item ) {
		$user_tier = $this->get_tier();

		if ( ! $this->has_pro && self::USER_TIER_FREE === $item['license'][0] ) {
			return true;
		}

		if ( $user_tier === $item['license'][0] ) {
			return true;
		}

		return $this->is_fallback_for_unsupported_licenses( $item['license'][0], $user_tier );
	}

	private function is_fallback_for_unsupported_licenses( $item_tier, $user_tier ): bool {
		$is_supported_user_tier = in_array( $user_tier, $this->supported_tiers, true );

		return ! $is_supported_user_tier && self::USER_TIER_PRO === $item_tier;
	}

	public function transform( array $home_screen_data ): array {
		$new_get_started = [];

		foreach ( $home_screen_data['get_started'] as $index => $item ) {
			if ( $this->is_valid_item( $item ) ) {
				$new_get_started[] = $item;
			}
		}

		$home_screen_data['get_started'] = reset( $new_get_started );

		return $home_screen_data;
	}
}
