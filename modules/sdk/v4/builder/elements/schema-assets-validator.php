<?php

namespace Elementor\Modules\Sdk\V4\Builder\Elements;

trait Schema_Assets_Validator {

	protected function verify_file_exists( $file ) {
		if ( ! file_exists( $file ) || ! is_file( $file ) ) {
			throw new \InvalidArgumentException( esc_html( "File {$file} does not exist or not a file" ) );
		}
	}

	protected function verify_dir_exists( $dir ) {
		if ( ! file_exists( $dir ) || ! is_dir( $dir ) ) {
			throw new \InvalidArgumentException( esc_html( "Directory {$dir} does not exist or not a directory" ) );
		}
	}

	protected function validate_script( array $schema ) {
		$path = $schema['_path'];
		$script = $schema['script'];
		$file_to_validate = $path . '/' . $script;
		$this->verify_file_exists( $file_to_validate );
	}

	protected function validate_assets( array $schema ) {
		if ( $schema['_path'] ?? false ) {
			$assets_dir = $schema['_path'];
			$this->verify_dir_exists( $assets_dir );
		}
		if ( $schema['template'] ?? false ) {
			$this->validate_template_asset( $schema );
		}
		if ( $schema['css'] ?? false ) {
			$this->validate_css_assets( $schema );
		}
		if ( $schema['script'] ?? false ) {
			$this->validate_script( $schema );
		}
	}

	private function validate_template_asset( $schema ) {
		$template_file = $schema['template'];
		$file_to_validate = $schema['_path'] . '/' . $template_file;
		$this->verify_file_exists( $file_to_validate );
	}

	private function validate_css_assets( $schema ) {
		$css_files = $schema['css'] ?? [];
		if ( is_string( $schema['css'] ) ) {
			$css_files = [ $schema['css'] ];
		}

		$assets_dir = $schema['_path'];
		foreach ( $css_files as $css_file ) {
			$file_to_validate = $assets_dir . '/' . $css_file;
			$this->verify_file_exists( $file_to_validate );
		}
	}
}
