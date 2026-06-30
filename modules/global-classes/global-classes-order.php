<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Concerns\Has_Kit_Dependency;
use Elementor\Modules\GlobalClasses\Concerns\Has_Preview_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Order {
	use Has_Kit_Dependency;
	use Has_Preview_Context;

	const META_KEY = '_elementor_global_classes_order';
	const META_KEY_PREVIEW = '_elementor_global_classes_order_preview';

	protected array $context_keys = [
		'order' => [
			'frontend' => self::META_KEY,
			'preview' => self::META_KEY_PREVIEW,
		],
	];

	private ?array $cache = null;

	private function __construct() {
	}

	public static function make( Kit $kit ): self {
		return ( new self() )->set_kit( $kit );
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

		$result = $kit->update_meta( $this->get_context_key( 'order' ), $payload );
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

		$payload = $kit->get_meta( $this->get_context_key( 'order' ) );

		if ( $this->is_preview() && empty( $payload ) ) {
			$payload = self::make( $this->get_kit() )->set_preview( false )->read_kit_meta_payload();
		}

		$this->cache = is_array( $payload ) ? $payload : [];

		return $this->cache;
	}
}
