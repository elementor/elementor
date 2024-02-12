<?php
namespace Elementor\Core\Editor;

use Elementor\Core\Utils\Promotions\Validate_Promotion;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Promotion {

	/**
	 * @return array
	 */
	public function get_elements_promotion(): array {

		$url = $this->get_promotion_url();

		$promotion_data = $this->get_promotion_data( $url );

		$new_promotion_data = apply_filters( 'elementor/editor/promotion/get_elements_promotion', $promotion_data );

		if ( $new_promotion_data && count( $new_promotion_data ) <= count( $promotion_data ) ) {
			$promotion_data = array_replace( $promotion_data, $new_promotion_data );
			$promotion_data = $this->replace_promotion_url( $promotion_data, $url );
		}

		return $promotion_data;
	}

	/**
	 * @return string
	 */
	private function get_promotion_url(): string {
		return Utils::has_pro()
			? admin_url( 'admin.php?page=elementor-license' )
			: 'https://go.elementor.com/go-pro-%s';
	}

	/**
	 * @param string $url
	 * @return array
	 */
	private function get_promotion_data( string $url ): array {
		return [
			/* translators: %s: Widget title. */
			'title' => __( '%s Widget', 'elementor' ),
			/* translators: %s: Widget title. */
			'content' => __(
				'Use %s widget and dozens more pro features to extend your toolbox and build sites faster and better.',
				'elementor'
			),
			'action_button' => [
				'text' => Utils::has_pro() ?
					__( 'Connect & Activate', 'elementor' ) :
					__( 'Upgrade Now', 'elementor' ),
				'url' => $url,
			],
		];
	}

	/**
	 * @param array $promotion_data
	 * @param string $url
	 * @return array
	 */
	private function replace_promotion_url( array $promotion_data, string $url ): array {
		if ( $this->is_valid_url( $promotion_data['action_button']['url'] ) ) {
			$promotion_data['action_button']['url'] = esc_url( $url );
		}

		return $promotion_data;
	}

	/**
	 * @param $url
	 * @return bool
	 */
	private function is_valid_url( $url ): bool {
		return $url
			&& Validate_Promotion::domain_is_on_elementor_dot_com( $url );
	}
}
