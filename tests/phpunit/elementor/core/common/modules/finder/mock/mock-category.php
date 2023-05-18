<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Common\Modules\Finder\Mock;

use Elementor\Core\Common\Modules\Finder\Base_Category;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Mock_Category extends Base_Category {

	public function get_title() {
		return 'Mock';
	}

	public function get_id() {
		return 'mock_id';
	}

	public function get_category_items( array $options = [] ) {
		return [ [
			'icon' => 'mock-icon',
			'title' => 'mock-title',
			'description' => 'mock-description',
			'url' => 'mock-url',
			'actions' => [
				[
					'name' => 'mock-action-name',
					'url' => 'mock-action-url',
					'icon' => 'mock-action-icon',
				],
			],
		] ];
	}
}
