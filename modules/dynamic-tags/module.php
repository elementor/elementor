<?php
namespace Elementor\Modules\DynamicTags;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Module extends BaseModule {

	const DEFAULT_GROUP = 'base';

	public function __construct() {
		$this->register_groups();

		$this->register_tags();
	}

	public function get_name() {
		return 'dynamic_tags';
	}

	public function get_tag_classes_names() {
		return [ 'Icon' ];
	}

	public function get_groups() {
		return [
			self::DEFAULT_GROUP => [
				'title' => __( 'Base Tags', 'elementor' ),
			],
		];
	}

	private function register_groups() {
		foreach ( $this->get_groups() as $group_name => $group_settings ) {
			Plugin::$instance->dynamic_tags_manager->register_group( $group_name, $group_settings );
		}
	}

	private function register_tags() {
		foreach ( $this->get_tag_classes_names() as $tag_class ) {
			Plugin::$instance->dynamic_tags_manager->register_tag( $this->get_reflection()->getNamespaceName() . '\Tags\\' . $tag_class );
		}
	}
}
