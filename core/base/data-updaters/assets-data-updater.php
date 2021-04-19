<?php
namespace Elementor\Core\Base\Data_Updaters;

use Elementor\Conditions;
use Elementor\Element_Base;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Assets_Data_Updater extends Document_Data_Updater {
	const ASSETS_META_KEY = '_elementor_page_assets';

	/**
	 * @var array
	 */
	private $page_assets = [];

	public function update_element( Element_Base $element_data ) {
		$element_assets = $this->get_element_assets( $element_data );

		if ( $element_assets ) {
			$this->update_page_assets( $element_assets );
		}
	}

	public function is_update_needed() {
		$page_assets = $this->get_page_assets();

		// When $page_assets is array it means that the assets registration has already been made at least once.
		if ( is_array( $page_assets ) ) {
			// If $page_assets is not empty then enabling the assets for loading.
			if ( $page_assets ) {
				Plugin::$instance->assets_loader->enable_assets( $page_assets );
			}

			return false;
		}

		return true;
	}

	public function after_elements_iteration( $event ) {
		// Saving the page assets data.
		$this->document->update_meta( self::ASSETS_META_KEY, $this->page_assets );

		if ( 'render' === $event && $this->page_assets ) {
			Plugin::$instance->assets_loader->enable_assets( $this->page_assets );
		}
	}

	private function get_page_assets() {
		return $this->document->get_meta( self::ASSETS_META_KEY );
	}

	private function update_page_assets( $new_assets ) {
		foreach ( $new_assets as $assets_type => $assets_type_data ) {
			if ( ! isset( $this->page_assets[ $assets_type ] ) ) {
				$this->page_assets[ $assets_type ] = [];
			}

			foreach ( $new_assets[ $assets_type ] as $asset_name ) {
				if ( ! isset( $this->page_assets[ $assets_type ][ $asset_name ] ) ) {
					$this->page_assets[ $assets_type ][] = $asset_name;
				}
			}
		}
	}

	private function get_element_assets( Element_Base $element ) {
		$controls = $element->get_controls();
		$settings = $element->get_active_settings();
		$element_assets = [];

		foreach ( $settings as $setting_key => $setting ) {
			if ( ! isset( $controls[ $setting_key ] ) ) {
				continue;
			}

			$control = $controls[ $setting_key ];

			// Enabling assets loading from the registered control fields.
			if ( ! empty( $control['assets'] ) ) {
				foreach ( $control['assets'] as $assets_type => $dependencies ) {
					foreach ( $dependencies as $dependency ) {
						if ( ! empty( $dependency['conditions'] ) ) {
							$is_condition_fulfilled = Conditions::check( $dependency['conditions'], $settings );

							if ( ! $is_condition_fulfilled ) {
								continue;
							}
						}

						if ( ! isset( $element_assets[ $assets_type ] ) ) {
							$element_assets[ $assets_type ] = [];
						}

						$element_assets[ $assets_type ][] = $dependency['name'];
					}
				}
			}

			// Enabling assets loading from the control object.
			$control_obj = Plugin::$instance->controls_manager->get_control( $control['type'] );

			$control_conditional_assets = $control_obj::get_assets( $setting );

			if ( $control_conditional_assets ) {
				foreach ( $control_conditional_assets as $assets_type => $dependencies ) {
					foreach ( $dependencies as $dependency ) {
						if ( ! isset( $element_assets[ $assets_type ] ) ) {
							$element_assets[ $assets_type ] = [];
						}

						$element_assets[ $assets_type ][] = $dependency;
					}
				}
			}
		}

		return $element_assets;
	}
}
