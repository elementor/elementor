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
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Svg extends Atomic_Widget_Base {
	const WRAPPER_STYLE_KEY = 'wrapper';
	const BASE_STYLE_KEY = 'base';
	const DEFAULT_SVG = 'images/default-svg.svg';
	const DEFAULT_SVG_PATH = ELEMENTOR_ASSETS_PATH . self::DEFAULT_SVG;
	const DEFAULT_SVG_URL = ELEMENTOR_ASSETS_URL . self::DEFAULT_SVG;

	public static function get_element_type(): string {
		return 'e-svg';
	}

	public function get_title() {
		return esc_html__( 'SVG', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic' ];
	}

	public function get_icon() {
		return 'eicon-svg';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()->default( [] ),
			'svg' => Image_Src_Prop_Type::make()->default_url( static::DEFAULT_SVG_URL ),
			'link' => Link_Prop_Type::make(),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( esc_html__( 'Content', 'elementor' ) )
				->set_items( [
					Svg_Control::bind_to( 'svg' ),
					Link_Control::bind_to( 'link' ),
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

		$svg_width = Size_Prop_Type::generate( [
			'size' => 100,
			'unit' => '%',
		] );

		$svg_height = Size_Prop_Type::generate( [
			'size' => 100,
			'unit' => '%',
		] );

		return [
			self::WRAPPER_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'width', $width )
						->add_prop( 'height', $height )
						->add_prop( 'overflow', 'unset' )
				),
			self::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'width', $svg_width )
						->add_prop( 'height', $svg_height )
				),
		];
	}

	protected function render() {
		$settings = $this->get_atomic_settings();

		$svg = $this->get_svg_content( $settings );

		if ( ! $svg ) {
			return;
		}

		$svg = new \WP_HTML_Tag_Processor( $svg );

		if ( ! $svg->next_tag( 'svg' ) ) {
			return;
		}

		$svg->set_attribute( 'fill', 'currentColor' );
		$svg->add_class( $this->get_base_styles_dictionary()[ self::BASE_STYLE_KEY ] );

		$atom_html = ( new Svg_Sanitizer() )->sanitize( $svg->get_updated_html() );

		$wrapper_classes = array_filter( array_merge(
			$settings['classes'],
			[ $this->get_base_styles_dictionary()[ self::WRAPPER_STYLE_KEY ] ]
		) );

		$classes_string = implode( ' ', $wrapper_classes );

		if ( isset( $settings['link'] ) && ! empty( $settings['link']['href'] ) ) {
			$atom_html = sprintf(
				'<a href="%s" target="%s" class="%s">%s</a>',
				esc_url( $settings['link']['href'] ),
				esc_attr( $classes_string ),
				esc_attr( $settings['link']['target'] ),
				$atom_html
			);
		} else {
			$atom_html = sprintf( '<div class="%s">%s</div>', esc_attr( $classes_string ), $atom_html );
		}

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo $atom_html;
	}

	private function get_svg_content( $settings ) {
		if ( isset( $settings['svg']['id'] ) ) {
			$content = Utils::file_get_contents(
				get_attached_file( $settings['svg']['id'] )
			);

			if ( $content ) {
				return $content;
			}
		}

		if (
			isset( $settings['svg']['url'] ) &&
			static::DEFAULT_SVG_URL !== $settings['svg']['url']
		) {
			$content = wp_safe_remote_get(
				$settings['svg']['url']
			);

			if ( ! is_wp_error( $content ) ) {
				return $content['body'];
			}
		}

		$content = Utils::file_get_contents(
			static::DEFAULT_SVG_PATH
		);

		return $content ? $content : null;
	}
}
