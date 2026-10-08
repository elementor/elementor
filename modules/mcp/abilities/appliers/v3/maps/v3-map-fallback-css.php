<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3_Node_Bridge;
use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Writes the fallback rules of a map-driven style result into the widget's `custom_css`,
 * which only renders with the Elementor Pro custom CSS module.
 */
class V3_Map_Fallback_Css {

	const WRITTEN_CODE = 'css_fallback_custom_css';

	const SKIPPED_CODE = 'css_dropped';

	private bool $has_pro;

	/**
	 * @var array<string, string>|null
	 */
	private ?array $media_queries;

	/**
	 * @param bool|null                  $has_pro       Whether Pro's custom CSS module is available; detected when null.
	 * @param array<string, string>|null $media_queries Breakpoint name => media query; the site breakpoints when null.
	 */
	public function __construct( ?bool $has_pro = null, ?array $media_queries = null ) {
		$this->has_pro = $has_pro ?? Utils::has_pro();
		$this->media_queries = $media_queries;
	}

	/**
	 * @param array        $node        Subtree node (by reference).
	 * @param array        $result      {@see \Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper::apply()} result.
	 * @param string       $widget_type
	 * @param string       $config_id
	 * @param Warnings_Bag $warnings
	 */
	public function apply( array &$node, array $result, string $widget_type, string $config_id, Warnings_Bag $warnings ): void {
		$rules = $result['fallback_rules'] ?? [];
		$notes = $result['fallback_notes'] ?? [];
		$verbatim_css = trim( $result['unmapped_css'] ?? '' );
		$map = V3_Widget_Map_Registry::instance()->get_map( $widget_type );

		if ( ( empty( $rules ) && '' === $verbatim_css ) || null === $map ) {
			return;
		}

		if ( ! $this->has_pro ) {
			foreach ( $notes as $note ) {
				$warnings->add( self::SKIPPED_CODE, $note . ' ' . __( 'It was skipped because custom CSS requires Elementor Pro.', 'elementor' ), $config_id );
			}

			self::report_verbatim( $warnings, $config_id, self::SKIPPED_CODE, $verbatim_css );

			return;
		}

		$setting = V3_Node_Bridge::V3_CUSTOM_CSS_SETTING;
		$fallback = new V3_Custom_Css_Fallback(
			V3_Custom_Css_Fallback::selectors_of( $map ),
			$this->media_queries ?? V3_Custom_Css_Fallback::site_media_queries()
		);
		$custom_css = $fallback->merge( (string) ( $node['settings'][ $setting ] ?? '' ), $rules, $verbatim_css );

		unset( $node['settings'][ $setting ] );

		if ( '' !== $custom_css ) {
			$node['settings'][ $setting ] = $custom_css;
		}

		foreach ( $notes as $note ) {
			$warnings->add( self::WRITTEN_CODE, $note . ' ' . __( 'Written to the widget custom CSS instead.', 'elementor' ), $config_id );
		}

		self::report_verbatim( $warnings, $config_id, self::WRITTEN_CODE, $verbatim_css );
	}

	private static function report_verbatim( Warnings_Bag $warnings, string $config_id, string $code, string $verbatim_css ): void {
		if ( '' === $verbatim_css ) {
			return;
		}

		$message = self::WRITTEN_CODE === $code
			/* translators: %s: Media query blocks */
			? __( 'Media queries other than @media(--<breakpoint>) were written to the widget custom CSS as is: %s', 'elementor' )
			/* translators: %s: Media query blocks */
			: __( 'Media queries other than @media(--<breakpoint>) were skipped because custom CSS requires Elementor Pro: %s', 'elementor' );

		$warnings->add( $code, sprintf( $message, $verbatim_css ), $config_id );
	}
}
