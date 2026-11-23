<?php

namespace Elementor\Modules\Mcp;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Site_Flag {

	const OPTION_NAME = 'elementor_m_exists';
	const BODY_CLASS = 'elementor-mcp';

	const TOOL_CAPABILITIES = [
		'elementor/build-composition' => 'compositions',
		'elementor/manage-elements' => 'elements',
		'elementor/manage-component' => 'components',
		'elementor/manage-classes' => 'classes',
		'elementor/manage-global-variable' => 'variables',
		'elementor/manage-default-styles' => 'default-styles',
		'elementor/reorder-classes' => 'class-order',
		'elementor/create-page' => 'pages',
		'elementor/publish-document' => 'publish',
		'elementor/update-page-settings' => 'page-settings',
	];

	public static function register(): void {
		add_filter( 'body_class', [ self::class, 'filter_body_class' ] );
		add_filter( 'elementor/generator_tag/capabilities', [ self::class, 'filter_generator_tag_capabilities' ] );
	}

	public static function capability_for_ability( string $ability_id ): ?string {
		return self::TOOL_CAPABILITIES[ $ability_id ] ?? null;
	}

	public static function mark( string $capability ): void {
		if ( '' === $capability ) {
			return;
		}

		$existing = get_option( self::OPTION_NAME, false );

		if ( false === $existing ) {
			add_option( self::OPTION_NAME, $capability, '', true );
			return;
		}

		$stored = is_string( $existing ) ? $existing : '';

		if ( '' === $stored ) {
			update_option( self::OPTION_NAME, $capability );
			return;
		}

		if ( false !== strpos( ',' . $stored . ',', ',' . $capability . ',' ) ) {
			return;
		}

		update_option( self::OPTION_NAME, $stored . ',' . $capability );
	}

	public static function get_value(): string {
		$value = get_option( self::OPTION_NAME, '' );

		return is_string( $value ) ? $value : '';
	}

	public static function filter_body_class( $classes ) {
		if ( ! is_array( $classes ) || '' === self::get_value() ) {
			return $classes;
		}

		if ( ! in_array( self::BODY_CLASS, $classes, true ) ) {
			$classes[] = self::BODY_CLASS;
		}

		return $classes;
	}

	public static function filter_generator_tag_capabilities( $capabilities ) {
		$value = self::get_value();

		return '' === $value ? $capabilities : $value;
	}
}
