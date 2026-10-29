<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Mcp\Utils\Pro_Features_Discovery;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Variables_Pro_Features_Discovery {

	const UPGRADE_URL = 'https://go.elementor.com/go-pro-mcp-upgrade-variables/';

	public static function for_size_variables(): \WP_Error {
		return Pro_Features_Discovery::error(
			__( 'Size variables need Elementor Pro, so this operation wasn\'t applied. What Pro gives the user: one spacing and type scale for the whole site, where changing a size once updates every element that uses it.', 'elementor' ),
			__( 'Free path: create the color and font variables now and set sizes directly in global classes. Tell the user sizes will need updating class by class.', 'elementor' ),
			self::UPGRADE_URL
		);
	}

	public static function get_repeated_message(): string {
		return __( 'Size variables need Elementor Pro, so this operation wasn\'t applied. The upgrade link and what to tell the user are in the first size variable error of this response.', 'elementor' );
	}
}
