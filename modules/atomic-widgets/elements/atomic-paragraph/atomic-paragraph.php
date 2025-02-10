<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;
use Elementor\Modules\AtomicWidgets\Link_Query;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Paragraph extends Atomic_Widget_Base {
	use Link_Query;

	const BASE_STYLE_KEY = 'base';

	public static function get_element_type(): string {
		return 'a-paragraph';
	}

	public function get_icon() {
		return 'eicon-text';
	}

	public function get_title() {
		return esc_html__( 'Atomic Paragraph', 'elementor' );
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Content', 'elementor' ) )
				->set_items( [
					Textarea_Control::bind_to( 'paragraph' )
						->set_label( __( 'Paragraph', 'elementor' ) )
						->set_placeholder( __( 'Type your paragraph here', 'elementor' ) ),

					Link_Control::bind_to( 'link' )
						->set_options( $this->get_post_query() )
						->set_allow_custom_values( true )
						->set_placeholder( __( 'Paste URL or type', 'elementor' ) ),
				] ),
		];
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),

			'tag' => String_Prop_Type::make()
				->default( 'p' ),

			'paragraph' => String_Prop_Type::make()
				->default( __( 'Type your paragraph here', 'elementor' ) ),

			'link' => Link_Prop_Type::make(),
		];
	}

	public static function define_base_styles(): array {
		$color_value = Color_Prop_Type::generate( 'black' );
		$font_family_value = String_Prop_Type::generate( 'Poppins' );
		$font_size_value = Size_Prop_Type::generate( [
			'size' => 1.2,
			'unit' => 'rem',
		] );
		$line_height_value = String_Prop_Type::generate( '1.5' );

		return [
			self::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'color', $color_value )
						->add_prop( 'font-family', $font_family_value )
						->add_prop( 'font-size', $font_size_value )
						->add_prop( 'line-height', $line_height_value )
				),
		];
	}

	protected function render(): void {
		$settings = $this->get_atomic_settings();

		$format = $this->get_template( ! empty( $settings['link']['href'] ) );
		$args = $this->get_template_args( $settings );

		printf( $format, ...$args ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	private function get_template( bool $is_link_enabled ): string {
		return $is_link_enabled ? '<%1$s %2$s><a %3$s>%4$s</a></%1$s>' : '<%1$s %2$s>%3$s</%1$s>';
	}

	private function get_template_args( array $settings ): array {
		$paragraph = esc_html( $settings['paragraph'] );
		$tag = Utils::validate_html_tag( $settings['tag'] );
		$attrs = array_filter([
			'class' => array_filter([
				...( $settings['classes'] ?? [] ),
				self::get_base_style_class( self::BASE_STYLE_KEY ) ?? '',
			]),
		]);

		if ( ! empty( $settings['link']['href'] ) ) {
			return [
				$tag,
				Utils::render_html_attributes( $attrs ),
				Utils::render_html_attributes( $settings['link'] ),
				$paragraph,
			];
		}

		return [
			$tag,
			Utils::render_html_attributes( $attrs ),
			$paragraph,
		];
	}
}
