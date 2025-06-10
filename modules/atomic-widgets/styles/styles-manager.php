<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Core\Breakpoints\Breakpoint;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Styles_Manager {
	private static ?self $instance = null;

	private array $registered_styles_by_provider = [];

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

	public function register( string $provider_key, callable $get_style_defs ) {
		$this->registered_styles_by_provider[ $provider_key ] = $get_style_defs;
	}

	private function enqueue_styles() {
		do_action('elementor/atomic-widget/styles/enqueue', $this);

        $breakpoints = $this->get_breakpoints();
        foreach ( $breakpoints as $breakpoint_key ) {
            foreach ($this->registered_styles_by_provider as $provider_key => $styles ) {
                $render_css = fn() => $this->render_css_by_breakpoint( $styles(), $breakpoint_key );

				CSS_Files_Manager::enqueue( $provider_key, $render_css );
            }
        }
	}

    private function render_css_by_breakpoint( array $styles, string $breakpoint_key ) {
        $styles_by_breakpoint = $this->group_by_breakpoint( $styles );

        $breakpoint_styles = $styles_by_breakpoint[ $breakpoint_key ] ?? [];

        $css = Styles_Renderer::make(
            Plugin::$instance->breakpoints->get_breakpoints_config()
        )->on_prop_transform( function( $key, $value ) {
            if ( 'font-family' !== $key ) {
                return;
            }

            Plugin::instance()->frontend->enqueue_font( $value );
        } )->render( $breakpoint_styles );

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
            ->map( fn( Breakpoint $breakpoint) => $breakpoint->get_name() )
            ->reverse()
            ->prepend( self::DEFAULT_BREAKPOINT )
            ->all();
    }
}
