<?php

namespace Elementor\Testing\Modules\AtomicWidgets\DynamicTags\Mocks;

use Elementor\Core\DynamicTags\Data_Tag;
use Elementor\Modules\DynamicTags\Module as DynamicTagsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Mock_Image_Dynamic_Tag extends Data_Tag {

	const ATTACHMENT_ID = 123;
	const ATTACHMENT_URL = 'https://example.com/icon.svg';

	/**
	 * The value that the tag resolves into, so tests can simulate different tag results.
	 *
	 * @var mixed
	 */
	public static $value = [
		'id' => self::ATTACHMENT_ID,
		'url' => self::ATTACHMENT_URL,
	];

	public static function reset() {
		static::$value = [
			'id' => self::ATTACHMENT_ID,
			'url' => self::ATTACHMENT_URL,
		];
	}

	public function get_name() {
		return 'mock-image-dynamic-tag';
	}

	public function get_title() {
		return 'Mock Image Dynamic Tag';
	}

	public function get_group() {
		return DynamicTagsModule::BASE_GROUP;
	}

	public function get_categories() {
		return [ DynamicTagsModule::IMAGE_CATEGORY ];
	}

	protected function get_value( array $options = [] ) {
		return static::$value;
	}

	protected function register_controls() {}

	protected function register_advanced_section() {}
}
