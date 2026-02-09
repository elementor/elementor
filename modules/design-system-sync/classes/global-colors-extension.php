<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Controls_Manager;
use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Modules\Variables\Storage\Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Colors_Extension {
	public function register_hooks() {
		add_action( 'elementor/kit/global-colors/register_controls', [ $this, 'add_v4_variables_section' ] );
		add_action( 'elementor/editor/after_enqueue_styles', [ $this, 'enqueue_editor_styles' ] );
		add_action( 'elementor/editor/after_enqueue_scripts', [ $this, 'enqueue_editor_scripts' ] );
	}

	public function enqueue_editor_styles() {
		wp_enqueue_style(
			'elementor-design-system-sync-editor',
			plugins_url( '../assets/css/editor.css', __FILE__ ),
			[],
			ELEMENTOR_VERSION
		);
	}

	public function enqueue_editor_scripts() {
		wp_enqueue_script(
			'elementor-design-system-sync-editor',
			plugins_url( '../assets/js/editor.js', __FILE__ ),
			[ 'jquery', 'elementor-editor' ],
			ELEMENTOR_VERSION,
			true
		);
	}

	public function add_v4_variables_section( Global_Colors $tab ) {
		if ( ! Plugin::$instance->editor->is_edit_mode() ) {
			return;
		}

		$v4_colors = $this->get_v4_color_variables();

		if ( empty( $v4_colors ) ) {
			return;
		}

		$tab->add_control(
			'heading_v4_variables',
			[
				'type' => Controls_Manager::HEADING,
				'label' => esc_html__( 'Version 4 Variables', 'elementor' ),
				'separator' => 'before',
			]
		);

		$repeater = new \Elementor\Repeater();

		$repeater->add_control(
			'title',
			[
				'type' => Controls_Manager::TEXT,
				'label_block' => true,
			]
		);

		$repeater->add_control(
			'color',
			[
				'type' => Controls_Manager::COLOR,
				'label_block' => true,
			]
		);

		$default_values = [];
		foreach ( $v4_colors as $variable ) {
			$default_values[] = [
				'_id' => $variable['id'],
				'title' => $variable['label'],
				'color' => $variable['value'],
			];
		}

		$tab->add_control(
			'v4_color_variables',
			[
				'type' => \Elementor\Core\Kits\Controls\Repeater::CONTROL_TYPE,
				'fields' => $repeater->get_controls(),
				'default' => $default_values,
				'item_actions' => [
					'add' => false,
					'remove' => false,
					'duplicate' => false,
				],
				'classes' => 'elementor-control-v4-variables-readonly',
			]
		);
	}

	private function get_v4_color_variables(): array {
		$kit = Plugin::$instance->kits_manager->get_active_kit_for_frontend();

		if ( ! $kit ) {
			return [];
		}

		$repository = new Repository( $kit );
		$all_variables = $repository->variables();

		$color_variables = [];

		foreach ( $all_variables as $id => $variable ) {
			if ( isset( $variable['deleted'] ) && $variable['deleted'] ) {
				continue;
			}

			if ( empty( $variable['type'] ) || 'global-color-variable' !== $variable['type'] ) {
				continue;
			}

			if ( empty( $variable['sync_to_v3'] ) ) {
				continue;
			}

			$value = $variable['value'] ?? '';

			if ( is_array( $value ) && isset( $value['value'] ) ) {
				$value = $value['value'];
			}

			$color_variables[] = [
				'id' => $id,
				'label' => $variable['label'] ?? '',
				'value' => $value,
				'order' => $variable['order'] ?? 0,
			];
		}

		usort( $color_variables, function( $a, $b ) {
			return $a['order'] <=> $b['order'];
		} );

		return $color_variables;
	}
}

