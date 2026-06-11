<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Plugin;
use Elementor\Modules\AtomicWidgets\Styles\Atomic_Styles_Manager;

class Atomic_Global_Styles {
	const STYLES_KEY = 'global';

	private Global_Classes_Relations $relations;

	public function __construct( Global_Classes_Relations $relations ) {
		$this->relations = $relations;
	}

	public function register_hooks() {
		add_action(
			'elementor/atomic-widgets/styles/register',
			fn( Atomic_Styles_Manager $styles_manager, array $post_ids ) => $this->register_styles( $styles_manager, $post_ids ),
			20,
			2
		);

		add_action(
			'elementor/global_classes/update',
			fn( string $context, array $changes ) => $this->invalidate_cache_for_updated_classes( $context, $changes ),
			10,
			2
		);

		add_action(
			'deleted_post',
			fn( $post_id ) => $this->on_kit_delete( $post_id )
		);

		add_action(
			'elementor/core/files/clear_cache',
			fn() => $this->invalidate_all_cache(),
		);

		add_filter(
			'elementor/atomic-widgets/settings/transformers/classes',
			fn( $value ) => $this->transform_classes_names( $value )
		);
	}

	private function register_styles( Atomic_Styles_Manager $styles_manager, array $post_ids ) {
		$context = $this->get_context();

		// #region agent log
		$log_payload = [
			'sessionId'    => 'a2248d',
			'location'     => 'atomic-global-styles.php:register_styles',
			'message'      => 'Atomic_Global_Styles::register_styles called',
			'hypothesisId' => 'E',
			'data'         => [
				'context'    => $context,
				'post_ids'   => $post_ids,
				'post_count' => count( $post_ids ),
			],
			'timestamp'    => round( microtime( true ) * 1000 ),
		];
		file_put_contents(
			'/Users/ronros/Local Sites/multi-local-site-1/app/public/wp-content/plugins/.cursor/debug-a2248d.log',
			json_encode( $log_payload ) . "\n",
			FILE_APPEND
		);
		// #endregion

		foreach ( $post_ids as $post_id ) {
			$get_styles = fn() => $this->get_document_global_styles( $post_id, $context );

			$styles_manager->register(
				[ self::STYLES_KEY, $post_id, $context ],
				$get_styles
			);
		}
	}

	private function get_document_global_styles( int $post_id, string $context ): array {
		$is_preview = Global_Classes_Repository::CONTEXT_PREVIEW === $context;
		$class_ids = $this->relations->set_preview( $is_preview )->get_styles_by_post( $post_id );

		if ( empty( $class_ids ) ) {
			return [];
		}

		$repository = Global_Classes_Repository::make();

		if ( $is_preview ) {
			$repository->set_preview( true );
		}

		$global_order = $repository->all_labels();
		$ordered_class_ids = array_values( array_intersect( array_keys( $global_order ), $class_ids ) );

		if ( empty( $ordered_class_ids ) ) {
			return [];
		}

		$items = $repository->get_by_ids( $ordered_class_ids );
		$reversed_order = array_reverse( $ordered_class_ids );

		$styles = [];

		// #region agent log
		$log_payload = [
			'sessionId'    => 'a2248d',
			'location'     => 'atomic-global-styles.php:get_document_global_styles',
			'message'      => 'Atomic_Global_Styles::get_document_global_styles',
			'hypothesisId' => 'E',
			'data'         => [
				'post_id'             => $post_id,
				'context'             => $context,
				'class_ids_count'     => count( $class_ids ),
				'ordered_ids_count'   => count( $ordered_class_ids ),
				'items_fetched_count' => count( $items ),
			],
			'timestamp'    => round( microtime( true ) * 1000 ),
		];
		file_put_contents(
			'/Users/ronros/Local Sites/multi-local-site-1/app/public/wp-content/plugins/.cursor/debug-a2248d.log',
			json_encode( $log_payload ) . "\n",
			FILE_APPEND
		);
		// #endregion

		foreach ( $reversed_order as $class_id ) {
			$item = $items[ $class_id ] ?? null;

			if ( ! $item ) {
				continue;
			}

			$resolved_label = $global_order[ $class_id ] ?? $item['label'];
			$item['id'] = $resolved_label;
			$item['label'] = $resolved_label;
			$styles[] = $item;
		}

		return $styles;
	}

	private function on_kit_delete( $post_id ) {
		if ( ! Plugin::$instance->kits_manager->is_kit( $post_id ) ) {
			return;
		}

		$this->invalidate_all_cache();
	}

	private function invalidate_cache_for_updated_classes( string $context, array $changes ) {
		// #region agent log
		$log_payload = [
			'sessionId'    => 'a2248d',
			'location'     => 'atomic-global-styles.php:invalidate_cache_for_updated_classes',
			'message'      => 'Atomic_Global_Styles::invalidate_cache_for_updated_classes',
			'hypothesisId' => 'E',
			'data'         => [
				'context' => $context,
				'changes' => $changes,
			],
			'timestamp'    => round( microtime( true ) * 1000 ),
		];
		file_put_contents(
			'/Users/ronros/Local Sites/multi-local-site-1/app/public/wp-content/plugins/.cursor/debug-a2248d.log',
			json_encode( $log_payload ) . "\n",
			FILE_APPEND
		);
		// #endregion

		if ( isset( $changes['order'] ) && $changes['order'] ) {
			$this->invalidate_all_cache( $context );

			return;
		}

		$affected = array_unique( array_merge(
			$changes['added'] ?? [],
			$changes['deleted'] ?? [],
			$changes['modified'] ?? []
		) );

		if ( empty( $affected ) ) {
			return;
		}

		$document_ids = [];
		$is_preview = Global_Classes_Repository::CONTEXT_PREVIEW === $context;

		if ( ! empty( $changes['affected_post_ids'] ) ) {
			foreach ( $changes['affected_post_ids'] as $post_id ) {
				$document_ids[ (int) $post_id ] = true;
			}
		}

		foreach ( $affected as $class_id ) {
			foreach ( $this->relations->set_preview( $is_preview )->get_posts_by_style( $class_id ) as $doc_id ) {
				$document_ids[ $doc_id ] = true;
			}
		}

		if ( empty( $document_ids ) ) {
			return;
		}

		foreach ( array_keys( $document_ids ) as $post_id ) {
			$this->invalidate_document_cache( $post_id, $context );
		}
	}

	private function invalidate_document_cache( int $post_id, ?string $context = null ) {
		if ( empty( $context ) ) {
			do_action( 'elementor/atomic-widgets/styles/clear', [ self::STYLES_KEY, $post_id ] );
		} else {
			do_action( 'elementor/atomic-widgets/styles/clear', [ self::STYLES_KEY, $post_id, $context ] );
		}
	}

	private function invalidate_all_cache( ?string $context = null ) {
		// #region agent log
		$log_payload = [
			'sessionId'    => 'a2248d',
			'location'     => 'atomic-global-styles.php:invalidate_all_cache',
			'message'      => 'Atomic_Global_Styles::invalidate_all_cache',
			'hypothesisId' => 'E',
			'data'         => [
				'context' => $context,
			],
			'timestamp'    => round( microtime( true ) * 1000 ),
		];
		file_put_contents(
			'/Users/ronros/Local Sites/multi-local-site-1/app/public/wp-content/plugins/.cursor/debug-a2248d.log',
			json_encode( $log_payload ) . "\n",
			FILE_APPEND
		);
		// #endregion

		if ( empty( $context ) || Global_Classes_Repository::CONTEXT_FRONTEND === $context ) {
			do_action( 'elementor/atomic-widgets/styles/clear', [ self::STYLES_KEY ] );

			return;
		}

		do_action( 'elementor/atomic-widgets/styles/clear', [ self::STYLES_KEY, $context ] );
	}

	private function transform_classes_names( $ids ) {

		$labels = Global_Classes_Repository::make()
			->set_preview( $this->is_preview() )
			->all_labels();

		return array_map(
			static function( $id ) use ( $labels ) {
				return $labels[ $id ] ?? $id;
			},
			$ids
		);
	}

	private function get_context(): string {
		return $this->is_preview()
			? Global_Classes_Repository::CONTEXT_PREVIEW
			: Global_Classes_Repository::CONTEXT_FRONTEND;
	}

	private function is_preview(): bool {
		return Plugin::$instance->preview->is_editor_or_preview();
	}
}
