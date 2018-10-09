<?php

namespace Elementor\Core\Common\Modules\Assistant;

use Elementor\Core\Base\Base_Object;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Base_Category extends Base_Object {

	abstract public function get_title();

	abstract public function get_category_items( array $options = [] );

	public function is_remote() {
		return false;
	}

	protected function get_init_settings() {
		$settings = [
			'title' => $this->get_title(),
			'remote' => $this->is_remote(),
		];

		if ( ! $settings['remote'] ) {
			$settings['items'] = $this->get_category_items();
		}

		return $settings;
	}
}
