<?php

namespace Elementor\Core\Common\Modules\Finder;

use Elementor\Core\Base\Base_Object;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Base_Category extends Base_Object {

	abstract public function get_title();

	abstract public function get_category_items( array $options = [] );

	public function is_dynamic() {
		return false;
	}

	protected function get_init_settings() {
		$settings = [
			'title' => $this->get_title(),
			'dynamic' => $this->is_dynamic(),
		];

		if ( ! $settings['dynamic'] ) {
			$settings['items'] = $this->get_category_items();
		}

		return $settings;
	}
}
