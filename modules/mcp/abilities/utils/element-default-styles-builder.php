<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer;
use Elementor\Modules\DefaultStyles\Default_Styles_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders the effective default-style CSS that the browser would apply to a V4 atomic
 * element before any inline/global class overrides.
 *
 * Each layer is rendered via Styles_Renderer (same pipeline as frontend enqueue), then
 * concatenated in cascade order: the `.e-con` shell of atomic elements first, widget
 * base_styles second, kit site-wide default for the element's rendered tag last.
 */
class Element_Default_Styles_Builder {

	public static function render(
		array $widget_base_style_defs,
		?string $tag,
		?Default_Styles_Repository $repository,
		?Styles_Renderer $renderer = null,
		string $shell_css = ''
	): string {
		$renderer = $renderer ?? Styles_Renderer::make( Plugin::$instance->breakpoints->get_breakpoints_config() );

		$base_css = ! empty( $widget_base_style_defs )
			? $renderer->render( array_values( $widget_base_style_defs ) )
			: '';

		$default_css = self::render_kit_default( $tag, $repository, $renderer );

		$layers = array_filter( [
			$shell_css,
			$base_css,
			$default_css,
		] );

		return trim( implode( "\n", $layers ) );
	}

	public static function render_kit_default(
		?string $tag,
		?Default_Styles_Repository $repository,
		?Styles_Renderer $renderer = null
	): string {
		if ( null === $tag || null === $repository ) {
			return '';
		}

		$item = $repository->get( $tag );

		if ( ! is_array( $item ) ) {
			return '';
		}

		$renderer = $renderer ?? Styles_Renderer::make( Plugin::$instance->breakpoints->get_breakpoints_config() );

		return $renderer->render( [ $item ] );
	}
}
