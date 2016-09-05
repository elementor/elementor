<?php
namespace Elementor\System_Info\Classes;

use Elementor\System_Info\Classes\Abstracts\Base_Reporter;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class User_Reporter extends Base_Reporter {

	public function get_title() {
		return 'User';
	}

	public function get_fields() {
		return [
			'role' => 'Role',
			'locale' => 'WP Profile lang',
			'agent' => 'User Agent',
		];
	}

	public function get_role() {
		$role = null;

		$current_user = wp_get_current_user();
		if ( ! empty( $current_user->roles ) ) {
			$role = $current_user->roles[0];
		}

		return [
			'value' => $role,
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
