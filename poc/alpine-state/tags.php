<?php

namespace Elementor\Poc\EState;

use Elementor\Controls_Manager;
use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\AtomicWidgets\Elements\Base\Render_Context;
use Elementor\Modules\DynamicTags\Module as Dynamic_Tags_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class State_Key_Tag extends Tag {
	public function get_name() {
		return TAG_STATE_KEY;
	}

	public function get_title() {
		return 'State (POC)';
	}

	public function get_group() {
		return Dynamic_Tags_Module::BASE_GROUP;
	}

	public function get_categories() {
		return [ Dynamic_Tags_Module::TEXT_CATEGORY ];
	}

	protected function register_controls() {
		$this->add_control( 'key', [
			'label' => 'State key',
			'type' => Controls_Manager::TEXT,
		] );

		$this->add_control( 'pending_text', [
			'label' => 'Pending text',
			'type' => Controls_Manager::TEXT,
		] );
	}

	public function render() {
		$key = (string) $this->get_settings( 'key' );
		$values = Render_Context::get( CONTEXT_KEY )['values'] ?? [];
		$has_value = array_key_exists( $key, $values );
		$text = $has_value ? $values[ $key ] : (string) $this->get_settings( 'pending_text' );

		printf(
			'<span data-e-state-key="%1$s"%2$s>%3$s</span>',
			esc_attr( $key ),
			$has_value ? '' : ' data-e-state-pending="true"',
			esc_html( is_scalar( $text ) ? (string) $text : '' )
		);
	}
}

class Site_Name_Tag extends Tag {
	public function get_name() {
		return TAG_SITE_NAME;
	}

	public function get_title() {
		return 'Site name (POC)';
	}

	public function get_group() {
		return Dynamic_Tags_Module::BASE_GROUP;
	}

	public function get_categories() {
		return [ Dynamic_Tags_Module::TEXT_CATEGORY ];
	}

	public function render() {
		echo esc_html( get_bloginfo( 'name' ) );
	}
}
