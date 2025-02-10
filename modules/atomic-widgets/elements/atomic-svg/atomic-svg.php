<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Svg;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Core\Utils\Svg\Svg_Sanitizer;
use Elementor\Modules\AtomicWidgets\Controls\Types\Svg_Control;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Svg extends Atomic_Widget_Base {
	const SVG_ENCODING = 'data:image/svg+xml;charset=utf-8,';
	const SVG_START_INDEX = 26;

	public static function get_element_type(): string {
		return 'a-svg';
	}

	public function get_title() {
		return esc_html__( 'Atomic SVG', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-shape';
	}

	protected function render() {
		$settings = $this->get_atomic_settings();

		if ( ! isset( $settings['svg'] ) ) {
			return;
		}

		$svg_data = $settings['svg'];

		$svg_content = isset( $svg_data['url'] ) ? $svg_data['url'] : '';

		if ( strpos( $svg_content, self::SVG_ENCODING ) === 0 ) {
			$svg_content = urldecode( substr( $svg_content, self::SVG_START_INDEX ) );
		}

		$svg = new \WP_HTML_Tag_Processor( $svg_content );

		if ( ! $svg->next_tag() ) {
			return;
		}

		$this->set_svg_attributes( $svg, $settings );

		$svg->add_class( implode( ' ', $settings['classes'] ?? [] ) );

		$valid_svg = ( new Svg_Sanitizer() )->sanitize( $svg->get_updated_html() );

		// we need this line in order to render the svg, otherwise it will be rendered as a string
		echo ( false === $valid_svg ) ? '' : $valid_svg; //phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	private function set_svg_attributes( $svg, $settings ) {
		$svg->set_attribute( 'fill', $settings['color'] ?? 'currentColor' );
		$svg->set_attribute( 'width', $settings['width'] ?? '100%' );
		$svg->set_attribute( 'height', $settings['height'] ?? '100%' );
	}

	protected function define_atomic_controls(): array {
		$content_section = Section::make()
			->set_label( esc_html__( 'Content', 'elementor' ) )
			->set_items( [
				Svg_Control::bind_to( 'svg' ),
			] );

		return [
			$content_section,
		];
	}

	protected static function get_placeholder(): string {
		$default_svg = '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="checkered" patternUnits="userSpaceOnUse" width="6" height="6">
                    <rect width="6" height="6" fill="#505050"/>
                    <rect width="3" height="3" fill="#999999"/>
                    <rect x="3" y="3" width="3" height="3" fill="#999999"/>
                </pattern>
            </defs>

            <rect width="100%" height="100%" fill="url(#checkered)"/>

            <g transform="translate(100, 100) scale(0.8)" fill="#fff">
                <path d="M30.56 22.052c1.672 0 3.197.41 4.576 1.232a9.14 9.14 0 0 1 3.344 3.344c.821 1.408 1.232 2.948 1.232 4.62 0 1.672-.41 3.212-1.232 4.62a9.248 9.248 0 0 1-3.344 3.3c-1.379.821-2.904 1.232-4.576 1.232-1.672 0-3.212-.41-4.62-1.232a9.248 9.248 0 0 1-3.344-3.3c-.821-1.408-1.232-2.948-1.232-4.62 0-1.672.41-3.212 1.232-4.62a9.14 9.14 0 0 1 3.344-3.344c1.408-.821 2.948-1.232 4.62-1.232Zm-20.284.308 7.656 5.588c.264.176.44.41.528.704.117.293.117.587 0 .88L15.556 39.3a1.262 1.262 0 0 1-.528.704 1.4 1.4 0 0 1-.88.308h-9.46a1.4 1.4 0 0 1-.88-.308 1.602 1.602 0 0 1-.528-.704L.332 29.532a1.5 1.5 0 0 1 0-.88c.117-.293.293-.528.528-.704l7.7-5.588a1.4 1.4 0 0 1 .88-.308c.323 0 .601.103.836.308ZM30.56 23.9c-1.32 0-2.552.337-3.696 1.012a7.36 7.36 0 0 0-2.684 2.684 7.161 7.161 0 0 0-.968 3.652c0 1.32.323 2.537.968 3.652a7.466 7.466 0 0 0 2.684 2.64 7.151 7.151 0 0 0 3.696 1.012 6.92 6.92 0 0 0 3.652-1.012 7.124 7.124 0 0 0 2.64-2.64 6.922 6.922 0 0 0 1.012-3.652 6.92 6.92 0 0 0-1.012-3.652 7.032 7.032 0 0 0-2.64-2.684A6.922 6.922 0 0 0 30.56 23.9Zm-21.12.088-7.26 5.28 2.772 9.24h8.932l2.772-9.24-7.216-5.28ZM16.26 1.9a1.3 1.3 0 0 1 1.012.44c.293.264.44.587.44.968v13.64c0 .41-.147.763-.44 1.056-.264.264-.601.396-1.012.396H2.664c-.41 0-.763-.132-1.056-.396a1.524 1.524 0 0 1-.396-1.056V3.352c0-.41.132-.748.396-1.012.293-.293.63-.44 1.012-.44h13.64Zm15.532-.308v.044l7.656 14.608c.264.47.25.939-.044 1.408-.264.47-.66.719-1.188.748H22.86c-.557 0-.983-.22-1.276-.66-.264-.47-.279-.953-.044-1.452v-.044l7.656-14.608c.176-.323.425-.543.748-.66.352-.147.69-.161 1.012-.044a1.2 1.2 0 0 1 .792.616l.044.044ZM15.864 3.748H3.06v12.804h12.804V3.748Zm14.652-.66-7.084 13.464h14.124l-7.04-13.464Z" transform="translate(-20, -20)"/>
            </g>
        </svg>';
		return self::SVG_ENCODING . rawurlencode( $default_svg );
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
			'width' => String_Prop_Type::make()
				->default( '100%' ),
			'height' => String_Prop_Type::make()
				->default( '100%' ),
			'svg' => Image_Prop_Type::make()
				->default_url( self::get_placeholder() ),
		];
	}
}
