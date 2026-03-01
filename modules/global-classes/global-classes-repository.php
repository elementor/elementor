<?php
namespace Elementor\Modules\GlobalClasses;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Orchestrator;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Classes_Repository {

	const META_KEY_FRONTEND = '_elementor_global_classes';
	const META_KEY_PREVIEW = '_elementor_global_classes_preview';

	const CONTEXT_FRONTEND = 'frontend';
	const CONTEXT_PREVIEW = 'preview';

	private string $context = self::CONTEXT_FRONTEND;

	private ?Global_Classes $cache = null;

	public static function make(): Global_Classes_Repository {
		return new self();
	}

	public function context( string $context ): self {
		$this->context = $context;
		$this->cache = null;

		return $this;
	}

	public function all( bool $force = false ): Global_Classes {
		if ( ! $force && null !== $this->cache ) {
			return $this->cache;
		}

		$meta_key = $this->get_meta_key();
		$kit = $this->get_kit();
		$all = $kit->get_json_meta( $meta_key );

		$is_preview = static::META_KEY_PREVIEW === $meta_key;
		$is_empty = empty( $all );

		if ( $is_preview && $is_empty ) {
			$all = $kit->get_json_meta( static::META_KEY_FRONTEND );
		}

		Migrations_Orchestrator::make()->migrate(
			$all,
			$kit->get_id(),
			$meta_key,
			function( $migrated_data ) use ( $kit, $meta_key ) {
				$kit->update_json_meta( $meta_key, $migrated_data );
			}
		);

		$this->cache = Global_Classes::make( $all['items'] ?? [], $all['order'] ?? [] );

		return $this->cache;
	}

	public function put( array $items, array $order ) {
		$current_value = $this->all()->get();

		$updated_value = [
			'items' => $items,
			'order' => $order,
		];

		// `update_metadata` fails for identical data, so we skip it.
		if ( $current_value === $updated_value ) {
			return;
		}

		$meta_key = $this->get_meta_key();
		$value = $this->get_kit()->update_json_meta( $meta_key, $updated_value );

		$should_delete_preview = static::META_KEY_FRONTEND === $meta_key;

		if ( $should_delete_preview ) {
			$this->get_kit()->delete_meta( static::META_KEY_PREVIEW );
		}

		if ( ! $value ) {
			throw new \Exception( 'Failed to update global classes' );
		}

		$this->cache = null;

		do_action( 'elementor/global_classes/update', $this->context, $updated_value, $current_value );
	}

	private function get_meta_key(): string {
		return static::CONTEXT_FRONTEND === $this->context
			? static::META_KEY_FRONTEND
			: static::META_KEY_PREVIEW;
	}

	private function get_kit() {
		return Plugin::$instance->kits_manager->get_active_kit();
	}
}
