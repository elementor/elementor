<?php

namespace Elementor\Testing\Modules\AtomicWidgets\DynamicTags\Mocks;

use Elementor\Controls_Manager;
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

	public function register_controls() {
		$this->add_control(
			'mock-control-1',
			[
				'label' => 'Mock Control',
				'type' => Controls_Manager::SELECT,
				'default' => 'mock-value-1',
				'options' => [
					'mock-value-1' => 'Mock Value 1',
					'mock-value-2' => 'Mock Value 2',
					'mock-value-3' => 'Mock Value 3',
				],
			]
		);

		$this->add_control(
			'mock-control-2',
			[
				'label' => 'Mock Control 2',
				'type' => Controls_Manager::TEXT,
				'default' => 'mock-value-4',
			]
		);
	}
}
