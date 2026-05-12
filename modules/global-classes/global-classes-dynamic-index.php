<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Concerns\Has_Kit_Dependency;
use Elementor\Modules\GlobalClasses\Concerns\Has_Preview_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Dynamic_Index {
	use Has_Kit_Dependency;
	use Has_Preview_Context;

	const META_KEY_FRONTEND = '_elementor_global_classes_dynamic';
	const META_KEY_PREVIEW = '_elementor_global_classes_dynamic_preview';

	protected array $context_keys = [
		'meta_key' => [
			'frontend' => self::META_KEY_FRONTEND,
			'preview' => self::META_KEY_PREVIEW,
		],
	];

	private ?array $cache = null;

	private function __construct() {
	}

	public static function make( Kit $kit ): self {
		return ( new self() )->set_kit( $kit );
	}

	protected function on_preview_change(): void {
		$this->cache = null;
	}

	public function get_ids(): array {
		return $this->read_stored();
	}

	public function set_ids( array $ids ): bool {
		$kit = $this->get_kit();

		if ( ! $kit ) {
			return false;
		}

		$normalized = array_values( array_unique( $ids ) );
		$result = $kit->update_meta( $this->get_context_key( 'meta_key' ), $normalized );
		$this->cache = $normalized;

		return false !== $result;
	}

	public function mark( string $class_id, bool $is_dynamic ): void {
		$ids = $this->read_stored();
		$has = in_array( $class_id, $ids, true );

		if ( $is_dynamic && ! $has ) {
			$ids[] = $class_id;
			$this->set_ids( $ids );

			return;
		}

		if ( ! $is_dynamic && $has ) {
			$this->set_ids( array_values( array_filter( $ids, fn( $id ) => $id !== $class_id ) ) );
		}
	}

	public function remove( string $class_id ): void {
		$ids = $this->read_stored();

		if ( ! in_array( $class_id, $ids, true ) ) {
			return;
		}

		$this->set_ids( array_values( array_filter( $ids, fn( $id ) => $id !== $class_id ) ) );
	}

	public function has_any( array $class_ids ): bool {
		if ( empty( $class_ids ) ) {
			return false;
		}

		return ! empty( array_intersect( $class_ids, $this->read_stored() ) );
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

		$raw = $kit->get_meta( $this->get_context_key( 'meta_key' ) );
		$this->cache = is_array( $raw ) ? array_values( $raw ) : [];

		return $this->cache;
	}
}
