<?php

namespace Elementor\Modules\AtomicWidgets;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Styles_Manager {
	private static ?self $instance = null;

	/** @var array<string, array<string, Style>> */
	private array $registered_styles_by_breakpoint = [];

	private $breakpoints = [
		'desktop',
		'tablet',
		'mobile',
	];

	public static function instance() {
		if ( ! self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public function register_hooks() {
		add_action( 'elementor/frontend/after_enqueue_post_styles', fn() => $this->enqueue_styles() );
	}

	public function register( string $breakpoint, string $handle, string $name, string $content, array $fonts = [] ) {
		$this->registered_styles_by_breakpoint[ $breakpoint ][ $handle ] ??= new Style(
			$handle,
			$name,
			$fonts
		);

		$this->registered_styles_by_breakpoint[ $breakpoint ][ $handle ]->append( $content );
	}

	private function enqueue_styles() {
		$post_ids = apply_filters( 'elementor/atomic-widgets/styles/posts-to-enqueue', [] );

		foreach ( $post_ids as $post_id ) {
			foreach ($this->breakpoints as $breakpoint) {
				do_action('elementor/atomic-widget/styles/enqueue', $breakpoint, $post_id, $this);

				if (!isset($this->registered_styles_by_breakpoint[$breakpoint])) {
					continue;
				}

				$styles = $this->registered_styles_by_breakpoint[$breakpoint];

				$breakpoint_instance = Plugin::$instance->breakpoints->get_breakpoints($breakpoint);

				$media = $breakpoint_instance
					? 'screen and (max-width: ' . $breakpoint_instance->get_value() . 'px)'
					: 'all';

				foreach ($styles as $style) {

					$this->write_to_file($style);

					wp_enqueue_style(
						$style->get_handle(),
						$style->get_src(),
						[],
						ELEMENTOR_VERSION,
						$media
					);

					$style->get_fonts()->each( fn($font) => Plugin::$instance->frontend->enqueue_font( $font ) );
				}
			}
		}
	}

	private function write_to_file( Style $style ) {
		file_put_contents(
			$style->get_path(),
			$style->get_content(),
		);
	}
}
