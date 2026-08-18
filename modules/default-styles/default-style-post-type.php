<?php

namespace Elementor\Modules\DefaultStyles;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Default_Style_Post_Type {
	const CPT = 'e_default_style';

	public function register() {
		add_action( 'init', [ $this, 'register_post_type' ] );
	}

	public function register_post_type() {
		register_post_type( self::CPT, [
			'label' => esc_html__( 'Default Style', 'elementor' ),
			'labels' => [
				'name' => esc_html__( 'Default Styles', 'elementor' ),
				'singular_name' => esc_html__( 'Default Style', 'elementor' ),
			],
			'public' => false,
			'show_ui' => false,
			'supports' => [ 'title' ],
		] );
	}

	public static function ensure_registered(): void {
		if ( ! post_type_exists( self::CPT ) ) {
			( new self() )->register_post_type();
		}
	}
}
