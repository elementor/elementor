<?php

namespace Elementor\Modules\DesignGuidelines\Widgets\GlobalSettings;

use Elementor\Plugin;
use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Settings extends Widget_Base {

	public function get_name() {
		return 'global-settings';
	}

	public function get_title() {
		return esc_html__( 'Global Settings', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-sidebar'; // todo
	}

	public function get_keywords() {
		return [ 'global-settings', 'design' ];
	}

	protected function register_controls() {
	}

	protected function render() {
		$site_settings = $this->get_site_settings();

		$site_settings_reduced = [
			'system_colors' => $site_settings['system_colors'],
			'custom_colors' => $site_settings['custom_colors'],
			'custom_typography' => $site_settings['custom_typography'],
			'system_typography' => $site_settings['system_typography'],
		];

		$settings = htmlspecialchars( json_encode( $site_settings_reduced ) );

		?>
			<div class="elementor-global-settings-widget"
			     data-settings="<?php echo $settings; ?>"
			>.</div>
		<?php
	}

	private function get_site_settings() {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		return $kit->get_settings();
	}
}
