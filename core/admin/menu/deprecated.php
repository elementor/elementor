<?php

namespace Elementor\Core\Admin\Menu;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

trait Deprecated {

	private $deprecation_notice = 'Elementor menu items are now registered inside Elementor\Core\Admin\EditorOneMenu. Use the \'elementor/editor-one/menu/register\' hook instead.';

	private function trigger_deprecation_notice( $function_name, $version ) {
		Plugin::$instance->modules_manager
			->get_modules( 'dev-tools' )
			->deprecation
			->deprecated_function( $function_name, $version, $this->deprecation_notice );
	}

	private function trigger_deprecated_action( $hook, $args, $version ) {
		if ( ! has_action( $hook ) ) {
			return;
		}

		Plugin::$instance->modules_manager
			->get_modules( 'dev-tools' )
			->deprecation
			->do_deprecated_action( $hook, $args, $version, $this->deprecation_notice );
	}
}
