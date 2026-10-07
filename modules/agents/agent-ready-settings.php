<?php

namespace Elementor\Modules\Agents;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shared settings object for every Agent Ready module, stored in one option.
 *
 * The admin app writes it through the central `elementor/v1/settings/{key}`
 * REST route, which replaces the whole option value. The sanitize filter
 * therefore merges incoming module keys onto the stored value, so a save from
 * one module never wipes another module's data.
 */
class Agent_Ready_Settings {

	const OPTION = 'elementor_agent_ready_settings';

	const MODULE_LLMS_TXT = 'llms_txt';
	const MODULE_MARKDOWN_CONTENT = 'markdown_content';
	const MODULE_BOT_ACCESS_CONTROL = 'bot_access_control';

	/**
	 * Keys only PHP may change; values sent by the client are ignored.
	 */
	const SERVER_OWNED_KEYS = [
		self::MODULE_LLMS_TXT => [ 'is_manually_edited' ],
	];

	private Content_Generator $generator;

	/**
	 * Static because every instance hooks the same option filter; a trusted write
	 * from one instance must not be reverted by another instance's filter.
	 *
	 * @var bool
	 */
	private static bool $is_trusted_write = false;

	public function __construct( Content_Generator $generator ) {
		$this->generator = $generator;
	}

	public function register(): void {
		add_filter( 'sanitize_option_' . self::OPTION, [ $this, 'sanitize' ] );
	}

	public function ensure_option_exists(): void {
		$this->write_trusted( fn() => add_option( self::OPTION, $this->get_defaults(), '', false ) );
	}

	public function get_module_settings( string $module ): array {
		$defaults = $this->get_defaults();
		$stored   = $this->get_stored();

		return array_merge( $defaults[ $module ] ?? [], $stored[ $module ] ?? [] );
	}

	public function is_llms_enabled(): bool {
		return (bool) $this->get_module_settings( self::MODULE_LLMS_TXT )['enabled'];
	}

	public function is_llms_manually_edited(): bool {
		return (bool) $this->get_module_settings( self::MODULE_LLMS_TXT )['is_manually_edited'];
	}

	/**
	 * Until the admin saves a selection, every available post type is included,
	 * so post types registered later still show up by default.
	 *
	 * @return string[]
	 */
	public function get_llms_post_types(): array {
		return $this->get_included_post_types( self::MODULE_LLMS_TXT );
	}

	public function is_markdown_enabled(): bool {
		return (bool) $this->get_module_settings( self::MODULE_MARKDOWN_CONTENT )['enabled'];
	}

	/**
	 * Until the admin saves a selection, every available post type is included.
	 *
	 * @return string[]
	 */
	public function get_markdown_post_types(): array {
		return $this->get_included_post_types( self::MODULE_MARKDOWN_CONTENT );
	}

	/**
	 * @param mixed $value Incoming option value.
	 * @return array
	 */
	public function sanitize( $value ): array {
		if ( self::$is_trusted_write ) {
			return is_array( $value ) ? $value : [];
		}

		$stored   = $this->get_stored();
		$incoming = is_array( $value ) ? $value : [];

		foreach ( $this->get_module_sanitizers() as $module => $sanitizer ) {
			if ( ! isset( $incoming[ $module ] ) || ! is_array( $incoming[ $module ] ) ) {
				continue;
			}

			$stored_module = $stored[ $module ] ?? [];
			$clean         = $sanitizer( array_merge( $stored_module, $incoming[ $module ] ) );

			$stored[ $module ] = $this->restore_server_owned_keys( $module, $clean, $stored_module );
		}

		return $stored;
	}

	/**
	 * @param string $module Module key, one of the MODULE_* constants.
	 * @param string $key    Setting key inside the module.
	 * @param mixed  $value  Setting value.
	 */
	public function set_server_value( string $module, string $key, $value ): void {
		$settings = $this->get_stored();

		$settings[ $module ][ $key ] = $value;

		$this->write_trusted( fn() => update_option( self::OPTION, $settings ) );
	}

	private function get_defaults(): array {
		return [
			self::MODULE_LLMS_TXT => [
				'enabled'            => true,
				'is_manually_edited' => false,
			],
			self::MODULE_MARKDOWN_CONTENT => [
				'enabled' => true,
			],
			self::MODULE_BOT_ACCESS_CONTROL => [],
		];
	}

	private function get_stored(): array {
		$stored = get_option( self::OPTION, [] );

		return is_array( $stored ) ? $stored : [];
	}

	/**
	 * @return array<string, callable>
	 */
	private function get_module_sanitizers(): array {
		return [
			self::MODULE_LLMS_TXT            => fn( array $settings ) => $this->sanitize_content_module( $settings ),
			self::MODULE_MARKDOWN_CONTENT    => fn( array $settings ) => $this->sanitize_content_module( $settings ),
		];
	}

	private function sanitize_content_module( array $settings ): array {
		$clean = [
			'enabled' => rest_sanitize_boolean( $settings['enabled'] ?? true ),
		];

		if ( isset( $settings['post_types'] ) && is_array( $settings['post_types'] ) ) {
			$requested = array_map( 'strval', $settings['post_types'] );

			$clean['post_types'] = array_values(
				array_intersect( $this->get_available_post_type_names(), $requested )
			);
		}

		return $clean;
	}

	/**
	 * @return string[]
	 */
	private function get_included_post_types( string $module ): array {
		$settings = $this->get_module_settings( $module );

		if ( ! isset( $settings['post_types'] ) || ! is_array( $settings['post_types'] ) ) {
			return $this->get_available_post_type_names();
		}

		return $settings['post_types'];
	}

	private function restore_server_owned_keys( string $module, array $clean, array $stored_module ): array {
		foreach ( self::SERVER_OWNED_KEYS[ $module ] ?? [] as $key ) {
			unset( $clean[ $key ] );

			if ( array_key_exists( $key, $stored_module ) ) {
				$clean[ $key ] = $stored_module[ $key ];
			}
		}

		return $clean;
	}

	/**
	 * @return string[]
	 */
	private function get_available_post_type_names(): array {
		return array_keys( $this->generator->get_available_post_types() );
	}

	private function write_trusted( callable $write ): void {
		self::$is_trusted_write = true;

		try {
			$write();
		} finally {
			self::$is_trusted_write = false;
		}
	}
}
