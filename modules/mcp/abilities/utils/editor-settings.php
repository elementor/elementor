<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Owns the editor-only fields the MCP exposes in a dedicated `editor_settings` input, kept apart from
 * `settings` so they can never collide with a prop. Elementor stores them per element version:
 * atomic elements in `editor_settings`, legacy elements in `settings`.
 */
class Editor_Settings {

	const NAME = 'name';

	const DECORATIVE = 'decorative';

	const KEYS = [ self::NAME, self::DECORATIVE ];

	const ATOMIC_NAME_KEY = 'title';

	const LEGACY_NAME_SETTING = '_title';

	const ATOMIC_VERSION_KEY = 'version';

	const DECORATIVE_ELEMENT_TYPES = [ 'e-div-block', 'e-flexbox', 'e-grid' ];

	const NAME_DESCRIPTION = 'Editor only: the layer name shown in the Structure panel. Never rendered on the page and not a prop. Never use `settings.title` to rename a layer: `title` on e-heading is the visible heading text. Send an empty string or null to clear it.';

	const DECORATIVE_DESCRIPTION = 'Editor only: never rendered on the frontend. Set true on a visual-only container that will stay empty (a shape, glow, gradient or other HTML/CSS composition), so the editor does not force its empty-container placeholder min-height and min-width on it. Give it an explicit width and height in style. Leave false for containers that will get children.';

	const SECTION_DESCRIPTION = 'Editor-only fields, sent in the `editor_settings` input and never in `settings`.';

	public static function is_editor_key( $key ): bool {
		return in_array( $key, self::KEYS, true );
	}

	public static function get_schema( string $element_type ): array {
		$properties = [
			self::NAME => [
				'type' => 'string',
				'description' => self::NAME_DESCRIPTION,
			],
		];

		if ( self::supports_decorative( $element_type ) ) {
			$properties[ self::DECORATIVE ] = [
				'type' => 'boolean',
				'description' => self::DECORATIVE_DESCRIPTION,
			];
		}

		return [
			'type' => 'object',
			'description' => self::SECTION_DESCRIPTION,
			'properties' => $properties,
		];
	}

	/**
	 * @param array                 $node            Element node, updated by reference.
	 * @param array                 $editor_settings Plain editor-only values keyed by MCP key.
	 * @param string                $config_id       Id used to tag warnings.
	 * @param Warnings_Bag          $warnings        Collects skipped or adjusted values.
	 * @param array<string, string> $key_hints       Keys the caller refuses, mapped to the reason returned in the warning.
	 */
	public static function apply( array &$node, array $editor_settings, string $config_id, Warnings_Bag $warnings, array $key_hints = [] ): void {
		$element_type = self::get_node_type( $node );

		foreach ( $editor_settings as $key => $value ) {
			$key = (string) $key;

			if ( isset( $key_hints[ $key ] ) ) {
				self::warn_not_supported( $key, $element_type, $key_hints[ $key ], $config_id, $warnings );
				continue;
			}

			if ( self::NAME === $key ) {
				self::apply_name_value( $node, $value, $element_type, $config_id, $warnings );
				continue;
			}

			if ( self::DECORATIVE === $key && self::supports_decorative( $element_type ) ) {
				self::apply_decorative_value( $node, $value, $element_type, $config_id, $warnings );
				continue;
			}

			self::warn_unknown_key( $key, $element_type, $config_id, $warnings );
		}
	}

	public static function apply_name( array &$node, ?string $name ): void {
		$name = null === $name ? '' : $name;

		if ( self::is_legacy_node( $node ) ) {
			self::write_legacy_name( $node, $name );
			return;
		}

		self::write_atomic_name( $node, $name );
	}

	public static function read( array $node ): array {
		$editor_settings = [];
		$name = self::read_name( $node );
		$decorative = $node['editor_settings'][ self::DECORATIVE ] ?? null;

		if ( null !== $name ) {
			$editor_settings[ self::NAME ] = $name;
		}

		if ( is_bool( $decorative ) && self::supports_decorative( self::get_node_type( $node ) ) ) {
			$editor_settings[ self::DECORATIVE ] = $decorative;
		}

		return $editor_settings;
	}

	public static function warn_misplaced( string $key, string $config_id, Warnings_Bag $warnings ): void {
		$warnings->add(
			'editor_setting_in_settings',
			sprintf( '"%1$s" is an editor-only field, not a prop. It was skipped; send it as `editor_settings.%1$s` instead.', $key ),
			$config_id
		);
	}

	private static function apply_name_value( array &$node, $value, string $element_type, string $config_id, Warnings_Bag $warnings ): void {
		if ( null !== $value && ! is_string( $value ) ) {
			self::warn_invalid_type( self::NAME, 'a string', $element_type, $config_id, $warnings );
			return;
		}

		self::apply_name( $node, null === $value ? null : sanitize_text_field( $value ) );
	}

	private static function apply_decorative_value( array &$node, $value, string $element_type, string $config_id, Warnings_Bag $warnings ): void {
		if ( null === $value ) {
			unset( $node['editor_settings'][ self::DECORATIVE ] );
			return;
		}

		if ( ! is_bool( $value ) ) {
			self::warn_invalid_type( self::DECORATIVE, 'a boolean', $element_type, $config_id, $warnings );
			return;
		}

		$node['editor_settings'][ self::DECORATIVE ] = $value;
	}

	private static function write_atomic_name( array &$node, string $name ): void {
		if ( '' === $name ) {
			unset( $node['editor_settings'][ self::ATOMIC_NAME_KEY ] );
			return;
		}

		$node['editor_settings'][ self::ATOMIC_NAME_KEY ] = $name;
	}

	private static function write_legacy_name( array &$node, string $name ): void {
		if ( '' === $name ) {
			unset( $node['settings'][ self::LEGACY_NAME_SETTING ] );
			return;
		}

		$node['settings'][ self::LEGACY_NAME_SETTING ] = $name;
	}

	private static function read_name( array $node ): ?string {
		$name = self::is_legacy_node( $node )
			? ( $node['settings'][ self::LEGACY_NAME_SETTING ] ?? null )
			: ( $node['editor_settings'][ self::ATOMIC_NAME_KEY ] ?? null );

		return is_string( $name ) && '' !== $name ? $name : null;
	}

	private static function is_legacy_node( array $node ): bool {
		$element_type = self::get_node_type( $node );

		if ( '' === $element_type ) {
			return false;
		}

		$instance = Atomic_Elements_Utils::get_element_instance( $element_type );

		if ( null === $instance ) {
			return ! isset( $node[ self::ATOMIC_VERSION_KEY ] );
		}

		return ! Atomic_Elements_Utils::is_atomic_element( $instance );
	}

	private static function get_node_type( array $node ): string {
		$type = $node['widgetType'] ?? $node['elType'] ?? '';

		return is_string( $type ) ? $type : '';
	}

	private static function supports_decorative( string $element_type ): bool {
		return in_array( $element_type, self::DECORATIVE_ELEMENT_TYPES, true );
	}

	private static function warn_unknown_key( string $key, string $element_type, string $config_id, Warnings_Bag $warnings ): void {
		if ( in_array( $key, self::get_setting_keys( $element_type ), true ) ) {
			$warnings->add(
				'prop_in_editor_settings',
				sprintf( '"%s" on "%s" is a prop, not an editor-only field. It was skipped; send it in `settings`.', $key, $element_type ),
				$config_id
			);
			return;
		}

		self::warn_not_supported( $key, $element_type, self::get_unknown_key_hint( $key, $element_type ), $config_id, $warnings );
	}

	private static function get_unknown_key_hint( string $key, string $element_type ): string {
		$supported = self::supports_decorative( $element_type ) ? self::KEYS : [ self::NAME ];
		$hint = sprintf( 'Supported keys: %s.', implode( ', ', $supported ) );

		if ( self::ATOMIC_NAME_KEY === $key ) {
			return sprintf( 'Use "%s" to rename the layer. %s', self::NAME, $hint );
		}

		return $hint;
	}

	private static function warn_not_supported( string $key, string $element_type, string $hint, string $config_id, Warnings_Bag $warnings ): void {
		$warnings->add(
			'editor_setting_not_supported',
			sprintf( 'Editor setting "%s" is not supported on "%s" and was skipped. %s', $key, $element_type, $hint ),
			$config_id
		);
	}

	private static function warn_invalid_type( string $key, string $expected, string $element_type, string $config_id, Warnings_Bag $warnings ): void {
		$warnings->add(
			'prop_value_invalid',
			sprintf( 'Editor setting "%s" on "%s" must be %s and was skipped.', $key, $element_type, $expected ),
			$config_id
		);
	}

	private static function get_setting_keys( string $element_type ): array {
		$config = Widget_Context_Helper::get_widget_config( $element_type );

		if ( ! is_array( $config ) ) {
			return [];
		}

		$schema = $config['atomic_props_schema'] ?? $config['controls'] ?? [];

		return is_array( $schema ) ? array_map( 'strval', array_keys( $schema ) ) : [];
	}
}
