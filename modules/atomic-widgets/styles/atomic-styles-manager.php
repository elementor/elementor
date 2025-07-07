<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Core\Base\Document;
use Elementor\Core\Breakpoints\Breakpoint;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Memo;
use Elementor\Modules\AtomicWidgets\Cache_Validity;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Styles_Manager {
	private static ?self $instance = null;

	/**
	 * @var array<string, array{styles: callable, cache_keys: array<string>}>
	 */
	private array $registered_styles_by_key = [];

	private Cache_Validity $cache_validity;

	private array $post_ids = [];

	private CSS_Files_Manager $css_files_manager;

	const DEFAULT_BREAKPOINT = 'desktop';

	public function __construct() {
		$this->css_files_manager = new CSS_Files_Manager();
		$this->cache_validity = new Cache_Validity();
	}

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

	public function register( string $key, callable $get_style_defs, array $cache_keys ) {
		$this->registered_styles_by_key[ $key ] = [
			'get_styles' => $get_style_defs,
			'cache_keys' => $cache_keys,
		];
	}

	private function enqueue_styles() {
		if ( empty( $this->post_ids ) ) {
			return;
		}

		do_action( 'elementor/atomic-widgets/styles/register', $this, $this->post_ids );

		$get_styles_memo = new Memo();

		$styles_by_key = Collection::make( $this->registered_styles_by_key )
			->map_with_keys( fn ( $style_params, $style_key ) => [
				$style_key => [
					'get_styles' => $get_styles_memo->memoize( $style_key, $style_params['get_styles'] ),
					'cache_keys' => $style_params['cache_keys'],
				],
			])
			->all();

		$group_by_breakpoint_memo = new Memo();
		$breakpoints = $this->get_breakpoints();
		foreach ( $breakpoints as $breakpoint_key ) {
			foreach ( $styles_by_key as $style_key => $style_params ) {
				$cache_keys = $style_params['cache_keys'];
				$render_css = fn() => $this->render_css_by_breakpoints( $style_params['get_styles'], $style_key, $breakpoint_key, $group_by_breakpoint_memo );

				$breakpoint_media = $this->get_breakpoint_media( $breakpoint_key );

				if ( ! $breakpoint_media ) {
					continue;
				}

				$breakpoint_cache_keys = array_merge( $cache_keys, [ $breakpoint_key ] );

                                $style_file = $this->css_files_manager->get(
					$style_key . '-' . $breakpoint_key,
					$breakpoint_media,
					$render_css,
					$this->cache_validity->is_valid( $breakpoint_cache_keys )
				);

				$this->cache_validity->validate( $breakpoint_cache_keys );

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

	private function render_css( array $styles ) {
		$css = Styles_Renderer::make(
			Plugin::$instance->breakpoints->get_breakpoints_config()
		)->on_prop_transform( function( $key, $value ) {
			if ( 'font-family' !== $key ) {
				return;
			}

			Plugin::instance()->frontend->enqueue_font( $value );
		} )->render( $styles );

		return $css;
	}

	private function get_breakpoint_media( string $breakpoint_key ): ?string {
		$breakpoint_config = Plugin::$instance->breakpoints->get_breakpoints_config()[ $breakpoint_key ] ?? null;

		return $breakpoint_config ? Styles_Renderer::get_media_query( $breakpoint_config ) : 'all';
	}

	private function render_css_by_breakpoints( $get_styles, $style_key, $breakpoint_key, $group_by_breakpoint_memo ) {
		$cache_key = $style_key . '-' . $breakpoint_key;
		$get_grouped_styles = $group_by_breakpoint_memo->memoize( $cache_key, fn() => $this->group_by_breakpoint( $get_styles() ) );
		$grouped_styles = $get_grouped_styles();

		return $this->render_css( $grouped_styles[ $breakpoint_key ] ?? [] );
	}

	private function group_by_breakpoint( $styles ) {
		return Collection::make( $styles )->reduce( function( $group, $style ) {
			Collection::make( $style['variants'] )->each( function( $variant ) use ( &$group, $style ) {
				$breakpoint = $variant['meta']['breakpoint'] ?? self::DEFAULT_BREAKPOINT;

				if ( ! isset( $group[ $breakpoint ][ $style['id'] ] ) ) {
					$group[ $breakpoint ][ $style['id'] ] = [
						'id' => $style['id'],
						'type' => $style['type'],
						'variants' => [],
					];
				}

				$group[ $breakpoint ][ $style['id'] ]['variants'][] = $variant;
			} );

			return $group;
		}, [] );
	}

	private function get_breakpoints() {
		return Collection::make( Plugin::$instance->breakpoints->get_breakpoints() )
			->map( fn( Breakpoint $breakpoint ) => $breakpoint->get_name() )
			->reverse()
			->prepend( self::DEFAULT_BREAKPOINT )
			->all();
	}
}
