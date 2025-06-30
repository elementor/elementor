<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Core\Breakpoints\Breakpoint;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer;
use Elementor\Plugin;
use function ElementorDeps\DI\value;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Styles_Manager {
	private static ?self $instance = null;

	private array $registered_styles_by_key = [];

	private array $post_ids = [];

	const DEFAULT_BREAKPOINT = 'desktop';

	public static function instance() {
		if ( ! self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public function register_hooks() {
		add_action( 'elementor/frontend/after_enqueue_post_styles', fn() => $this->enqueue_styles() );
		add_action( 'elementor/post/render', function( $post_id ) {
			$this->post_ids[] = $post_id;
		} );
	}

	public function register( string $key, callable $get_style_defs ) {
		$this->registered_styles_by_key[ $key ] = $get_style_defs;
	}

	private function enqueue_styles() {
		if ( empty( $this->post_ids )) {
			return;
		}

		do_action( 'elementor/atomic-widgets/styles/register', $this, $this->post_ids );

		$styles_by_key = Collection::make( $this->registered_styles_by_key )->map_with_keys( function( $get_styles, $style_key ) {
			return [
				$style_key => $this->once( $style_key, $get_styles ),
			];
		} )->all();

		$breakpoints = $this->get_breakpoints();
		foreach ( $breakpoints as $breakpoint_key ) {
			foreach ( $styles_by_key as $style_key => $get_styles ) {
				$render_css = function () use ( $get_styles, $style_key, $breakpoint_key ) {

					$grouped_styles = $this->group_by_breakpoint( $get_styles() );

					return $this->render_css( $grouped_styles[ $breakpoint_key ] ?? [], $breakpoint_key );
				};

				$style_file = ( new CSS_Files_Manager() )->get( $style_key . '-' . $breakpoint_key, $render_css );

				if ( ! $style_file ) {
					continue;
				}

				wp_enqueue_style(
					$style_file->get_handle(),
					$style_file->get_url(),
					[],
					$style_file->get_media()
				);
			}
		}
	}

	private function render_css( array $styles, string $breakpoint_key ) {
		$css = Styles_Renderer::make(
			Plugin::$instance->breakpoints->get_breakpoints_config()
		)->on_prop_transform( function( $key, $value ) {
			if ( 'font-family' !== $key ) {
				return;
			}

			Plugin::instance()->frontend->enqueue_font( $value );
		} )->render( $styles );

		$breakpoint_config = Plugin::$instance->breakpoints->get_breakpoints_config()[ $breakpoint_key ] ?? null;

		$media = $breakpoint_config ? Styles_Renderer::get_media_query( $breakpoint_config ) : 'all';

		return [
			'content' => $css,
			'media' => $media,
		];
	}

	private function group_by_breakpoint( $styles ) {
		return Collection::make( $styles )->reduce( function( $group, $style ) {
			Collection::make( $style['variants'] )->each( function( $variant ) use ( &$group, $style ) {
				$breakpoint = $variant['meta']['breakpoint'] ?? self::DEFAULT_BREAKPOINT;

				if ( !isset( $group[ $breakpoint ][ $style['id'] ] ) ) {
					$group[ $breakpoint ][ $style['id'] ] = [
						'id' => $style['id'],
						'type' => $style['type'],
						'variants' => [],
					];
				}

				$group[ $breakpoint ][ $style['id'] ]['variants'][] = $variant;
			} );

			return $group;
		},  [] );
	}

	private function get_breakpoints() {
		return Collection::make( Plugin::$instance->breakpoints->get_breakpoints() )
			->map( fn( Breakpoint $breakpoint ) => $breakpoint->get_name() )
			->reverse()
			->prepend( self::DEFAULT_BREAKPOINT )
			->all();
	}

	private function once( $key, $callback ) {
		$cache = [];

		return function() use ( $key, $callback, &$cache ) {
			if ( isset( $cache[ $key ] ) ) {
				return $cache[ $key ];
			}

			$cache[ $key ] = $callback();

			return $cache[ $key ];
		};
	}
}
