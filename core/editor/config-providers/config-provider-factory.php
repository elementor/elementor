<?php
namespace Elementor\Core\Editor\Config_Providers;

use Elementor\Core\Editor\Editor;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Config_Provider_Factory {
	public static function create() {
		$is_editor_v2_active = Plugin::$instance->experiments->is_feature_active( Editor::EDITOR_V2_EXPERIMENT_NAME );

		// Nonce verification is not required, using param for routing purposes.
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$editor_version = Utils::get_super_global_value( $_GET, 'v' ) ?? ( $is_editor_v2_active ? '2' : '1' );

		if ( '2' === $editor_version ) {
			return new Editor_V2_Config_Provider();
		}

		return new Editor_V1_Config_Provider();
	}
}
