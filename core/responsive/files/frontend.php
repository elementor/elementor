<?php

namespace Elementor\Core\Responsive\Files;

use Elementor\Core\Base\File;
use Elementor\Core\Responsive\Responsive;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Frontend extends File {

	const META_KEY = 'elementor_frontend_css';

	const DEFAULT_FILES_DIR = 'css/';

	public function parse_content() {
		$template_file_name = str_replace( 'custom-', '', $this->get_file_name() );

		$template_file = Responsive::get_templates_path() . $template_file_name;

		$breakpoints = Responsive::get_breakpoints();

		$breakpoints_keys = array_keys( $breakpoints );

		$file_content = file_get_contents( $template_file );

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
