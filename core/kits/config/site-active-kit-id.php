<?php

namespace Elementor\Core\Kits\Config;

use Elementor\Core\Config\Config_Enum_Trait;
use Elementor\Core\Config\Site_Config_Base;
use Elementor\Plugin;

if (!defined('ABSPATH')) {
	exit; // Exit if accessed directly
}

class Site_Active_Kit_Id extends Site_Config_Base {

	use Config_Enum_Trait;

	public static function get_key(): string {
		return 'elementor_active_kit';
	}

	public static function get_options(): array {
		$templates = Plugin::$instance->templates_manager->get_source('local')->get_items([
			'type' => 'kit',
		]);

		$templates_options = [];

		foreach ($templates as $template) {
			$templates_options[$template['template_id']] = esc_html($template['title']);
		}

		return $templates_options;
	}

	public static function get_default(): int {
		return 0;
	}

	public static function should_autoload(): bool {
		return true;
	}

	public static function get_value(): int{
		return (int) parent::get_value();
	}
}
