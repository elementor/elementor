<?php
namespace Elementor\Modules\AtomicWidgets\Widgets;

use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Core\Utils\Svg\Svg_Sanitizer;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Color_Control;

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
			$svg->add_class( $settings['classes'] ?? '' );
		}

		$valid_svg = ( new Svg_Sanitizer() )->sanitize( $svg->get_updated_html() );

		echo ( false === $valid_svg ) ? '' : $valid_svg; //phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	protected function define_atomic_controls(): array {
		$content_section = Section::make()
			->set_label( esc_html__( 'Content', 'elementor' ) )
			->set_items( [
				Textarea_Control::bind_to( 'svg' )
					->set_placeholder( '<svg xmlns="http://www.w3.org/2000/svg"...' ),
				Color_Control::bind_to( 'color' )
					->set_label( esc_html__( 'SVG Color', 'elementor' ) )
					->set_default( 'currentColor' )
					->set_alpha( true ),
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
				->default( '<svg xmlns="http://www.w3.org/2000/svg" id="fcd95e07-8bd7-469f-808c-4bea57f73182" data-name="Layer 1" width="33.2114" height="12.6055" viewBox="0 0 33.2114 12.6055"><rect x="0.106" width="33" height="2"></rect><rect x="0.4016" y="9.2498" width="33.1968" height="2.0001" transform="translate(-1.4366 1.4718) rotate(-6.4411)"></rect></svg>' ),
            'color' => String_Prop_Type::make()
            ];
	}
}
