<?php
namespace Elementor\Core\Editor;

use Elementor\Core\Utils\Promotions\Filtered_Promotions_Manager;
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

		return Filtered_Promotions_Manager::get_filtered_promotion_data( $promotion_data, 'elementor/editor/promotion/get_elements_promotion', 'action_button', 'url' );
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
}
