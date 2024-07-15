<?php
namespace Elementor\Modules\AtomicWidgets\Widgets;

use Elementor\Modules\AtomicWidgets\AtomicControls\Atomic_Control;
use Elementor\Modules\AtomicWidgets\AtomicControls\Atomic_Section;
use Elementor\Modules\AtomicWidgets\AtomicControls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\AtomicControls\Types\Textarea_Control;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
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
		$tag = $this->get_settings( 'tag' ) ?? 'h2';
		$title = $this->get_settings( 'title' ) ?? 'Hello, World!';

		$escaped_tag = Utils::validate_html_tag( $tag );
		$escaped_title = esc_html( $title );

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo "<$escaped_tag>$escaped_title</$escaped_tag>";
	}

	public function get_atomic_controls(): array {
		$tag_and_title_section = Atomic_Section::make()
			->set_label( __( 'Tag and Title', 'elementor' ) )
			->set_items( [
				Select_Control::bind_to( 'tag' )
					->set_label( 'Tag' )
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
					]),
				Textarea_Control::bind_to( 'title' )
					->set_label( 'Title' )
					->set_placeholder( 'Hello, World!' ),
			]);

		return [
			$tag_and_title_section,
		];
	}
}
