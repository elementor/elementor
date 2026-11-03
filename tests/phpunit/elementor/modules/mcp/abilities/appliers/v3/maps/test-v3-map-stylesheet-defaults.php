<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Style target defaults are copied by hand from the widget stylesheets, so each declared value
 * must still be in the widget's stylesheet sources: as the value itself, as a `var()` fallback,
 * or as the value of the custom property a `var()` reads.
 */
class Test_V3_Map_Stylesheet_Defaults extends Elementor_Test_Base {

	const CORE = 'core';

	const PRO = 'pro';

	const CORE_WIDGETS_SCSS = 'assets/dev/scss/frontend/widgets/';

	const PRO_WOOCOMMERCE_SCSS = 'modules/woocommerce/assets/scss/widgets/';

	const SOURCES = [
		'counter' => [ [ self::CORE, self::CORE_WIDGETS_SCSS . 'counter.scss' ] ],
		'progress' => [ [ self::CORE, self::CORE_WIDGETS_SCSS . 'progress.scss' ] ],
		'social-icons' => [
			[ self::CORE, self::CORE_WIDGETS_SCSS . 'social-icons.scss' ],
			[ self::CORE, 'assets/dev/scss/frontend/general/_icon.scss' ],
		],
		'image-carousel' => [ [ self::CORE, 'assets/dev/scss/frontend/conditionals/e-swiper.scss' ] ],
		'countdown' => [ [ self::PRO, 'modules/countdown/assets/scss/frontend.scss' ] ],
		'gallery' => [ [ self::PRO, 'modules/gallery/assets/scss/frontend.scss' ] ],
		'nav-menu' => [ [ self::PRO, 'modules/nav-menu/assets/scss/frontend.scss' ] ],
		'progress-tracker' => [ [ self::PRO, 'modules/progress-tracker/assets/scss/frontend.scss' ] ],
		'woocommerce-cart' => [ [ self::PRO, self::PRO_WOOCOMMERCE_SCSS . 'woocommerce-cart.scss' ] ],
		'woocommerce-checkout-page' => [ [ self::PRO, self::PRO_WOOCOMMERCE_SCSS . 'woocommerce-checkout-page.scss' ] ],
		'woocommerce-menu-cart' => [ [ self::PRO, self::PRO_WOOCOMMERCE_SCSS . 'woocommerce-menu-cart.scss' ] ],
		'woocommerce-my-account' => [ [ self::PRO, self::PRO_WOOCOMMERCE_SCSS . 'woocommerce-my-account.scss' ] ],
		'woocommerce-purchase-summary' => [ [ self::PRO, self::PRO_WOOCOMMERCE_SCSS . 'woocommerce-purchase-summary.scss' ] ],
	];

	const CORE_SCSS_VARIABLES = 'assets/dev/scss/helpers/variables.scss';

	const DECLARATION_PATTERN = '/(\$?[a-z0-9_-]+)\s*:\s*([^;{}]+);/i';

	const CUSTOM_PROPERTY_PATTERN = '/^var\((--[a-z0-9-]+)(?:,(.+))?\)$/';

	const SCSS_VARIABLE_PATTERN = '/^\$[a-z0-9_-]+$/';

	public function maps_with_defaults_provider(): array {
		$cases = [];

		foreach ( require V3_Widget_Map_Registry::REGISTERED_MAPS_FILE as $widget_type => $file ) {
			/** @var V3_Widget_Map $map */
			$map = require $file;

			foreach ( $map->get_all_targets() as $target ) {
				if ( ! empty( $target->get_defaults() ) ) {
					$cases[ $widget_type ] = [ $widget_type, $map ];
				}
			}
		}

		return $cases;
	}

	/**
	 * @dataProvider maps_with_defaults_provider
	 */
	public function test_defaults__match_the_widget_stylesheet_sources( string $widget_type, V3_Widget_Map $map ) {
		// Arrange.
		$this->assertArrayHasKey( $widget_type, self::SOURCES, "{$widget_type} declares stylesheet defaults but lists no stylesheet sources." );
		$declarations = $this->source_declarations( $widget_type );

		// Act.
		$drifted = [];

		foreach ( $map->get_all_targets() as $target ) {
			foreach ( $target->get_defaults() as $property => $value ) {
				if ( ! $this->is_declared( $property, $value, $declarations ) ) {
					$drifted[] = $this->entry( $target, $property, $value );
				}
			}
		}

		// Assert.
		$this->assertSame( [], $drifted );
	}

	/**
	 * @return array<int, array{0: string, 1: string}> Property and normalized value pairs.
	 */
	private function source_declarations( string $widget_type ): array {
		$declarations = [];
		$sources = array_merge( self::SOURCES[ $widget_type ], [ [ self::CORE, self::CORE_SCSS_VARIABLES ] ] );

		foreach ( $sources as [ $root, $path ] ) {
			$root_path = $this->root_path( $root );

			if ( null === $root_path ) {
				$this->markTestSkipped( "Elementor Pro is not installed; the {$widget_type} stylesheet is not available." );
			}

			$this->assertFileExists( $root_path . $path );
			preg_match_all( self::DECLARATION_PATTERN, file_get_contents( $root_path . $path ), $matches, PREG_SET_ORDER );

			foreach ( $matches as $match ) {
				$declarations[] = [ strtolower( $match[1] ), $this->normalize( $match[2] ) ];
			}
		}

		return $declarations;
	}

	private function root_path( string $root ): ?string {
		if ( self::CORE === $root ) {
			return ELEMENTOR_PATH;
		}

		return defined( 'ELEMENTOR_PRO_PATH' ) ? ELEMENTOR_PRO_PATH : null;
	}

	private function is_declared( string $property, string $value, array $declarations ): bool {
		$value = $this->normalize( $value );

		foreach ( $declarations as [ $source_property, $source_value ] ) {
			if ( ! $this->is_same_property( $property, $source_property ) ) {
				continue;
			}

			$resolved = $this->resolve_scss_variable( $source_value, $declarations );
			$custom_property = $this->resolve_scss_variable( (string) $this->custom_property_value( $resolved, $declarations ), $declarations );

			if ( $resolved === $value || $custom_property === $value ) {
				return true;
			}
		}

		return false;
	}

	private function resolve_scss_variable( string $value, array $declarations ): string {
		$seen = [];

		while ( preg_match( self::SCSS_VARIABLE_PATTERN, $value ) && ! isset( $seen[ $value ] ) ) {
			$seen[ $value ] = true;

			foreach ( $declarations as [ $name, $definition ] ) {
				if ( $name === $value ) {
					$value = $definition;
					break;
				}
			}
		}

		return $value;
	}

	private function is_same_property( string $property, string $source_property ): bool {
		return $property === $source_property
			|| 0 === strpos( $property, $source_property . '-' )
			|| substr( $source_property, -strlen( '-' . $property ) ) === '-' . $property;
	}

	private function custom_property_value( string $source_value, array $declarations ): ?string {
		if ( ! preg_match( self::CUSTOM_PROPERTY_PATTERN, $source_value, $matches ) ) {
			return null;
		}

		if ( isset( $matches[2] ) ) {
			return $matches[2];
		}

		foreach ( $declarations as [ $source_property, $definition ] ) {
			if ( $matches[1] === $source_property ) {
				return $definition;
			}
		}

		return null;
	}

	private function normalize( string $value ): string {
		$value = strtolower( preg_replace( '/\s+/', '', $value ) );
		$value = preg_replace( '/#([0-9a-f])([0-9a-f])([0-9a-f])(?![0-9a-f])/', '#$1$1$2$2$3$3', $value );

		return preg_replace( '/(?<![0-9])0\./', '.', $value );
	}

	private function entry( Style_Target $target, string $property, string $value ): string {
		return sprintf( '%s { %s: %s }', $target->get_alias(), $property, $value );
	}
}
