<?php
namespace elementor\modules\home\transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Abstract;
use Elementor\Utils;
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Filter_Top_Section_By_License extends Transformations_Abstract {
	public bool $has_pro;

	private const FREE = 'free';
	private const ESSENTIAL = 'essential';
	private const PRO = 'pro';

	public function __construct( $args ) {
		parent::__construct( $args );

		$this->has_pro = Utils::has_pro();
	}

	private function is_valid_item( $item ) {
		if ( isset( $item['license'] ) ) {
			$item_tier = $item['license'][0];
			$user_tier = $this->get_tier();

			if ( $user_tier && $user_tier === $item_tier ) {
				return true;
			}

			return ! $user_tier && $this->validate_tier( $item_tier );
		}

		return false;
	}

	private function validate_tier( $tier ): bool {
		return $this->validate_pro_tier( $tier ) || $this->validate_free_tier( $tier );
	}

	private function validate_pro_tier( string $tier ): bool {
		return $this->has_pro && in_array( $tier, [ self::PRO, self::ESSENTIAL ], true );
	}

	private function validate_free_tier( string $tier ): bool {
		return ! $this->has_pro && self::FREE === $tier;
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
