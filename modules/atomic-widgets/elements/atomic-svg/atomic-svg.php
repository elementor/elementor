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
	const DEFAULT_SVG = 'images/a-default-svg.svg';

	public static function get_element_type(): string {
		return 'a-svg';
	}

	public function get_title() {
		return esc_html__( 'SVG', 'elementor' );
	}

	public function get_keywords() {
		return [ 'atoms', 'atomic' ];
	}

	public function get_icon() {
		return 'eicon-svg';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()->default( [] ),
			'svg' => Image_Src_Prop_Type::make()->default_url( static::get_default_svg( 'url' ) ),
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

		return [
			self::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'width', $width )
						->add_prop( 'height', $height )
						->add_prop( 'overflow', 'unset' )
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

		$classes = array_filter( array_merge(
			[ $this->get_base_styles_dictionary()[ self::BASE_STYLE_KEY ] ],
			$settings['classes']
		) );

		$svg->add_class( implode( ' ', $classes ) );

		$svg_html = ( new Svg_Sanitizer() )->sanitize( $svg->get_updated_html() );

		if ( isset( $settings['link'] ) && ! empty( $settings['link']['href'] ) ) {
			$svg_html = sprintf( '<a href="%s" target="%s"> %s </a>', esc_url( $settings['link']['href'] ), esc_attr( $settings['link']['target'] ), $svg_html );
		}

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo $svg_html;
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
			static::get_default_svg( 'url' ) !== $settings['svg']['url']
		) {
			$content = wp_safe_remote_get(
				$settings['svg']['url']
			);

			if ( ! is_wp_error( $content ) ) {
				return $content['body'];
			}
		}

		$content = Utils::file_get_contents(
			static::get_default_svg( 'path' )
		);

		return $content ? $content : null;
	}

	/**
	 * @param string $context 'url' | 'path'
	 *
	 * @return string
	 */
	private static function get_default_svg( string $context ) {
		if ( 'path' === $context ) {
			return ELEMENTOR_ASSETS_PATH . self::DEFAULT_SVG;
		}

		if ( 'url' === $context ) {
			return ELEMENTOR_ASSETS_URL . self::DEFAULT_SVG;
		}

		return null;
	}
}
