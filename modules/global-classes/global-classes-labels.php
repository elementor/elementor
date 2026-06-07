<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Concerns\Has_Kit_Dependency;
use Elementor\Modules\GlobalClasses\Concerns\Has_Preview_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Labels {
	use Has_Kit_Dependency;
	use Has_Preview_Context;

	const META_KEY_FRONTEND = '_elementor_global_classes_labels';
	const META_KEY_PREVIEW = '_elementor_global_classes_labels_preview';

	const META_KEY = self::META_KEY_FRONTEND;

	protected array $context_keys = [
		'labels' => [
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

	public function get_labels(): array {
		$stored = $this->read_stored();

		if ( empty( $stored ) ) {
			return [];
		}

		return $stored;
	}

	public function get_ordered_labels(): array {
		$order = Global_Classes_Order::make( $this->get_kit() )->set_preview( $this->is_preview() )->get_order();
		$map = $this->get_labels();

		if ( $this->is_preview() ) {
			$frontend_map = self::make( $this->get_kit() )->get_labels();
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

	public static function generate_unique_label( string $label, array $existing_labels ): string {
		$prefix = 'DUP_';
		$max_length = 50;

		$has_prefix = str_starts_with( $label, $prefix );

		if ( $has_prefix ) {
			$base = substr( $label, strlen( $prefix ) );
			$counter = 1;
			$candidate = $prefix . $base . $counter;

			while ( in_array( $candidate, $existing_labels, true ) ) {
				$candidate = $prefix . $base . ( ++$counter );
			}

			if ( strlen( $candidate ) > $max_length ) {
				$base = substr( $base, 0, $max_length - strlen( $prefix . $counter ) );
				$candidate = $prefix . $base . $counter;
			}

			return $candidate;
		}

		$available_length = strlen( $label );
		$candidate = $prefix . $label;

		if ( strlen( $candidate ) > $max_length ) {
			$available_length = $max_length - strlen( $prefix );
			$candidate = $prefix . substr( $label, 0, $available_length );
		}

		$base = substr( $label, 0, $available_length );
		$counter = 1;

		while ( in_array( $candidate, $existing_labels, true ) ) {
			$candidate = $prefix . $base . $counter;

			if ( strlen( $candidate ) > $max_length ) {
				$base = substr( $label, 0, $max_length - strlen( $prefix . $counter ) );
				$candidate = $prefix . $base . $counter;
			}

			++$counter;
		}

		return $candidate;
	}

	public function set_labels( array $id_to_label ): bool {
		$kit = $this->get_kit();

		if ( ! $kit ) {
			return false;
		}

		$result = $kit->update_meta( $this->get_context_key( 'labels' ), $id_to_label );
		$this->cache = $id_to_label;

		return false !== $result;
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

		$raw = $kit->get_meta( $this->get_context_key( 'labels' ) );
		$this->cache = is_array( $raw ) ? $raw : [];

		return $this->cache;
	}
}
