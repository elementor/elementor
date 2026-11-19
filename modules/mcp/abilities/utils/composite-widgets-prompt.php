<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\CompositeWidgets\Module as Composite_Widgets_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Appends a tool's composite widgets section (`<name>-composite-widgets.md`) only while the composite widgets
 * module is loaded, so agents on other sites aren't told about a tag they can't use.
 */
class Composite_Widgets_Prompt {

	const SECTION_SUFFIX = '-composite-widgets';

	public static function load( string $name ): string {
		return self::append( Prompt_Loader::load( $name ), $name );
	}

	public static function append( string $prompt, string $name ): string {
		if ( ! Composite_Widgets_Module::is_loaded() ) {
			return $prompt;
		}

		return implode( "\n\n", array_filter( [ $prompt, Prompt_Loader::load( $name . self::SECTION_SUFFIX ) ] ) );
	}
}
