<?php
namespace Elementor\Core;

use Elementor\Core\Base\Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor modules manager.
 *
 * Elementor modules manager handler class is responsible for registering and
 * managing Elementor modules.
 *
 * @since 1.6.0
 */
class Modules_Manager {

	/**
	 * Registered modules.
	 *
	 * Holds the list of all the registered modules.
	 *
	 * @since 1.6.0
	 * @access public
	 *
	 * @var array
	 */
	private $modules = [];

	/**
	 * Modules manager constructor.
	 *
	 * Initializing the Elementor modules manager.
	 *
	 * @since 1.6.0
	 * @access public
	 */
	public function __construct() {
		$modules_namespace_prefix = $this->get_modules_namespace_prefix();

		foreach ( $this->get_modules_names() as $module_name ) {
			$class_name = str_replace( '-', ' ', $module_name );

			$class_name = str_replace( ' ', '', ucwords( $class_name ) );

			$class_name = $modules_namespace_prefix . '\\Modules\\' . $class_name . '\Module';

			/** @var Module $class_name */

			$experimental_data = $class_name::get_experimental_data();

			if ( $experimental_data ) {
				Plugin::$instance->experiments->add_feature( $experimental_data );

				if ( ! Plugin::$instance->experiments->is_feature_active( $experimental_data['name'] ) ) {
					continue;
				}
			}

			if ( $class_name::is_active() ) {
				$this->modules[ $module_name ] = $class_name::instance();
			}
		}
	}

	/**
	 * Get modules names.
	 *
	 * Retrieve the modules names.
	 *
	 * @since 2.0.0
	 * @access public
	 *
	 * @return string[] Modules names.
	 */
	public function get_modules_names() {
		return [
			'admin-bar',
			'history',
			'library',
			'dynamic-tags',
			'page-templates',
			'gutenberg',
			'wp-cli',
			'safe-mode',
			'usage',
			'dev-tools',
			'landing-pages',
			'compatibility-tag',
			'generator-tag',
			'elements-color-picker',
			'shapes',
			'favorites',
			'admin-top-bar',
			'nested-elements',
			// Depends on Nested Elements module
			'nested-tabs',
			'container-converter',
			'web-cli',
			'promotions',
			'notes',
			'performance-lab',
			'lazyload',
			'kit-elements-defaults',
			'announcements',
		];
	}

	/**
	 * Get modules.
	 *
	 * Retrieve all the registered modules or a specific module.
	 *
	 * @since 2.0.0
	 * @access public
	 *
	 * @param string $module_name Module name.
	 *
	 * @return null|Module|Module[] All the registered modules or a specific module.
	 */
	public function get_modules( $module_name ) {
		if ( $module_name ) {
			if ( isset( $this->modules[ $module_name ] ) ) {
				return $this->modules[ $module_name ];
			}

			return null;
		}

		return $this->modules;
	}

	/**
	 * Get modules namespace prefix.
	 *
	 * Retrieve the modules namespace prefix.
	 *
	 * @since 2.0.0
	 * @access protected
	 *
	 * @return string Modules namespace prefix.
	 */
	protected function get_modules_namespace_prefix() {
		return 'Elementor';
	}
}
