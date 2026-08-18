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
		$path = static::get_core_path() . $name . '.md';

		if ( ! file_exists( $path ) ) {
			return '';
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$content = file_get_contents( $path );

		$extra_path = static::resolve_extra_path();

		if ( '' !== $content && null !== $extra_path && file_exists( $extra_path . $name . '.md' ) ) {
			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
			$content .= "\n\n" . file_get_contents( $extra_path . $name . '.md' );
		}

		return $content;
	}
}
