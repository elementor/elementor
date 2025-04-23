<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Core\Files\CSS\Post;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class CSS {
	private function global_variables(): array {
		return ( new Variables() )->get_all();
	}

	public function append_to( Post $post ) {
		if ( ! Plugin::$instance->kits_manager->is_kit( $post->get_post_id() ) ) {
			return;
		}

		$post->get_stylesheet()->add_raw_css(
			$this->raw_css( $post->get_post_id() )
		);
	}

	private function raw_css( $kit_id ): string {
		$css_string = ".elementor-kit-${kit_id} {";

		foreach ( $this->global_variables() as $idx => $variable ) {
			$css_string .= '--' . $idx . ':' . $variable['value'] . '; ';
		}

		$css_string .= '}';

		return $css_string;
	}
}
