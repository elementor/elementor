<?php
namespace Elementor\Modules\AtomicWidgets\Widgets;

use Elementor\Modules\AtomicWidgets\AtomicControls\Atomic_Control;
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
		return [
			Atomic_Control::bind_to( 'tag' )
				->set_label( __( 'Tag', 'elementor' ) )
				->set_type( Select_Control::KEY )
				->set_props(
					Select_Control::make()
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
						] )
						->get_props()
				),
			Atomic_Control::bind_to( 'title' )
				->set_label( __( 'Title', 'elementor' ) )
				->set_type( Textarea_Control::KEY )
				->set_props( Textarea_Control::make()
					->set_placeholder( __( 'Enter your title', 'elementor' ) )
					->get_props()
				),
		];
	}
}
