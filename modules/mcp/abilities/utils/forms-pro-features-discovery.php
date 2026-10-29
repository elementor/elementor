<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Mcp\Utils\Pro_Features_Discovery;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Forms_Pro_Features_Discovery implements Widget_Pro_Features_Discovery {

	const UPGRADE_URL = 'https://go.elementor.com/go-pro-mcp-upgrade-form/';

	const LEGACY_WIDGET_TYPE = 'form';

	const WIDGET_TYPE_PREFIX = 'e-form';

	public static function supports_widget( string $widget_type ): bool {
		return ! Utils::has_pro() && (
			self::LEGACY_WIDGET_TYPE === $widget_type
			|| str_starts_with( $widget_type, self::WIDGET_TYPE_PREFIX )
		);
	}

	public static function for_widget(): \WP_Error {
		return Pro_Features_Discovery::error(
			__( 'Forms need Elementor Pro, which isn\'t installed, so the form was not added. What Pro gives the user: a working form built right on the page, with no code or extra plugin. Each submission is emailed to them. After submit, the visitor can land on a thank-you page or see a confirmation popup or all of the above combined. Lead with the part that matches the request, like email for a contact form.', 'elementor' ),
			__( 'Free path: in the form\'s place, add a button or text with the user\'s contact email (mailto link) so visitors can still reach them.', 'elementor' ),
			self::UPGRADE_URL
		);
	}
}
