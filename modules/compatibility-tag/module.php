<?php
namespace Elementor\Modules\CompatibilityTag;

use Elementor\Core\Utils\Version;
use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Inspired By WooCommerce.
 *
 * @link  https://github.com/woocommerce/woocommerce/blob/master/includes/admin/plugin-updates/class-wc-plugin-updates.php
 */
class Module extends BaseModule {
	/**
	 * This is the header used by extensions to show testing.
	 *
	 * @var string
	 */
	const ELEMENTOR_VERSION_TESTED_HEADER = 'Elementor tested up to';

	/**
	 * @return string
	 */
	public function get_name() {
		return 'compatibility-tag';
	}

	/**
	 * Return all the plugins
	 *
	 * This protected method created for tests reasons.
	 *
	 * @return array[]
	 */
	protected function get_plugins() {
		return get_plugins();
	}

	/**
	 * Add allowed headers to plugins.
	 *
	 * @param array $headers
	 * @param       $header
	 *
	 * @return array
	 */
	private function enable_elementor_headers( array $headers, $header ) {
		$headers[] = $header;

		return $headers;
	}

	/**
	 * Append a compatibility message to the update plugin warning.
	 *
	 * @param array $args
	 * @param       $header
	 *
	 * @throws \Exception
	 */
	private function in_plugin_update_message( array $args, $header ) {
		$new_version = Version::create_from_string( $args['new_version'] );

		if ( $new_version->compare( '=', $args['Version'], Version::PART_MAJOR_2 ) ) {
			return;
		}

		$untested_extensions = $this->get_untested_extensions( $new_version, $header );

		if ( empty( $untested_extensions ) ) {
			return;
		}

		include __DIR__ . '/views/plugin-update-message-compatibility.php';
	}

	/**
	 * Get all the untested extensions (plugins that extend elementor).
	 *
	 * @param Version $version
	 * @param         $header
	 *
	 * @return mixed|null
	 * @throws \Exception
	 */
	private function get_untested_extensions( Version $version, $header ) {
		$extensions = $this->get_plugins_with_header( $header );

		return array_reduce( $extensions, function ( array $current, array $extension ) use ( $version, $header ) {
			$is_valid_version = Version::is_valid_version( $extension[ $header ] );

			if ( ! $is_valid_version ) {
				$extension[ $header ] .= ' (Invalid version)';
			}

			if ( ! $is_valid_version || $version->compare( '>', $extension[ $header ], Version::PART_MAJOR_2 ) ) {
				$current[] = $extension;
			}

			return $current;
		}, [] );
	}

	/**
	 * Get all plugins with specific header.
	 *
	 * @param $header
	 *
	 * @return array[]
	 */
	private function get_plugins_with_header( $header ) {
		return array_filter( $this->get_plugins(), function ( array $plugin ) use ( $header ) {
			return ! empty( $plugin[ $header ] );
		} );
	}

	/**
	 * Module constructor.
	 */
	public function __construct() {
		add_filter( 'extra_plugin_headers', function ( array $headers ) {
			return $this->enable_elementor_headers( $headers, self::ELEMENTOR_VERSION_TESTED_HEADER );
		} );

		add_action( 'in_plugin_update_message-' . ELEMENTOR_PLUGIN_BASE, function ( array $args ) {
			$this->in_plugin_update_message( $args, self::ELEMENTOR_VERSION_TESTED_HEADER );
		}, 11 /* After the warning message for backup */ );
	}
}
