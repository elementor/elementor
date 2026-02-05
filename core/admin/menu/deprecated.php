<?php

namespace Elementor\Core\Admin\Menu;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

trait Deprecated {

	private $deprecation_notice = 'Elementor\Core\Admin\EditorOneMenu\Elementor_One_Menu_Manager and the \'elementor/editor-one/menu/register\' hook';

	private function trigger_deprecation_notice( $function_name, $version, $internal = false ) {
		if ( $internal ) {
			return;
		}

		Plugin::$instance->modules_manager
			->get_modules( 'dev-tools' )
			->deprecation
			->deprecated_function( $function_name, $version, $this->deprecation_notice );
	}

	private function trigger_deprecated_action( $hook, $args, $version, $internal = false ) {
		if ( ! has_action( $hook ) ) {
			return;
		}

		if ( $internal ) {
			do_action_ref_array( $hook, $args );
			return;
		}

		Plugin::$instance->modules_manager
			->get_modules( 'dev-tools' )
			->deprecation
			->do_deprecated_action( $hook, $args, $version, $this->deprecation_notice );
	}
}
