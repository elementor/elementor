<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Core\Files\Base as Base_File;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;

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
			throw new \RuntimeException( 'Failed to write sync stylesheet to ' . $path );
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
		$css_entries = [];

		$synced_variables = Variables_Provider::get_synced_color_variables();

		if ( ! empty( $synced_variables ) ) {
			$css_entries = array_merge( $css_entries, $this->get_variables_css_entries( $synced_variables ) );
		}

		$synced_classes = Classes_Provider::get_synced_classes();

		if ( ! empty( $synced_classes ) ) {
			$css_entries = array_merge( $css_entries, $this->get_classes_css_entries( $synced_classes ) );
		}

		if ( empty( $css_entries ) ) {
			return '';
		}

		return ':root { ' . implode( ' ', $css_entries ) . ' }';
	}

	private function get_v3_global_type( string $type ): string {
		$type_map = [
			'global-color-variable' => 'color',
			'global-font-variable' => 'typography',
		];

		return $type_map[ $type ] ?? 'color';
	}

	private function get_variables_css_entries( array $synced_variables ): array {
		$css_entries = [];

		foreach ( $synced_variables as $id => $variable ) {
			$label = sanitize_text_field( $variable['label'] ?? '' );

			if ( empty( $label ) ) {
				continue;
			}

			$v3_id = Variables_Provider::get_v4_variable_id( $label );
			$type = $variable['type'];
			$global_type = $this->get_v3_global_type( $type ?? '' );

			$css_entries[] = "--e-global-{$global_type}-{$v3_id}:var(--{$label});";
		}

		return $css_entries;
	}

	private function get_classes_css_entries( array $synced_classes ): array {
		$css_entries = [];

		$schema = Style_Schema::get();
		$props_resolver = Render_Props_Resolver::for_styles();

		foreach ( $synced_classes as $id => $class ) {
			$label = sanitize_text_field( $class['label'] ?? '' );

			if ( empty( $label ) ) {
				continue;
			}

			$variants = $class['variants'] ?? [];

			$props = Classes_Provider::get_default_breakpoint_props( $variants );

			if ( empty( $props ) ) {
				continue;
			}

			if ( ! Classes_Provider::has_typography_props( $props ) ) {
				continue;
			}

			$resolved_props = $props_resolver->resolve( $schema, $props );

			$this->add_typography_css_entries( $label, $resolved_props, $css_entries );
		}

		return $css_entries;
	}

	private function add_typography_css_entries( string $label, array $resolved_props, array &$css_entries ): void {
		foreach ( Classes_Provider::TYPOGRAPHY_PROPS as $prop_name ) {
			if ( ! isset( $resolved_props[ $prop_name ] ) || empty( $resolved_props[ $prop_name ] ) ) {
				continue;
			}

			$css_value = $resolved_props[ $prop_name ];
			$v3_id = 'v4-' . $label;

			$css_entries[] = "--e-global-typography-{$v3_id}-{$prop_name}:{$css_value};";
		}
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
