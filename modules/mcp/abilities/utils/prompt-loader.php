<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Prompt_Loader {

	protected static function get_core_path(): string {
		return __DIR__ . '/../../static-resources/abilities/';
	}

	protected static function resolve_extra_path(): ?string {
		if ( ! defined( 'ELEMENTOR_PRO_PATH' ) ) {
			return null;
		}

		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedConstantFound
		return rtrim( constant( 'ELEMENTOR_PRO_PATH' ), '/' ) . '/modules/mcp/static-resources-extra/abilities/';
	}

	public static function load( string $name ): string {
		$core_file  = static::get_core_path() . $name . '.md';
		$extra_path = static::resolve_extra_path();
		$extra_file = null !== $extra_path ? $extra_path . $name . '.md' : null;

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$content = file_exists( $core_file ) ? rtrim( (string) file_get_contents( $core_file ) ) : '';
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$extra = ( null !== $extra_file && file_exists( $extra_file ) ) ? rtrim( (string) file_get_contents( $extra_file ) ) : '';

		return implode( "\n\n", array_filter( [ $content, $extra ] ) );
	}
}
