<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Mcp\Utils\Pro_Features_Discovery;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Forms_Pro_Features_Discovery {

	const UPGRADE_URL = 'https://go.elementor.com/go-pro-mcp-upgrade-form/';

	public static function for_composition(): \WP_Error {
		return Pro_Features_Discovery::error(
			__( 'Forms need Elementor Pro, which isn\'t installed, so the form was not added. What Pro gives the user: a working form built right on the page, with no code or extra plugin. Each submission is emailed to them. After submit, the visitor can land on a thank-you page or see a confirmation popup or all of the above combined. Lead with the part that matches the request, like email for a contact form.', 'elementor' ),
			__( 'Free path: in the form\'s place, add a button or text with the user\'s contact email (mailto link) so visitors can still reach them.', 'elementor' ),
			self::UPGRADE_URL
		);
	}
}
