<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Core\Base\Document;
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

	/**
	 * @var array<string, array{styles: callable, cache_keys: array<string>}>
	 */
	private array $registered_styles_by_key = [];

	private Cache_State_Manager $cache_state_manager;

	private array $post_ids = [];

	const DEFAULT_BREAKPOINT = 'desktop';

	private function __construct() {
		$this->cache_state_manager = new Cache_State_Manager();
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
		add_action('elementor/documents/ajax_save/after_save', fn(Document $document, array $post_data) => $this->on_document_change($document, $post_data), 10, 2);
	}

	public function register( string $key, callable $get_style_defs, array $cache_keys ) {
		$this->registered_styles_by_key[ $key ] = [
			'styles' => $get_style_defs,
			'cache_keys' => $cache_keys,
		];
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
			foreach ( $styles_by_key as $style_key => $style_params ) {
				$render_css = function () use ( $style_params, &$styles_cache, $style_key, $breakpoint_key ) {

					$grouped_styles = $this->group_by_breakpoint( $style_params['styles']() );

					return $this->render_css( $grouped_styles[ $breakpoint_key ] ?? [] );
				};

				try {
					$style_file = (new CSS_Files_Manager() )->get(
						$style_key . '-' . $breakpoint_key,
						$this->get_breakpoint_media( $breakpoint_key ),
						$render_css,
						$this->cache_state_manager->get( $style_params[ 'cache_keys' ] ) );

					$this->cache_state_manager->validate( $style_params[ 'cache_keys' ] );

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

	private function get_breakpoint_media( string $breakpoint_key ): string {
		$breakpoint_config = Plugin::$instance->breakpoints->get_breakpoints_config()[ $breakpoint_key ] ?? null;

		return $breakpoint_config ? Styles_Renderer::get_media_query( $breakpoint_config ) : 'all';
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

	private function on_document_change( Document $document, array $post_data ) {
		$post_ids = apply_filters( 'elementor/atomic-widgets/styles/posts', [$document->get_main_post()] );

		if ( ! is_array( $post_ids ) || empty( $post_ids ) ) {
			return;
		}

		do_action( 'elementor/atomic-widgets/styles/post-change', $this, $post_ids, $post_data );
	}
}
