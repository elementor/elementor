<?php

namespace Elementor\Modules\AtomicWidgets\Widgets;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Paragraph extends Atomic_Widget_Base {
	public function get_name() {
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
		];
	}

	protected function render(): void {
		$settings = $this->get_atomic_settings();

		$paragraph = $settings['paragraph'];
		$tag = $settings['tag'];
		$attrs = array_filter( [
			'class' => $settings['classes'] ?? '',
		] );

		printf(
			'<%1$s %2$s>%3$s</%1$s>',
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			Utils::validate_html_tag( $tag ),
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			Utils::render_html_attributes( $attrs ),
			esc_html( $paragraph ),
		);
	}
}
