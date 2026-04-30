<?php

namespace Elementor\Modules\DynamicAssetsManager;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Legacy_Widget_Depends_Adapter {

	public function get_graph_for_widget_type( string $widget_type ): array {
		$widget = Plugin::$instance->widgets_manager->get_widget_types( $widget_type );

		if ( ! $widget ) {
			return [
				'scripts' => [],
				'styles' => [],
			];
		}

		return [
			'scripts' => array_values( array_unique( $widget->get_script_depends() ) ),
			'styles' => array_values( array_unique( $widget->get_style_depends() ) ),
		];
	}

	public function build_client_nodes( array $script_handles, array $style_handles ): array {
		global $wp_scripts, $wp_styles;

		$nodes = [];

		foreach ( $script_handles as $handle ) {
			$nodes[ $handle ] = $this->node_from_wp( 'script', $handle, $wp_scripts );
		}

		foreach ( $style_handles as $handle ) {
			$nodes[ $handle ] = $this->node_from_wp( 'style', $handle, $wp_styles );
		}

		return array_filter( $nodes );
	}

	private function node_from_wp( string $kind, string $handle, $queue ): ?array {
		if ( ! $queue || ! isset( $queue->registered[ $handle ] ) ) {
			return null;
		}

		$obj = $queue->registered[ $handle ];
		$src = $obj->src;

		if ( empty( $src ) ) {
			return null;
		}

		if ( ! preg_match( '|^(https?:)?//|', $src ) ) {
			$src = $queue->base_url . ( '/' === $src[0] ? substr( $src, 1 ) : $src );
		}

		$deps = is_array( $obj->deps ) ? $obj->deps : [];

		return [
			'handle' => $handle,
			'kind' => $kind,
			'uri' => $src,
			'ver' => $obj->ver ?? '',
			'deps' => array_values( array_filter( $deps, 'is_string' ) ),
		];
	}
}
