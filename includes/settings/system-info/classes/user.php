<?php
namespace Elementor\System_Info\Classes;

use Elementor\System_Info\Classes\Abstracts\Base_Reporter;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class User_Reporter extends Base_Reporter {

	public function get_title() {
		return __( 'User', 'elementor' );
	}

	public function get_fields() {
		return [
			'locale' => __( 'WP Profile lang', 'elementor' ),
			'agent' => __( 'User Agent', 'elementor' ),
		];
	}

	public function get_locale() {
		return [
			'value' => get_locale(),
		];
	}

	public function get_agent() {
		return [
			'value' => $_SERVER['HTTP_USER_AGENT'],
		];
	}
}
