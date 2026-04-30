<?php

namespace Elementor\Modules\DynamicAssetsManager;

use Elementor\Core\Base\Document;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Enqueue_Controller {

	private Registry $registry;

	private Legacy_Widget_Depends_Adapter $adapter;

	private Document_Widget_Type_Scanner $scanner;

	public function __construct( Registry $registry, Legacy_Widget_Depends_Adapter $adapter, Document_Widget_Type_Scanner $scanner ) {
		$this->registry = $registry;
		$this->adapter = $adapter;
		$this->scanner = $scanner;
	}

	public function enqueue_managed_widget_styles_for_document( int $post_id ): void {
		foreach ( $this->handles_to_enqueue_for_document( $post_id, 'styles' ) as $handle ) {
			wp_enqueue_style( $handle );
		}
	}

	public function enqueue_managed_widget_scripts_for_document( int $post_id ): void {
		foreach ( $this->handles_to_enqueue_for_document( $post_id, 'scripts' ) as $handle ) {
			wp_enqueue_script( $handle );
		}
	}

	public function get_server_enqueued_handle_ids( int $post_id ): array {
		return array_values(
			array_unique(
				array_merge(
					$this->handles_to_enqueue_for_document( $post_id, 'scripts' ),
					$this->handles_to_enqueue_for_document( $post_id, 'styles' )
				)
			)
		);
	}

	public function get_client_asset_map( int $post_id, Consumer_Context $context ): array {
		$map = [];

		foreach ( $this->registry->get_managed_widget_types() as $widget_type ) {
			$graph = $this->adapter->get_graph_for_widget_type( $widget_type );
			$expanded_scripts = $this->expand_script_handles( $graph['scripts'] );
			$expanded_styles = $this->expand_style_handles( $graph['styles'] );
			$nodes = $this->adapter->build_client_nodes( $expanded_scripts, $expanded_styles );

			foreach ( $nodes as $handle => $node ) {
				if ( is_array( $node ) ) {
					$map[ $handle ] = $node;
				}
			}
		}

		return apply_filters( Hooks::FILTER_CLIENT_ASSET_MAP, $map, $context, $post_id );
	}

	private function handles_to_enqueue_for_document( int $post_id, string $kind ): array {
		$context = Preview_Assets_Coordinator::get_context();
		if ( ! $context ) {
			return [];
		}

		$used_types = $this->get_used_managed_widget_types( $post_id );
		$used_types = apply_filters( Hooks::FILTER_SCAN_DOCUMENT_TYPES, $used_types, $context, $post_id );

		$handles = [];

		foreach ( $used_types as $widget_type ) {
			$graph = $this->adapter->get_graph_for_widget_type( $widget_type );
			$key = 'scripts' === $kind ? 'scripts' : 'styles';
			foreach ( $graph[ $key ] as $handle ) {
				$handles[] = $handle;
			}
		}

		if ( 'scripts' === $kind ) {
			$handles = $this->expand_script_handles( $handles );
		} else {
			$handles = $this->expand_style_handles( $handles );
		}

		$handles = array_values( array_unique( $handles ) );
		$handles = apply_filters( Hooks::FILTER_ENQUEUE_HANDLES, $handles, $kind, $context, $post_id );

		return $handles;
	}

	private function get_used_managed_widget_types( int $post_id ): array {
		$skip_zero = apply_filters( Hooks::FILTER_SKIP_ZERO_USAGE, true, Preview_Assets_Coordinator::get_context(), $post_id );

		if ( ! $skip_zero ) {
			return $this->registry->get_managed_widget_types();
		}

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document instanceof Document ) {
			return [];
		}

		$elements = $document->get_elements_data();
		if ( ! is_array( $elements ) ) {
			$elements = [];
		}

		$found = $this->scanner->collect_widget_types_from_elements( $elements );

		return array_values( array_filter( $found, [ $this->registry, 'is_managed_widget_type' ] ) );
	}

	private function expand_script_handles( array $roots ): array {
		global $wp_scripts;

		return $this->expand_handles( $roots, $wp_scripts );
	}

	private function expand_style_handles( array $roots ): array {
		global $wp_styles;

		return $this->expand_handles( $roots, $wp_styles );
	}

	private function expand_handles( array $roots, $queue ): array {
		if ( ! $queue ) {
			return $roots;
		}

		$out = [];
		$stack = array_values( array_unique( $roots ) );

		while ( ! empty( $stack ) ) {
			$h = array_pop( $stack );
			if ( in_array( $h, $out, true ) ) {
				continue;
			}
			$out[] = $h;

			if ( empty( $queue->registered[ $h ] ) ) {
				continue;
			}

			$deps = $queue->registered[ $h ]->deps;
			if ( is_array( $deps ) ) {
				foreach ( $deps as $dep ) {
					if ( is_string( $dep ) && ! in_array( $dep, $out, true ) ) {
						$stack[] = $dep;
					}
				}
			}
		}

		return $out;
	}
}
