<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Core\Files\Base as Base_File;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Stylesheet_Manager {
	const FILE_NAME = 'design-system-sync.css';
	const FILES_DIR = 'design-system-sync/';

	public function generate(): array {
		$css = $this->build_css();
		$path = $this->get_path();

		$this->ensure_dir();

		$written = file_put_contents( $path, $css );

		if ( false === $written ) {
			throw new \RuntimeException( 'Failed to write sync stylesheet to ' . esc_html( $path ) );
		}

		return [
			'url' => $this->get_url(),
			'version' => (string) filemtime( $path ),
		];
	}

	public function get_path(): string {
		return $this->get_base_dir() . self::FILE_NAME;
	}

	public function get_url(): string {
		$wp_upload_dir = wp_upload_dir( null, false );

		return $wp_upload_dir['baseurl'] . '/' . Base_File::UPLOADS_DIR . self::FILES_DIR . self::FILE_NAME;
	}

	public function enqueue(): void {
		$path = $this->get_path();

		if ( ! file_exists( $path ) ) {
			$this->generate();
		}

		if ( ! file_exists( $path ) ) {
			return;
		}

		wp_enqueue_style(
			'elementor-design-system-sync',
			$this->get_url(),
			[],
			(string) filemtime( $path )
		);
	}

	private function build_css(): string {
		$grouped_entries = [];
		$desktop_key = Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP;

		$color_entries = Variables_Provider::get_synced_color_css_entries();

		if ( ! empty( $color_entries ) ) {
			$grouped_entries[ $desktop_key ] = $color_entries;
		}

		$typography_entries = Classes_Provider::get_synced_typography_css_entries();

		foreach ( $typography_entries as $device => $entries ) {
			$grouped_entries[ $device ] = array_merge( $grouped_entries[ $device ] ?? [], $entries );
		}

		if ( empty( $grouped_entries ) ) {
			return '';
		}

		return $this->render_grouped_css( $grouped_entries );
	}

	private function render_grouped_css( array $grouped_entries ): string {
		$css = '';
		$desktop_key = Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP;

		if ( ! empty( $grouped_entries[ $desktop_key ] ) ) {
			$css .= ':root { ' . implode( ' ', $grouped_entries[ $desktop_key ] ) . ' }';
		}

		$breakpoints = Plugin::$instance->breakpoints->get_active_breakpoints();

		foreach ( $grouped_entries as $device => $entries ) {
			if ( $desktop_key === $device || empty( $entries ) ) {
				continue;
			}

			if ( ! isset( $breakpoints[ $device ] ) ) {
				continue;
			}

			$max_width = $breakpoints[ $device ]->get_value();
			$css .= " @media(max-width:{$max_width}px){ :root { " . implode( ' ', $entries ) . ' } }';
		}

		return $css;
	}

	private function get_base_dir(): string {
		$wp_upload_dir = wp_upload_dir( null, false );

		return $wp_upload_dir['basedir'] . '/' . Base_File::UPLOADS_DIR . self::FILES_DIR;
	}

	private function ensure_dir(): void {
		$dir = $this->get_base_dir();

		if ( ! is_dir( $dir ) ) {
			wp_mkdir_p( $dir );
		}
	}
}
