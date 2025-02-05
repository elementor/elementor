<?php

namespace Elementor\Modules\AtomicGlobalVariables\Classes;

use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Modules\AtomicGlobalVariables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\AtomicGlobalVariables\Transformers\Global_Variable as Global_Variable_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers_Registry;
use Elementor\Plugin;
use Elementor\Core\Files\CSS\Post as Post_CSS;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Hooks {
	const PRIORITY_HIGH = 1;
	const PRIORITY_MID = 5;
	const PRIORITY_DEFAULT = 10;

	private Wordpress_Adapter_Interface $wp_adapter;

	public function __construct( Wordpress_Adapter_Interface $wp_adapter ) {
		$this->wp_adapter = $wp_adapter;
	}

	public function register() {
		$this->wp_adapter->add_action( 'elementor/atomic-widgets/styles/transformers/register', function ( $transformers ) {
			$this->register_style_transformers( $transformers );
		} );

		$this->wp_adapter->add_filter( 'elementor/atomic-widgets/styles/schema', function ( $schema ) {
			return $this->augment_style_schema( $schema );
		} );

		$this->wp_adapter->add_action( 'elementor/css-file/post/parse', function ( Post_CSS $post ) {
			$this->inject_global_variables_css( $post );
		} );

		return $this;
	}

	private function register_style_transformers( Transformers_Registry $transformers ) {
		$transformers->register( Color_Variable_Prop_Type::get_key(), new Global_Variable_Transformer() );
	}

	private function augment_style_schema( array $schema ): array {
		return ( new Style_Schema() )->augment( $schema );
	}

	private function inject_global_variables_css( Post_CSS $post ): void {
//		if ( ! Plugin::$instance->kits_manager->is_kit( $post->get_post_id() ) ) {
//			return;
//		}

		$global_variables = [
			'e-atomic-variable-gc-a01' => [
				'value' => '#fff',
				'name' => 'white',
			],
			'e-atomic-variable-gc-a02' => [
				'value' => '#000',
				'name' => 'black',
			],
			'e-atomic-variable-gc-a03' => [
				'value' => '#f00',
				'name' => 'red',
			],
		];

		$raw_css = ':root {' . PHP_EOL;

		foreach ( $global_variables as $idx => $variable ) {
			$value = $variable['value'];
			$raw_css = $raw_css . "--${idx}: ${value};" . PHP_EOL;
		}

		$raw_css .= '}' . PHP_EOL;

		$post->get_stylesheet()->add_raw_css( $raw_css );
	}
}
