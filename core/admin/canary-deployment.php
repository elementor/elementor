<?php
namespace Elementor\Core\Admin;

use Elementor\Api;
use Elementor\Core\Base\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Canary_Deployment extends Module {

	/**
	 * Get module name.
	 *
	 * Retrieve the module name.
	 *
	 * @since  2.6.0
	 * @access public
	 *
	 * @return string Module name.
	 */
	public function get_name() {
		return 'canary-deployment';
	}

	/**
	 * Check version.
	 *
	 * @since 2.6.0
	 * @access public
	 *
	 * @param array $transient Plugin version data.
	 *
	 * @return array Plugin version data.
	 */
	public function check_version( $transient ) {
		// Placeholder
		$new_version = '0.0.0';

		if ( ! empty( $transient->response[ ELEMENTOR_PLUGIN_BASE ]->new_version ) ) {
			$new_version = $transient->response[ ELEMENTOR_PLUGIN_BASE ]->new_version;
		}

		$canary_deployment = Api::get_canary_deployment_info();

		if ( empty( $canary_deployment['new_version'] ) ) {
			return $transient;
		}

		if ( version_compare( $new_version, $canary_deployment['new_version'], '>' ) ) {
			return $transient;
		}

		if ( version_compare( $canary_deployment['new_version'], ELEMENTOR_VERSION, '>' ) ) {
			if ( ! empty( $canary_deployment['conditions'] ) && ! $this->check_conditions( $canary_deployment['conditions'] ) ) {
				return $transient;
			}

			unset( $canary_deployment['conditions'] );

			$transient->response[ ELEMENTOR_PLUGIN_BASE ] = (object) $canary_deployment;
			$transient->checked[ ELEMENTOR_PLUGIN_BASE ] = $canary_deployment['new_version'];
		}

		return $transient;
	}

	private function check_conditions( $groups ) {
		foreach ( $groups as $group ) {
			if ( $this->check_group( $group ) ) {
				return true;
			}
		}

		return false;
	}

	private function check_group( $group ) {
		$is_or_relation = ! empty( $group['relation'] ) && 'OR' === $group['relation'];
		unset( $group['relation'] );

		foreach ( $group as $condition ) {
			$result = false;
			switch ( $condition['type'] ) {
				case 'wordpress': // phpcs:ignore WordPress.WP.CapitalPDangit.Misspelled
					global $wp_version;
					$result = version_compare( $wp_version, $condition['version'], $condition['operator'] );
					break;
				case 'multisite':
					$result = is_multisite() === $condition['multisite'];
					break;
				case 'language':
					$in_array = in_array( get_locale(), $condition['languages'], true );
					$result = 'IN' === $condition['operator'] ? $in_array : ! $in_array;
					break;
				case 'plugin':
					if ( is_plugin_active( $condition['plugin'] ) ) {
						$plugin_data = get_plugin_data( $condition['plugin'] );
						$version = $plugin_data['version'];
					} else {
						$version = '';
					}

					$result = version_compare( $version, $condition['version'], $condition['operator'] );
					break;
				case 'theme':
					$theme = wp_get_theme();
					if ( $theme->get_template() === $condition['theme'] || $theme->get_stylesheet() === $condition['theme'] ) {
						$version = $theme->version;
					} else {
						$version = '';
					}

					$result = version_compare( $version, $condition['version'], $condition['operator'] );
					break;

			}

			if ( ( $is_or_relation && $result ) || ( ! $is_or_relation && ! $result ) ) {
				return $result;
			}
		}

		return false;
	}

	/**
	 * @since 2.6.0
	 * @access public
	 */
	public function __construct() {
		add_filter( 'pre_set_site_transient_update_plugins', [ $this, 'check_version' ] );
	}
}
