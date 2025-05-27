<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Plugin;
use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Fonts {
	public function append_to( Post_CSS $post_css ) {
		if ( ! Plugin::$instance->kits_manager->is_kit( $post_css->get_post_id() ) ) {
			return;
		}

		$variable_groups = ( new Variables() )->get_all();
		$font_variables = $variable_groups[ Font_Variable_Prop_Type::get_key() ] ?? [];

		foreach ( $font_variables as $variable ) {
			$font_family = sanitize_text_field( $variable['value'] ?? '' );

			if ( empty( $font_family ) ) {
				continue;
			}

			$post_css->add_font( $font_family );
		}

		return $this;
	}
}
