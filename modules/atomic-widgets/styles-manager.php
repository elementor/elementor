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

	public function register( string $breakpoint, string $handle, string $name, string $content ) {
		$this->registered_styles_by_breakpoint[ $breakpoint ][ $handle ] ??= new Style(
			$handle,
			$name,
		);

		$this->registered_styles_by_breakpoint[ $breakpoint ][ $handle ]->append( $content );
	}

	private function enqueue_styles() {
		foreach ( $this->breakpoints as $breakpoint ) {
			do_action( 'elementor/atomic-widget/styles/enqueue', $breakpoint, $this );

			if ( ! isset( $this->registered_styles_by_breakpoint[ $breakpoint ] ) ) {
				continue;
			}

			$styles = $this->registered_styles_by_breakpoint[ $breakpoint ];

			$breakpoint_instance = Plugin::$instance->breakpoints->get_breakpoints( $breakpoint );

			$media = $breakpoint_instance
				? 'screen and (max-width: ' . $breakpoint_instance->get_value() . 'px)'
				: 'all';

			foreach ( $styles as $style ) {
				$this->write_to_file( $style );

				// TODO: Add "media" attribute.
				wp_enqueue_style(
					$style->get_handle(),
					$style->get_src(),
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
}
