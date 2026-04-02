<?php
namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
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

	private ?Kit $kit = null;

	public function __construct( ?Kit $kit = null ) {
		$this->kit = $kit;
	}

	public static function make( ?Kit $kit = null ): Global_Classes_Repository {
		return new self( $kit );
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

	/**
	 * @param array $items            Map of class ID → class data.
	 * @param array $order            Ordered list of class IDs.
	 * @param bool  $preserve_preview When true, skip deleting the preview context after writing
	 *                                to the frontend. Pass true from MCP ability writes to avoid
	 *                                destroying in-editor unpublished changes. The default (false)
	 *                                preserves the existing editor publish-flow behavior.
	 * @param bool  $force_write      When true, skip the equality check and always write. Needed
	 *                                when mirroring data to preview: the preview fallback to
	 *                                frontend makes the two look equal, so the guard would fire
	 *                                and skip the write even though no preview meta exists yet.
	 * @throws \Exception When the meta update fails.
	 */
	public function put( array $items, array $order, bool $preserve_preview = false, bool $force_write = false ) {
		$current_value = $this->all()->get();

		$updated_value = [
			'items' => $items,
			'order' => $order,
		];

		// `update_metadata` fails for identical data, so we skip it.
		// $force_write bypasses this when the equality is an artefact of the preview fallback.
		if ( ! $force_write && $current_value === $updated_value ) {
			return;
		}

		$meta_key = $this->get_meta_key();
		$value = $this->get_kit()->update_json_meta( $meta_key, $updated_value );

		$should_delete_preview = static::META_KEY_FRONTEND === $meta_key && ! $preserve_preview;

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

	private function get_kit(): Kit {
		return $this->kit ?? Plugin::$instance->kits_manager->get_active_kit();
	}
}
