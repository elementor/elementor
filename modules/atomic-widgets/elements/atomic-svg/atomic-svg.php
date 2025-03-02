<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Svg;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Core\Utils\Svg\Svg_Sanitizer;
use Elementor\Modules\AtomicWidgets\Controls\Types\Svg_Control;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Src_Prop_Type;

use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Svg extends Atomic_Widget_Base {
	const BASE_STYLE_KEY = 'base';
	const DEFAULT_SIZE = 'full';
	const DEFAULT_SVG_PATH = ELEMENTOR_ASSETS_URL . 'images/a-default-svg.svg';

	public static function get_element_type(): string {
		return 'a-svg';
	}

	public function get_title() {
		return esc_html__( 'Atomic SVG', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-svg';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()->default( [] ),
			'svg' => Image_Src_Prop_Type::make()->default_url( self::DEFAULT_SVG_PATH ),
			'link' => Link_Prop_Type::make(),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( esc_html__( 'Content', 'elementor' ) )
				->set_items( [
					Svg_Control::bind_to( 'svg' ),
					Link_Control::bind_to( 'link' )
							->set_placeholder( __( 'Paste URL or type', 'elementor' ) ),
				] ),
		];
	}

	protected function define_base_styles(): array {
		$width = Size_Prop_Type::generate( [
			'size' => 65,
			'unit' => 'px',
		] );
		$height = Size_Prop_Type::generate( [
			'size' => 65,
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

	protected function render() {
		$settings = $this->get_atomic_settings();
		$svg_url = isset( $settings['svg']['url'] ) ? $settings['svg']['url'] : null;

		if ( ! $svg_url && isset( $settings['svg']['id'] ) ) {
			$attachment = wp_get_attachment_image_src( $settings['svg']['id'], self::DEFAULT_SIZE );
			$svg_url = isset( $attachment[0] ) ? $attachment[0] : null;
		}

		$svg = file_get_contents( $svg_url );
		$svg = $svg ? new \WP_HTML_Tag_Processor( $svg ) : null;

		if ( $svg && $svg->next_tag( 'svg' ) ) {
			$this->set_svg_attributes( $svg, $settings );
		}

		if ( $svg ) {
			$svg_html = ( new Svg_Sanitizer() )->sanitize( $svg->get_updated_html() );
		}

		$svg_html = $svg_html ?? file_get_contents( self::DEFAULT_SVG_PATH );

		if ( isset( $settings['link'] ) && ! empty( $settings['link']['href'] ) ) {
			$svg_html = sprintf( '<a href="%s" target="%s"> %s </a>', esc_url( $settings['link']['href'] ), esc_attr( $settings['link']['target'] ), $svg_html );
		}

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo $svg_html;
	}

	private function set_svg_attributes( \WP_HTML_Tag_Processor $svg, $settings ) {
		$svg->set_attribute( 'fill', 'currentColor' );
		$string_classes = implode( ' ', $settings['classes'] );
		$svg->add_class( $string_classes );
		$base_styles = $this->get_base_styles_dictionary()[ self::BASE_STYLE_KEY ];
		$svg->add_class( $base_styles );
	}
}
