<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Labels {

	const META_KEY_FRONTEND = '_elementor_global_classes_labels';
	const META_KEY_PREVIEW = '_elementor_global_classes_labels_preview';

	const META_KEY = self::META_KEY_FRONTEND;

	private Kit $kit;

	private string $context = Global_Classes_Repository::CONTEXT_FRONTEND;

	private ?array $cache = null;

	private function __construct( Kit $kit ) {
		$this->kit = $kit;
	}

	public static function make( Kit $kit ): self {
		return new self( $kit );
	}

	public function context( string $context ): self {
		$this->context = $context;
		$this->cache = null;

		return $this;
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

		if ( Global_Classes_Repository::CONTEXT_PREVIEW === $this->context ) {
			$frontend_map = self::make( $this->get_kit() )
				->context( Global_Classes_Repository::CONTEXT_FRONTEND )
				->get_labels();
			foreach ( $order as $id ) {
				if ( ! isset( $map[ $id ] ) && isset( $frontend_map[ $id ] ) ) {
					$map[ $id ] = $frontend_map[ $id ];
				}
			}
		}

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

		$result = $kit->update_meta( $this->meta_key(), $id_to_label );
		$this->cache = $id_to_label;

		return false !== $result;
	}

	public function remove_label( string $class_id ): void {
		$map = $this->get_labels();
		unset( $map[ $class_id ] );
		$this->set_labels( $map );
	}

	private function meta_key(): string {
		return Global_Classes_Repository::CONTEXT_PREVIEW === $this->context
			? self::META_KEY_PREVIEW
			: self::META_KEY_FRONTEND;
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

		$raw = $kit->get_meta( $this->meta_key() );
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
