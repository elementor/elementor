<?php
namespace Elementor\Modules\Styleguide\Widgets\Data\Endpoints;

use Elementor\Data\V2\Base\Endpoint;
use Elementor\Plugin;
use Elementor\Core\Kits\Documents\Kit;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Settings extends Endpoint {
	/**
	 * @return string
	 */
	public function get_name() {
		return 'settings';
	}

	public function get_format() {
		return 'preview/styleguide/settings';
	}

	protected function register() {
		$this->register_items_route();
	}

	public function get_items( $request ) {
		$settings = array_merge(
			$this->get_site_settings(),
			$this->get_additional_settings(),
		);

		return $this->serialize_settings( $settings );
	}

	private function serialize_settings( $settings ) {
		return [
			'colors' => [
				'system_colors' => $settings['system_colors'],
				'custom_colors' => $settings['custom_colors'],
			],
			'fonts' => [
				'custom_typography' => $settings['custom_typography'],
				'system_typography' => $settings['system_typography'],
				'fallback_font' => $settings['default_generic_fonts'],
			],
			'config' => [
				'is_debug' => $settings['is_debug'],
			],
		];
	}

	private function get_site_settings() {
		$documents_manager = Plugin::$instance->documents;
		$kits_manager = Plugin::$instance->kits_manager;

		$kit = $documents_manager->get_doc_or_auto_save( $kits_manager->get_active_id(), get_current_user_id() );

		if ( ! $kit instanceof Kit ) {
			return [];
		}

		return $kit->get_active_settings();
	}

	private function get_additional_settings() {
		return [
			'is_debug' => ( defined( 'ELEMENTOR_DEBUG' ) && ELEMENTOR_DEBUG ),
		];
	}

	public function get_permission_callback( $request ) {
		return current_user_can( 'manage_options' );
	}
}
