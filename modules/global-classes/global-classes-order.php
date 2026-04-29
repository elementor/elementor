<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Order {
	const META_KEY = '_elementor_global_classes_order';

	private Kit $kit;

	private ?array $cache = null;

	private function __construct( Kit $kit ) {
		$this->kit = $kit;
	}

	public static function make( Kit $kit ): self {
		return new self( $kit );
	}

	public function get_order(): array {
		$payload = $this->read_kit_meta_payload();

		return $payload['order'] ?? [];
	}

	public function set_order( array $ids ): bool {
		$kit = $this->get_kit();

		if ( ! $kit ) {
			return false;
		}

		$payload = [
			'order' => array_values( $ids ),
		];

		$result = $kit->update_meta( self::META_KEY, $payload );
		$this->cache = null;

		return false !== $result;
	}

	public function remove_class_id( string $id ): bool {
		$order = $this->get_order();

		if ( ! in_array( $id, $order, true ) ) {
			return true;
		}

		$order = array_filter( $order, fn( $item ) => $item !== $id );

		return $this->set_order( $order );
	}

	private function read_kit_meta_payload(): array {
		if ( null !== $this->cache ) {
			return $this->cache;
		}

		$kit = $this->get_kit();

		if ( ! $kit ) {
			return [];
		}

		$payload = $kit->get_meta( self::META_KEY );
		$this->cache = is_array( $payload ) ? $payload : [];

		return $this->cache;
	}

	private function get_kit() {
		return $this->kit ?? Plugin::$instance->kits_manager->get_active_kit();
	}
}
