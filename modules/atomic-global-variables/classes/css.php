<?php

namespace Elementor\Modules\AtomicGlobalVariables\Classes;

use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Core\Files\CSS\Post;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CSS {
	private $global_variables = [
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

	private Wordpress_Adapter_Interface $wp_adapter;

	public function __construct( Wordpress_Adapter_Interface $wp_adapter ) {
		$this->wp_adapter = $wp_adapter;
	}

	private function global_variables(): array {
		return $this->wp_adapter->apply_filters( 'elementor/atomic-global-variables/css/variables', $this->global_variables );
	}

	public function append_to( Post $post ) {
		$post->get_stylesheet()->add_raw_css(
			$this->raw_css()
		);
	}

	private function raw_css(): string {
		$css_string = ':root { ';

		foreach ( $this->global_variables() as $idx => $variable ) {
			$css_string .= '--' . $idx . ':' . $variable['value'] . '; ';
		}

		$css_string .= '}';

		return $css_string;
	}
}
