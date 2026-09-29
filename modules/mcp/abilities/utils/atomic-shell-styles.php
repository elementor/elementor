<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Styles every atomic element gets from the `.e-con` class. The fixed declarations mirror
 * assets/dev/scss/frontend/_container.scss (kept in sync by a PHPUnit check); the inline padding
 * comes from the kit's Container Padding setting, per breakpoint, with the SCSS fallback.
 */
class Atomic_Shell_Styles {

	const SHELL_SELECTOR = '.e-con';
	const DESKTOP = 'desktop';
	const MIN_DIRECTION = 'min';
	const CUSTOM_UNIT = 'custom';
	const DEFAULT_UNIT = 'px';
	const KIT_PADDING_SETTING = 'container_padding';
	const DEFAULT_CONTAINER_PADDING = '10px';
	const ZERO_LENGTH_PATTERN = '/^0*\.?0+[a-z%]*$/i';

	const FIXED_DECLARATIONS = [
		'position' => 'relative',
		'width' => '100%',
		'min-width' => '0',
	];

	const DOCUMENT_ROOT_DECLARATIONS = [
		'margin-inline-start' => 'auto',
		'margin-inline-end' => 'auto',
		'max-width' => '100%',
	];

	const PADDING_SIDES = [
		'padding-inline-start' => 'left',
		'padding-inline-end' => 'right',
	];

	private static ?self $instance = null;

	private array $kit_padding_by_device;

	private array $breakpoints_config;

	/**
	 * @param array<string, array|null> $kit_padding_by_device Container Padding setting keyed by device (`desktop`, `tablet`, ...).
	 * @param array<string, array>      $breakpoints_config    Breakpoints config keyed by device.
	 */
	public function __construct( array $kit_padding_by_device, array $breakpoints_config ) {
		$this->kit_padding_by_device = $kit_padding_by_device;
		$this->breakpoints_config = $breakpoints_config;
	}

	public static function make(): self {
		if ( null === self::$instance ) {
			$breakpoints_config = Plugin::$instance->breakpoints->get_breakpoints_config();
			self::$instance = new self( self::read_kit_padding( array_keys( $breakpoints_config ) ), $breakpoints_config );
		}

		return self::$instance;
	}

	public static function set_instance( ?self $instance ): void {
		self::$instance = $instance;
	}

	public function to_map(): array {
		return array_merge( self::FIXED_DECLARATIONS, $this->without_zero_values( $this->get_desktop_padding() ) );
	}

	public function to_css_string( bool $is_document_root = false ): string {
		$desktop = $this->to_map();

		if ( $is_document_root ) {
			$desktop = array_merge( $desktop, self::DOCUMENT_ROOT_DECLARATIONS );
		}

		$blocks = [ $this->format_rule( $desktop ) ];

		foreach ( $this->get_breakpoint_padding_overrides() as $media_query => $padding ) {
			$blocks[] = $media_query . '{' . $this->format_rule( $padding ) . '}';
		}

		return implode( "\n", $blocks );
	}

	private function get_desktop_padding(): array {
		$default = array_fill_keys( array_keys( self::PADDING_SIDES ), self::DEFAULT_CONTAINER_PADDING );

		return array_merge( $default, $this->get_device_padding( self::DESKTOP ) );
	}

	/**
	 * Desktop-first (`max`) breakpoints inherit from the next larger one, `min` breakpoints from desktop.
	 *
	 * @return array<string, array<string, string>> Media query => changed padding declarations.
	 */
	private function get_breakpoint_padding_overrides(): array {
		$overrides = [];

		foreach ( $this->get_breakpoints_in_cascade_order() as $cascade ) {
			$inherited = $this->get_desktop_padding();

			foreach ( $cascade as $device => $breakpoint ) {
				$own = array_merge( $inherited, $this->get_device_padding( $device ) );
				$changed = array_diff_assoc( $own, $inherited );
				$media_query = Styles_Renderer::get_media_query( $breakpoint );

				if ( ! empty( $changed ) && null !== $media_query ) {
					$overrides[ $media_query ] = $changed;
				}

				$inherited = $own;
			}
		}

		return $overrides;
	}

	private function get_breakpoints_in_cascade_order(): array {
		$enabled = array_filter( $this->breakpoints_config, fn( $breakpoint ) => $breakpoint['is_enabled'] ?? true );
		$max_breakpoints = array_filter( $enabled, fn( $breakpoint ) => self::MIN_DIRECTION !== $breakpoint['direction'] );
		$min_breakpoints = array_diff_key( $enabled, $max_breakpoints );

		uasort( $max_breakpoints, fn( $a, $b ) => $b['value'] <=> $a['value'] );
		uasort( $min_breakpoints, fn( $a, $b ) => $a['value'] <=> $b['value'] );

		return [ $max_breakpoints, $min_breakpoints ];
	}

	/**
	 * @return array<string, string> Only the sides the device sets.
	 */
	private function get_device_padding( string $device ): array {
		$setting = $this->kit_padding_by_device[ $device ] ?? null;

		if ( ! is_array( $setting ) ) {
			return [];
		}

		$unit = $setting['unit'] ?? self::DEFAULT_UNIT;
		$padding = [];

		foreach ( self::PADDING_SIDES as $property => $side ) {
			$value = (string) ( $setting[ $side ] ?? '' );

			if ( '' !== $value ) {
				$padding[ $property ] = self::CUSTOM_UNIT === $unit ? $value : $value . $unit;
			}
		}

		return $padding;
	}

	private function without_zero_values( array $declarations ): array {
		return array_filter( $declarations, fn( $value ) => ! preg_match( self::ZERO_LENGTH_PATTERN, $value ) );
	}

	private function format_rule( array $declarations ): string {
		$formatted = array_map( fn( $property, $value ) => $property . ':' . $value . ';', array_keys( $declarations ), $declarations );

		return self::SHELL_SELECTOR . '{' . implode( '', $formatted ) . '}';
	}

	private static function read_kit_padding( array $breakpoint_devices ): array {
		$kit = Plugin::$instance->kits_manager->get_active_kit_for_frontend();

		if ( ! $kit ) {
			return [];
		}

		$padding = [ self::DESKTOP => $kit->get_settings_for_display( self::KIT_PADDING_SETTING ) ];

		foreach ( $breakpoint_devices as $device ) {
			$padding[ $device ] = $kit->get_settings_for_display( self::KIT_PADDING_SETTING . '_' . $device );
		}

		return $padding;
	}
}
