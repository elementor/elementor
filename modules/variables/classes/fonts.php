<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Plugin;
use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Fonts {
	private Variables_Service $service;

	public function __construct( Variables_Service $service ) {
		$this->service = $service;
	}

	public function append_to( Post_CSS $post_css ) {
		if ( ! Plugin::$instance->kits_manager->is_kit( $post_css->get_post_id() ) ) {
			return;
		}

		$list_of_variables = $this->service->get_variables_list();

		foreach ( $list_of_variables as $variable ) {
			if ( Font_Variable_Prop_Type::get_key() !== $variable['type'] ) {
				continue;
			}

			$font_family = sanitize_text_field( $variable['value'] ?? '' );

			if ( empty( $font_family ) ) {
				continue;
			}

			$post_css->add_font( $font_family );
		}

		return $this;
	}
}
