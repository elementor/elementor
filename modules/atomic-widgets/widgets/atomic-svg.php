<?php
namespace Elementor\Modules\AtomicWidgets\Widgets;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Core\Utils\Svg\Svg_Sanitizer;
use Elementor\Modules\AtomicWidgets\Controls\Types\Svg_Control;
use Elementor\Modules\AtomicWidgets\PropTypes\Svg_Prop_Type;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Svg extends Atomic_Widget_Base {
	public static function get_element_type() {
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

		$attrs = array_filter( array_merge(
			$settings['svg'],
			[ 'class' => $settings['classes'] ?? '' ]
		) );

		$attrs['src'] = esc_url( $attrs['src'] );

		Utils::print_wp_kses_extended(
			sprintf(
				'<img %1$s >',
				Utils::render_html_attributes( $attrs )
			),
			[ 'svg' ]
		);
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
				] );

		return [
			$content_section,
			];
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
			'svg' => String_Prop_Type::make()
				->default( '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M.361 256C.361 397 114 511 255 511C397 511 511 397 511 256C511 116 397 2.05 255 2.05C114 2.05 .361 116 .361 256zM192 150V363H149V150H192zM234 150H362V193H234V150zM362 235V278H234V235H362zM234 320H362V363H234V320z"/></svg>' ),
			'width' => String_Prop_Type::make()
				->default( '100%' ),
			'height' => String_Prop_Type::make()
				->default( '100%' ),
		];
	}
}
