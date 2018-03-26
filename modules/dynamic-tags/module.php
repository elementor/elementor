<?php
namespace Elementor\Modules\DynamicTags;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\DynamicTags\Tag;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	const BASE_GROUP = 'base';

	const TEXT_CATEGORY = 'text';

	const URL_CATEGORY = 'url';

	const IMAGE_CATEGORY = 'image';

	const POST_META_CATEGORY = 'post_meta';

	const GALLERY_CATEGORY = 'gallery';

	public function __construct() {
		$this->register_groups();

		$this->register_tags();
	}

	public function get_name() {
		return 'dynamic_tags';
	}

	public function get_tag_classes_names() {
		return [];
	}

	public function get_groups() {
		return [
			self::BASE_GROUP => [
				'title' => 'Base Tags',
			],
		];
	}

	private function register_groups() {
		foreach ( $this->get_groups() as $group_name => $group_settings ) {
			Plugin::$instance->dynamic_tags->register_group( $group_name, $group_settings );
		}
	}

	private function register_tags() {
		foreach ( $this->get_tag_classes_names() as $tag_class ) {
			/** @var Tag $class_name */
			$class_name = $this->get_reflection()->getNamespaceName() . '\Tags\\' . $tag_class;

			Plugin::$instance->dynamic_tags->register_tag( $class_name );
		}
	}
}
