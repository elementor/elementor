<?php

namespace Elementor\Core\App\Modules\ImportExport\Content;

use Elementor\Core\Utils\Collection;
use Elementor\Core\Utils\Plugins_Manager;

class Plugins extends Runner_Base {

	/**
	 * @var Plugins_Manager
	 */
	private $plugins_manager;

	public function __construct( $plugins_manager = null ) {
		if ( $plugins_manager ) {
			$this->plugins_manager = $plugins_manager;
		} else {
			$this->plugins_manager = new Plugins_Manager();
		}
	}

	public function should_import( $data ) {
		if ( ! isset( $data['include'] ) ) {
			return false;
		}

		if ( ! in_array( 'plugins', $data['include'], true ) ) {
			return false;
		}

		if ( ! is_array( $data['selected_plugins'] ) ) {
			return false;
		}

		return true;
	}

	public function should_export( $data ) {
		if ( ! isset( $data['include'] ) ) {
			return false;
		}

		if ( ! in_array( 'plugins', $data['include'], true ) ) {
			return false;
		}

		if ( ! is_array( $data['selected_plugins'] ) ) {
			return false;
		}

		return true;
	}

	public function import( $data, $imported_data ) {
		$plugins = $data['selected_plugins'];

		$plugins_collection = ( new Collection( $plugins ) )
			->map( function ( $item ) {
				if ( ! $this->ends_with( $item['plugin'], '.php' ) ) {
					$item['plugin'] .= '.php';
				}
				return $item;
			} );

		$slugs = $plugins_collection
			->map( function ( $item ) {
				return $item['plugin'];
			} )
			->all();

		$install = $this->plugins_manager->install( $slugs );
		$activate = $this->plugins_manager->activate( $install['succeeded'] );

		$ordered_activated_plugins = $plugins_collection
			->filter( function ( $item ) use ( $activate ) {
				return in_array( $item['plugin'], $activate['succeeded'], true );
			} )
			->map( function ( $item ) {
				return $item['name'];
			} )
			->all();

		$result['plugins'] = $ordered_activated_plugins;
		return $result;
	}

	public function export( $data ) {
		$manifest_data['plugins'] = $data['selected_plugins'];

		return [
			'manifest' => [
				$manifest_data,
			],
		];
	}

	/**
	 * Helpers
	 */

	private function ends_with( $haystack, $needle ) {
		return substr( $haystack, -strlen( $needle ) ) === $needle;
	}
}
