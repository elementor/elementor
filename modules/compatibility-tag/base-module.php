<?php
namespace Elementor\Modules\CompatibilityTag;

use Elementor\Core\Utils\Version;
use Elementor\Core\Utils\Collection;
use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Base_Module extends BaseModule {
	/**
	 * @var Compatibility_Tag
	 */
	private $compatibility_tag_service;

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
	 * @return Collection
	 */
	protected function get_plugins() {
		static $plugins;

		if ( ! $plugins ) {
			$plugins = new Collection( get_plugins() );
		}

		return $plugins;
	}

	/**
	 * @return Compatibility_Tag
	 */
	protected function get_compatibility_tag_service() {
		if ( ! $this->compatibility_tag_service ) {
			$this->compatibility_tag_service = new Compatibility_Tag( $this->get_plugin_header() );
		}

		return $this->compatibility_tag_service;
	}

	/**
	 * Add allowed headers to plugins.
	 *
	 * @param array $headers
	 * @param       $compatibility_tag_header
	 *
	 * @return array
	 */
	protected function enable_elementor_headers( array $headers, $compatibility_tag_header ) {
		$headers[] = $compatibility_tag_header;

		return $headers;
	}

	/**
	 * @return Collection
	 */
	protected function get_plugins_to_check() {
		return $this->get_plugins_with_header();
	}

	/**
	 * Append a compatibility message to the update plugin warning.
	 *
	 * @param array $args
	 *
	 * @throws \Exception
	 */
	protected function on_plugin_update_message( array $args ) {
		$new_version = Version::create_from_string( $args['new_version'] );

		if ( $new_version->compare( '=', $args['Version'], Version::PART_MAJOR_2 ) ) {
			return;
		}

		$plugins = $this->get_plugins_to_check();
		$plugins_compatibility = $this->get_compatibility_tag_service()->check( $new_version, $plugins->keys() );

		$plugins = $plugins->filter( function ( $data, $plugin_name ) use ( $plugins_compatibility ) {
			return Compatibility_Tag::COMPATIBLE !== $plugins_compatibility[ $plugin_name ];
		} );

		if ( $plugins->is_empty() ) {
			return;
		}

		include __DIR__ . '/views/plugin-update-message-compatibility.php';
	}

	/**
	 * Get all plugins with specific header.
	 *
	 * @return Collection
	 */
	private function get_plugins_with_header() {
		return $this->get_plugins()
			->filter( function ( array $plugin ) {
				return ! empty( $plugin[ $this->get_plugin_header() ] );
			} );
	}

	/**
	 * @return string
	 */
	abstract protected function get_plugin_header();

	/**
	 * @return string
	 */
	abstract protected function get_plugin_label();

	/**
	 * @return string
	 */
	abstract protected function get_plugin_name();

	/**
	 * Base_Module constructor.
	 *
	 * @throws \Exception
	 */
	public function __construct() {
		add_filter( 'extra_plugin_headers', function ( array $headers ) {
			return $this->enable_elementor_headers( $headers, $this->get_plugin_header() );
		} );

		add_action( 'in_plugin_update_message-' . $this->get_plugin_name(), function ( array $args ) {
			$this->on_plugin_update_message( $args );
		}, 11 /* After the warning message for backup */ );
	}
}
