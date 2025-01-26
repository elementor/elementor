<?php
namespace Elementor\Modules\AtomicWidgets\Widgets;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Core\Utils\Svg\Svg_Sanitizer;
use Elementor\Modules\AtomicWidgets\Controls\Types\Svg_Control;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Svg extends Atomic_Widget_Base {
	public function get_name() {
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

		$svg = $settings['svg'];

		$svg = new \WP_HTML_Tag_Processor( $svg );
		if ( ! $svg->next_tag() ) {
			return;
		}

		$this->set_svg_attributes( $svg, $settings );

		$svg->add_class( $settings['classes'] ?? '' );

		$valid_svg = ( new Svg_Sanitizer() )->sanitize( $svg->get_updated_html() );

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
                Svg_Control::bind_to( 'svg' )
                    ->set_label( esc_html__( 'SVG', 'elementor' ) ),
            ] );

        return [
            $content_section,
        ];
    }

	protected static function define_props_schema(): array {
		$default_svg = '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<pattern id="checkered" patternUnits="userSpaceOnUse" width="20" height="20">
					<rect width="10" height="10" fill="#ccc"/>
					<rect x="10" y="10" width="10" height="10" fill="#ccc"/>
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill="url(#checkered)"/>
		</svg>';

	return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
			'width' => String_Prop_Type::make()
				->default( '100%' ),
			'height' => String_Prop_Type::make()
				->default( '100%' ),
			'svg' => Image_Prop_Type::make()
				->default_url( 'data:image/svg+xml;charset=utf-8,' . rawurlencode($default_svg) )
				->default_size( 'full' ),
		];
	}
}
