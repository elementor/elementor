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

	const DEFAULT_BREAKPOINT = 'desktop';

	public static function instance() {
		if ( ! self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public function register_hooks() {
		add_action( 'elementor/frontend/after_enqueue_post_styles', fn() => $this->enqueue_styles() );
	}

	public function register( string $key, callable $get_style_defs ) {
		$this->registered_styles_by_key[ $key ] = $get_style_defs;
	}

	private function enqueue_styles() {
		$post_ids = apply_filters( 'elementor/atomic-widgets/styles/posts', [] );

		if ( ! is_array( $post_ids ) || empty( $post_ids ) ) {
			return;
		}

		do_action( 'elementor/atomic-widgets/styles/register', $this, $post_ids );

		$styles_cache = [];

		$breakpoints = $this->get_breakpoints();
		foreach ( $breakpoints as $breakpoint_key ) {
			foreach ( $this->registered_styles_by_key as $style_key => $get_styles ) {
				$render_css = function () use ( $get_styles, &$styles_cache, $style_key, $breakpoint_key ) {
					if ( ! isset( $styles_cache[ $style_key ] ) ) {
						$styles_cache[ $style_key ] = $get_styles();
					}

					$grouped_styles = $this->group_by_breakpoint( $styles_cache[ $style_key ] );

					return $this->render_css( $grouped_styles[ $breakpoint_key ] ?? [], $breakpoint_key );
				};

				try {
					$style_file = ( new CSS_Files_Manager() )->get( $style_key . '-' . $breakpoint_key, $render_css );

					wp_enqueue_style(
						$style_file->get_handle(),
						$style_file->get_url(),
						[],
						$style_file->get_media()
					);
				} catch ( \Exception $e ) {
					continue;
				}
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

		$breakpoint_instance = Plugin::$instance->breakpoints->get_breakpoints( $breakpoint_key );

		$media = $breakpoint_instance
			? 'screen and (max-width: ' . $breakpoint_instance->get_value() . 'px)'
			: 'all';

		return [
			'content' => $css,
			'media' => $media,
		];
	}

	private function group_by_breakpoint( $styles ) {
		$groups = [];

		foreach ( $styles as $style ) {
			foreach ( $style['variants'] as $variant ) {
				$breakpoint = $variant['meta']['breakpoint'] ?? 'desktop';

				$groups[ $breakpoint ][] = [
					'id' => $style['id'],
					'type' => $style['type'],
					'variants' => [ $variant ],
				];
			}
		}

		return $groups;
	}

	private function get_breakpoints() {
		return Collection::make( Plugin::$instance->breakpoints->get_breakpoints() )
			->map( fn( Breakpoint $breakpoint ) => $breakpoint->get_name() )
			->reverse()
			->prepend( self::DEFAULT_BREAKPOINT )
			->all();
	}
}
