<?php

namespace Elementor\Modules\GlobalClasses;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Class_Post_Type {
	const CPT = 'e_global_class';

	public function register() {
		add_action( 'init', [ $this, 'register_post_type' ] );
	}

	public function register_post_type() {
		register_post_type( self::CPT, [
			'label' => esc_html__( 'Global Class', 'elementor' ),
			'labels' => [
				'name' => esc_html__( 'Global Classes', 'elementor' ),
				'singular_name' => esc_html__( 'Global Class', 'elementor' ),
			],
			'public' => false,
			'supports' => [ 'title' ],
		] );
	}
}
