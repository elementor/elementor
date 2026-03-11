<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Core\Files\Base as Base_File;
use Elementor\Plugin;
use Elementor\Stylesheet;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Stylesheet_Manager extends Base_File {
	const FILE_NAME = 'design-system-sync.css';
	const DEFAULT_FILES_DIR = 'design-system-sync/';
	const META_KEY = '_elementor_design_system_sync_css_meta';

	public function __construct() {
		parent::__construct( self::FILE_NAME );
	}

	public function generate(): array {
		$this->update();

		return [
			'url' => $this->get_url(),
			'version' => $this->get_meta( 'time' ),
		];
	}

	public function enqueue(): void {
		if ( ! file_exists( $this->get_path() ) ) {
			$this->generate();
		}

		if ( ! file_exists( $this->get_path() ) ) {
			return;
		}

		wp_enqueue_style(
			'elementor-design-system-sync',
			$this->get_url(),
			[],
			$this->get_meta( 'time' )
		);
	}

	protected function parse_content(): string {
		$stylesheet = new Stylesheet();

		$breakpoints = Plugin::$instance->breakpoints->get_active_breakpoints();

		foreach ( $breakpoints as $breakpoint_name => $breakpoint ) {
			$stylesheet->add_device( $breakpoint_name, $breakpoint->get_value() );
		}

		$color_entries = Variables_Provider::get_synced_color_css_entries();

		if ( ! empty( $color_entries ) ) {
			$stylesheet->add_raw_css( ':root { ' . implode( ' ', $color_entries ) . ' }' );
		}

		$typography_entries = Classes_Provider::get_synced_typography_css_entries();

		foreach ( $typography_entries as $device => $entries ) {
			$css = ':root { ' . implode( ' ', $entries ) . ' }';
			$device_key = ( Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP === $device ) ? '' : $device;

			$stylesheet->add_raw_css( $css, $device_key );
		}

		return (string) $stylesheet;
	}
}
