<?php
namespace Elementor_Example_Plugin\Dynamic_Tags;

use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module as DynamicTagsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Site_Name_Tag extends Tag {

	public function get_name() {
		return 'example-site-name';
	}

	public function get_title() {
		return esc_html__( 'Site Name', 'elementor-example-plugin' );
	}

	public function get_group() {
		return 'elementor-example-plugin';
	}

	public function get_categories() {
		return [ DynamicTagsModule::TEXT_CATEGORY ];
	}

	protected function register_controls() {
		$this->add_control(
			'fallback',
			[
				'type' => 'text',
				'label' => esc_html__( 'Fallback', 'elementor-example-plugin' ),
				'section' => 'content',
				'default' => esc_html__( 'My Site', 'elementor-example-plugin' ),
			]
		);
	}

	public function render() {
		$name = get_bloginfo( 'name' );
		$fallback = $this->get_settings( 'fallback' );

		echo esc_html( $name ? $name : $fallback );
	}
}
