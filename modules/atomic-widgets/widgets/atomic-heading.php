<?php
namespace Elementor\Modules\AtomicWidgets\Widgets;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Schema\Atomic_Prop;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Heading extends Atomic_Widget_Base {
	public function get_icon() {
		return 'eicon-t-letter';
	}

	public function get_title() {
		return esc_html__( 'Atomic Heading', 'elementor' );
	}

	public function get_name() {
		return 'a-heading';
	}

	protected function render() {
		$settings = $this->get_atomic_settings();

		// TODO: Move the validation/sanitization to the props schema constraints.
		$escaped_tag = Utils::validate_html_tag( $settings['tag'] );
		$escaped_title = esc_html( $settings['title'] );

		$class = '';
		if ( ! empty( $settings['classes'] ) ) {
			$class = "class='" . esc_attr( $settings['classes'] ) . "'";
		}

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo "<$escaped_tag $class>$escaped_title</$escaped_tag>";
	}

	protected function define_atomic_controls(): array {
		$tag_control = Select_Control::bind_to( 'tag' )
			->set_label( esc_html__( 'Tag', 'elementor' ) )
			->set_options( [
				[
					'value' => 'h1',
					'label' => 'H1',
				],
				[
					'value' => 'h2',
					'label' => 'H2',
				],
				[
					'value' => 'h3',
					'label' => 'H3',
				],
				[
					'value' => 'h4',
					'label' => 'H4',
				],
				[
					'value' => 'h5',
					'label' => 'H5',
				],
				[
					'value' => 'h6',
					'label' => 'H6',
				],
			]);

		$title_control = Textarea_Control::bind_to( 'title' )
			->set_label( __( 'Title', 'elementor' ) )
			->set_placeholder( __( 'Type your title here', 'elementor' ) );

		$tag_and_title_section = Section::make()
			->set_label( __( 'Content', 'elementor' ) )
			->set_items( [
				$tag_control,
				$title_control,
			]);

		return [
			$tag_and_title_section,
		];
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Atomic_Prop::make(),

			'tag' => Atomic_Prop::make()
				->default( 'h2' ),

			'title' => Atomic_Prop::make()
				->default( __( 'Your Title Here', 'elementor' ) ),
		];
	}
}
