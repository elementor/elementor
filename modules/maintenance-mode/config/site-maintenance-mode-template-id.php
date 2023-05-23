<?php
namespace Elementor\Modules\Maintenance_Mode\Config;

use Elementor\Core\Config\Config_Enum_Trait;
use Elementor\Core\Config\Site_Config_Base;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_Maintenance_Mode_Template_Id extends Site_Config_Base {
	use Config_Enum_Trait;

	const OPTION_DEFAULT = '';

	public static function get_key(): string {
		return 'maintenance_mode_template_id';
	}

	public static function get_options(): array {
		$templates = Plugin::$instance->templates_manager->get_source( 'local' )->get_items( [
			'type' => 'page',
		] );

		$templates_options = [];

		foreach ( $templates as $template ) {
			$templates_options[ $template['template_id'] ] = esc_html( $template['title'] );
		}

		return $templates_options;
	}

	public static function get_default(): string {
		return static::OPTION_DEFAULT;
	}

	public static function should_autoload(): bool {
		return true;
	}
}
