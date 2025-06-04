<?php

namespace Elementor\Modules\AtomicWidgets;

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

	public function register( string $provider_key, array $style_defs ) {
		$this->registered_styles_by_provider[ $provider_key ] = $style_defs;
	}

	private function enqueue_styles() {
		do_action('elementor/atomic-widget/styles/enqueue', $this);

        $breakpoints = $this->get_breakpoints();
        foreach ( $breakpoints as $breakpoint_key ) {
            foreach ($this->registered_styles_by_provider as $provider_key => $styles ) {
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

                if ( empty( $css ) ) {
                    continue;
                }

                $breakpoint_instance = Plugin::$instance->breakpoints->get_breakpoints( $breakpoint_key );

                $media = $breakpoint_instance
                    ? 'screen and (max-width: ' . $breakpoint_instance->get_value() . 'px)'
                    : 'all';

                $style_file = new Style( $provider_key . '-' . $breakpoint_key );

                $style_file->append( $css );

                $this->write_to_file($style_file);

                wp_enqueue_style(
                    $style_file->get_handle(),
                    $style_file->get_src(),
                    [],
                    ELEMENTOR_VERSION,
                    $media
                );
            }

        }
	}

	private function write_to_file( Style $style ) {
		file_put_contents(
			$style->get_path(),
			$style->get_content(),
		);
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
