<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes\Mocks;

use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module as DynamicTagsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Mock_Dynamic_Tag extends Tag {

	public function get_name() {
		return 'mock-dynamic-tag';
	}

	public function get_title() {
		return 'Mock Dynamic Tag';
	}

	public function get_categories() {
		return [
			DynamicTagsModule::TEXT_CATEGORY,
			DynamicTagsModule::URL_CATEGORY,
		];
	}

	public function get_group() {
		return DynamicTagsModule::BASE_GROUP;
	}
}
