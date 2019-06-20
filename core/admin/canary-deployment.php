<?php
namespace Elementor\Core\Admin;

use Elementor\Api;
use Elementor\Core\Base\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Canary_Deployment extends Module {

	private $canary_deployment_info = null;
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
		$stable_version = '0.0.0';

		if ( ! empty( $transient->response[ ELEMENTOR_PLUGIN_BASE ]->new_version ) ) {
			$stable_version = $transient->response[ ELEMENTOR_PLUGIN_BASE ]->new_version;
		}

		if ( null === $this->canary_deployment_info ) {
			$this->canary_deployment_info = $this->get_canary_deployment_info();
		}

		// Can be false - if canary version is not available.
		if ( empty( $this->canary_deployment_info ) ) {
			return $transient;
		}

		if ( ! version_compare( $this->canary_deployment_info['new_version'], $stable_version, '>' ) ) {
			return $transient;
		}

		$canary_deployment_info = $this->canary_deployment_info;

		// Most of plugin info comes from the $transient but on first check - the response is empty.
		if ( ! empty( $transient->response[ ELEMENTOR_PLUGIN_BASE ] ) ) {
			$canary_deployment_info = array_merge( (array) $transient->response[ ELEMENTOR_PLUGIN_BASE ], $canary_deployment_info );
		}

		$transient->response[ ELEMENTOR_PLUGIN_BASE ] = (object) $canary_deployment_info;

		return $transient;
	}

	private function get_canary_deployment_info() {
		global $pagenow;

		$force = 'update-core.php' === $pagenow && isset( $_GET['force-check'] ); // WPCS: XSS ok.

		$canary_deployment = Api::get_canary_deployment_info( $force );

		if ( empty( $canary_deployment['plugin_info']['new_version'] ) ) {
			return false;
		}

		$canary_version = $canary_deployment['plugin_info']['new_version'];

		if ( version_compare( $canary_version, ELEMENTOR_VERSION, '>' ) ) {
			if ( ! empty( $canary_deployment['conditions'] ) && ! $this->check_conditions( $canary_deployment['conditions'] ) ) {
				return false;
			}
		}

		return $canary_deployment['plugin_info'];
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
					// include an unmodified $wp_version
					include ABSPATH . WPINC . '/version.php';
					$result = version_compare( $wp_version, $condition['version'], $condition['operator'] );
					break;
				case 'multisite':
					$result = is_multisite() === $condition['multisite'];
					break;
				case 'language':
					$in_array = in_array( get_locale(), $condition['languages'], true );
					$result = 'in' === $condition['operator'] ? $in_array : ! $in_array;
					break;
				case 'plugin':
					if ( is_plugin_active( $condition['plugin'] ) ) {
						$plugin_data = get_plugin_data( WP_PLUGIN_DIR . '/' . $condition['plugin'] );
						$version = $plugin_data['Version'];
					} else {
						$version = '';
					}

					$result = version_compare( $version, $condition['version'], $condition['operator'] );
					break;
				case 'theme':
					$theme = wp_get_theme();
					$parent = wp_get_theme()->parent();

					if ( $parent && $parent->get_template() === $condition['theme'] ) {
						$version = $parent->version;
					} elseif ( $theme->get_template() === $condition['theme'] ) {
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
