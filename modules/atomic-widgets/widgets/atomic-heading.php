<?php
namespace Elementor\Modules\AtomicWidgets\Widgets;

use Elementor\Modules\AtomicWidgets\AtomicControls\Atomic_Control;
use Elementor\Modules\AtomicWidgets\AtomicControls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\AtomicControls\Types\Text_Control;
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
		return [];
	}
}
