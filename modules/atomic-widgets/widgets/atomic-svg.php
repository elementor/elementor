<?php
namespace Elementor\Modules\AtomicWidgets\Widgets;

use Elementor\Modules\AtomicWidgets\Controls\Types\Image_Control;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Svg_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Core\Utils\Svg\Svg_Sanitizer;

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

		if ( $svg->next_tag() ) {
			$svg->set_attribute( 'fill', $settings['color'] ?? 'currentColor' );
			$svg->set_attribute( 'width', $settings['width'] ?? '100%' );
			$svg->set_attribute( 'height', $settings['height'] ?? '100%' );
			$svg->set_attribute( 'min-width', $settings['min-width'] ?? '100%' );
			$svg->set_attribute( 'min-height', $settings['min-height'] ?? '100%' );
			$svg->set_attribute( 'max-width', $settings['max-width'] ?? '100%' );
			$svg->set_attribute( 'max-height', $settings['max-height'] ?? '100%' );

			if ( isset( $computed_style['-webkit-text-stroke'] ) ) {
				$stroke_parts = explode( ' ', $computed_style['-webkit-text-stroke'] );
				if ( count( $stroke_parts ) === 2 ) {
					$svg->set_attribute( 'stroke-width', $stroke_parts[0] ?? '0px' );
					$svg->set_attribute( 'stroke', $stroke_parts[1] ?? 'currentColor' );
				}
			}

			$svg->add_class( $settings['classes'] ?? '' );
		}

		$valid_svg = ( new Svg_Sanitizer() )->sanitize( $svg->get_updated_html() );

		echo ( false === $valid_svg ) ? '' : $valid_svg; //phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	protected function define_atomic_controls(): array {
		$content_section = Section::make()
			->set_label( esc_html__( 'Content', 'elementor' ) )
			->set_items( [
				Image_Control::bind_to( 'svg2' ),
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
			'-webkit-text-stroke' => String_Prop_Type::make()
				->default( '0px #ffffff' ),
			'svg2' => Svg_Prop_Type::make()
				->default_icon( 'eicon-shape' )
			];
	}
}