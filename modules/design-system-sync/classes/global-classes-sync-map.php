<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Concerns\Has_Kit_Dependency;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Sync_Map {
	use Has_Kit_Dependency;

	const META_KEY = '_elementor_global_classes_sync_to_v3';

	private ?array $cache = null;

	private function __construct() {
	}

	public static function make( ?Kit $kit = null ): self {
		$instance = new self();

		if ( ! $kit ) {
			return $instance;
		}

		return $instance->set_kit( $kit );
	}

	public function get_synced_ids(): array {
		return array_keys( $this->read_stored() );
	}

	public function is_synced( string $id ): bool {
		return isset( $this->read_stored()[ $id ] );
	}

	public function set_map( array $id_to_true ): bool {
		$kit = $this->get_kit();

		if ( ! $kit ) {
			return false;
		}

		$result = $kit->update_meta( self::META_KEY, $id_to_true );
		$this->cache = $id_to_true;

		return false !== $result;
	}

	public function apply_changes( array $touched_items, array $deleted_ids ): bool {
		$current = $this->read_stored();

		foreach ( $deleted_ids as $id ) {
			unset( $current[ $id ] );
		}

		foreach ( $touched_items as $id => $item ) {
			if ( ! empty( $item['sync_to_v3'] ) && (bool) $item['sync_to_v3'] ) {
				$current[ $id ] = true;
			} else {
				unset( $current[ $id ] );
			}
		}

		return $this->set_map( $current );
	}

	private function read_stored(): array {
		if ( null !== $this->cache ) {
			return $this->cache;
		}

		$kit = $this->get_kit();

		if ( ! $kit ) {
			$this->cache = [];

			return [];
		}

		$raw = $kit->get_meta( self::META_KEY );
		$this->cache = is_array( $raw ) ? $raw : [];

		return $this->cache;
	}
}
