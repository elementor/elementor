<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Admin\Base;

use Elementor\Core\Admin\Base\Metabox_Base;

class Mock_Test_Metabox extends Metabox_Base {
	/**
	 * @var bool
	 */
	public $default_is_sanitize_meta = true;

	const TEST_PREFIX = 'test_metabox_';

	const CPT = self::TEST_PREFIX . 'type';

	const FIELD_INPUT_A = self::TEST_PREFIX . 'input_a';
	const FIELD_INPUT_B = self::TEST_PREFIX . 'input_b';

	const INPUT_FIELDS = [
		self::FIELD_INPUT_A,
		self::FIELD_INPUT_B,
	];

	public function get_name() {
		return self::TEST_PREFIX . 'name';
	}

	public function get_type() {
		return self::CPT;
	}

	public function get_title() {
		return self::TEST_PREFIX . 'title';
	}

	public function get_fields() {
		return [
			[
				'id' => self::FIELD_INPUT_A,
				'field_type' => 'input',
			],
			[
				'id' => self::FIELD_INPUT_B,
				'field_type' => 'input',
			],
		];
	}

	public function get_input_fields() {
		return self::INPUT_FIELDS;
	}

	protected function sanitize_post_meta( $field_name, $post_meta, $is_sanitize_meta = true ) {
		return parent::sanitize_post_meta( $field_name, $post_meta, $this->default_is_sanitize_meta );
	}
}
