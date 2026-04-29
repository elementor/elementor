<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Labels {

	const META_KEY = '_elementor_global_classes_labels';

	private Kit $kit;

	private ?array $cache = null;

	private function __construct( Kit $kit ) {
		$this->kit = $kit;
	}

	public static function make( Kit $kit ): self {
		return new self( $kit );
	}

	public function get_labels(): array {
		$stored = $this->read_stored();

		if ( empty( $stored ) ) {
			return [];
		}

		return $stored;
	}

	public function get_ordered_labels(): array {
		$order = Global_Classes_Order::make( $this->get_kit() )->get_order();
		$map = $this->get_labels();
		$result = [];

		foreach ( $order as $id ) {
			if ( isset( $map[ $id ] ) ) {
				$result[ $id ] = $map[ $id ];
			}
		}

		return $result;
	}

	public function set_labels( array $id_to_label ): bool {
		$kit = $this->get_kit();

		if ( ! $kit ) {
			return false;
		}

		$result = $kit->update_meta( self::META_KEY, $id_to_label );
		$this->cache = $id_to_label;

		return false !== $result;
	}

	public function set_label( string $class_id, string $label ): void {
		$map = $this->get_labels();
		$map[ $class_id ] = $label;
		$this->set_labels( $map );
	}

	public function remove_label( string $class_id ): void {
		$map = $this->get_labels();
		unset( $map[ $class_id ] );
		$this->set_labels( $map );
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

	private function get_kit(): ?Kit {
		if ( ! $this->kit ) {
			$this->kit = Plugin::$instance->kits_manager->get_active_kit();
		}

		return $this->kit;
	}
}
