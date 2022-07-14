<?php
namespace Elementor\Core\Editor;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Promotion {
	public function get_elements_promotion() {
		// For BC
		$has_pro = Utils::has_pro();

		return [
			/* translators: %s: Widget title. */
			'title' => __( '%s Widget', 'elementor' ),
			/* translators: %s: Widget title. */
			'content' => __(
				'Use %s widget and dozens more pro features to extend your toolbox and build sites faster and better.',
				'elementor'
			),
			'action_button' => [
				'text' => $has_pro ?
					__( 'Connect & Activate', 'elementor' ) :
					__( 'See it in Action', 'elementor' ),
				'url' => $has_pro ?
					admin_url( 'admin.php?page=elementor-license' ) :
					'https://go.elementor.com/go-pro-%s',
			],
		];
	}
}
