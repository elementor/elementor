<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Svg;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Core\Utils\Svg\Svg_Sanitizer;
use Elementor\Modules\AtomicWidgets\Controls\Types\Svg_Control;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Src_Prop_Type;

use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Svg extends Atomic_Widget_Base {
	const SVG_PREFIX = 'data:image/svg+xml;charset=utf-8,';
	const BASE_STYLE_KEY = 'base';

	public static function get_element_type(): string {
		return 'a-svg';
	}

	public function get_title() {
		return esc_html__( 'Atomic SVG', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-shape';
	}

	public function get_default_svg_path() {
		return ELEMENTOR_ASSETS_URL . 'images/defaultsvg.svg';
	}

	protected function render() {
		$settings = $this->get_atomic_settings();
		$svg_url = $settings['svg']['url'] ?? null;

		if ( ! $svg_url && isset( $settings['svg']['id'] ) ) {
			$attachment = wp_get_attachment_image_src( (int) $settings['svg']['id'], 'full' );
			$svg_url = $attachment[0] ?? null;
		}

		if ( ! $svg_url ) {
			// Render default SVG if no URL is provided
			printf( '%s', file_get_contents( $this->get_default_svg_path() ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			return;
		}

		$svg = new \WP_HTML_Tag_Processor( file_get_contents($svg_url) );

		if ( $svg->next_tag( 'svg' ) ) {
			$this->set_svg_attributes( $svg, $settings );
		}

		while ( $svg->next_tag( [ 'path', 'rect', 'circle', 'g' ] ) ) {
			$svg->remove_attribute( 'fill' );
		}

		$valid_svg = ( new Svg_Sanitizer() )->sanitize( $svg->get_updated_html() );

		// Render the SVG content
		printf( '%s', $valid_svg ? $valid_svg : file_get_contents( $this->get_default_svg_path() ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	private function set_svg_attributes( \WP_HTML_Tag_Processor $svg, $settings ) {
		$svg->set_attribute( 'fill',  'currentColor' );
		$svg->add_class( $settings['classes'] ?? '' );
		$svg->add_class( static::get_base_style_class( self::BASE_STYLE_KEY ) ?? '' );
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( esc_html__( 'Content', 'elementor' ) )
				->set_items( [ Svg_Control::bind_to( 'svg' ) ] ),
		];
	}

	public static function define_base_styles(): array {
		$width = Size_Prop_Type::generate( [
			'size' => 100,
			'unit' => 'px',
		] );
		$height = Size_Prop_Type::generate( [
			'size' => 100,
			'unit' => 'px',
		] );

		return [
			self::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'width', $width )
						->add_prop( 'height', $height )
				),
		];
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()->default( [] ),
			'svg' => Image_Src_Prop_Type::make()->default( ['url' => ELEMENTOR_ASSETS_URL . 'images/defaultsvg.svg' ]),
		];
	}
}
