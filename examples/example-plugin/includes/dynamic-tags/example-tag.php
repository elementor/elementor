<?php
namespace Elementor_Example_Plugin;

use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Example_Tag extends Tag {

	public function get_name(): string {
		return 'elementor-example-tag';
	}

	public function get_title(): string {
		return esc_html__( 'Example Tag', 'elementor-example-plugin' );
	}

	public function get_group(): string {
		return Module::BASE_GROUP;
	}

	public function get_categories(): array {
		return [ Module::TEXT_CATEGORY ];
	}

	public function render(): void {}
}
