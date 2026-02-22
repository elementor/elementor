<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Controls_Manager;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;
use Elementor\Group_Control_Typography;
use Elementor\Plugin;
use Elementor\Repeater;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Typography_Extension {
	public function register_hooks() {
		add_action( 'elementor/kit/global-typography/register_controls', [ $this, 'add_v4_classes_section' ] );
		add_action( 'elementor/editor/after_enqueue_styles', [ $this, 'enqueue_editor_styles' ] );
	}

	public function enqueue_editor_styles() {
		wp_enqueue_style(
			'elementor-design-system-sync-editor',
			plugins_url( '../assets/css/editor.css', __FILE__ ),
			[],
			ELEMENTOR_VERSION
		);
	}

	public function add_v4_classes_section( Global_Typography $tab ) {
		if ( ! Plugin::$instance->editor->is_edit_mode() ) {
			return;
		}

		$v4_typography_classes = $this->get_v4_typography_classes();

		if ( empty( $v4_typography_classes ) ) {
			return;
		}

		$tab->add_control(
			'heading_v4_typography_classes',
			[
				'type' => Controls_Manager::HEADING,
				'label' => esc_html__( 'Version 4 Classes', 'elementor' ),
				'separator' => 'before',
			]
		);

		$tab->add_control(
			'heading_v4_typography_classes_description',
			[
				'type' => Controls_Manager::RAW_HTML,
				'raw' => esc_html__( 'V4 classes can only be edited when applied on an atom.', 'elementor' ),
				'content_classes' => 'elementor-descriptor',
			]
		);

		$repeater = new Repeater();

		$repeater->add_control(
			'title',
			[
				'type' => Controls_Manager::TEXT,
				'label_block' => true,
				'required' => true,
			]
		);

		$repeater->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'typography',
				'label' => '',
				'global' => [
					'active' => false,
				],
			]
		);

		$default_values = [];
		foreach ( $v4_typography_classes as $class ) {
			$label = sanitize_text_field( $class['label'] ?? '' );
			if ( empty( $label ) ) {
				continue;
			}

			$default_values[] = [
				'_id' => 'v4-' . $label,
				'title' => $label,
				'typography_typography' => 'custom',
				'typography_font_family' => 'Roboto',
				'typography_font_weight' => '500',
			];
		}

		$tab->add_control(
			'v4_typography_classes',
			[
				'type' => \Elementor\Core\Kits\Controls\Repeater::CONTROL_TYPE,
				'fields' => $repeater->get_controls(),
				'default' => $default_values,
				'item_actions' => [
					'add' => false,
					'duplicate' => false,
					'remove' => false,
					'sort' => false,
				],
			]
		);
	}

	private function get_v4_typography_classes(): array {
		$synced_classes = Classes_Provider::get_synced_classes();

		if ( empty( $synced_classes ) ) {
			return [];
		}

		$typography_classes = [];

		foreach ( $synced_classes as $id => $class ) {
			$variants = $class['variants'] ?? [];
			$default_props = $this->get_default_breakpoint_props( $variants );

			if ( empty( $default_props ) ) {
				continue;
			}

			if ( ! $this->has_typography_props( $default_props ) ) {
				continue;
			}

			$typography_classes[] = [
				'id' => $id,
				'label' => $class['label'] ?? '',
				'props' => $default_props,
			];
		}

		return $typography_classes;
	}

	private function get_default_breakpoint_props( array $variants ): array {
		foreach ( $variants as $variant ) {
			if ( ! isset( $variant['meta'] ) ) {
				continue;
			}

			$meta = $variant['meta'];

			if ( ! array_key_exists( 'breakpoint', $meta ) || ! array_key_exists( 'state', $meta ) ) {
				continue;
			}

			$breakpoint = $meta['breakpoint'];
			$state = $meta['state'];

			if ( ! in_array( $breakpoint, [ null, 'desktop' ], true ) ) {
				continue;
			}

			if ( ! in_array( $state, [ null, 'normal' ], true ) ) {
				continue;
			}

			return $variant['props'] ?? [];
		}

		return [];
	}

	private function has_typography_props( array $props ): bool {
		$typography_prop_keys = [
			'font-family',
			'font-size',
			'font-weight',
			'font-style',
			'text-decoration',
			'line-height',
			'letter-spacing',
			'word-spacing',
			'text-transform',
		];

		foreach ( $typography_prop_keys as $key ) {
			if ( isset( $props[ $key ] ) ) {
				return true;
			}
		}

		return false;
	}
}
