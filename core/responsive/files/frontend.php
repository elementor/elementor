<?php

namespace Elementor\Core\Responsive\Files;

use Elementor\Core\Files\Base;
use Elementor\Core\Responsive\Responsive;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Frontend extends Base {

	private $template_file;

	public function __construct( $file_name, $template_file = null ) {
		$this->template_file = $template_file;

		parent::__construct( $file_name );
	}

	public function get_meta_key() {
		return 'elementor-' . pathinfo( $this->get_file_name(), PATHINFO_FILENAME );
	}

	public function parse_content() {
		$breakpoints = Responsive::get_breakpoints();

		$breakpoints_keys = array_keys( $breakpoints );

		$file_content = file_get_contents( $this->template_file );

		$file_content = preg_replace_callback( '/ELEMENTOR_SCREEN_([A-Z]+)_([A-Z]+)/', function ( $placeholder_data ) use ( $breakpoints_keys, $breakpoints ) {
			$breakpoint_index = array_search( strtolower( $placeholder_data[1] ), $breakpoints_keys );

			$is_max_point = 'MAX' === $placeholder_data[2];

			if ( $is_max_point ) {
				$breakpoint_index++;
			}

			$value = $breakpoints[ $breakpoints_keys[ $breakpoint_index ] ];

			if ( $is_max_point ) {
				$value--;
			}

			return $value . 'px';
		}, $file_content );

		return $file_content;
	}
}
