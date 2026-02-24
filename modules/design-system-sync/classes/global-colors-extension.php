<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Controls_Manager;
use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Modules\DesignSystemSync\Controls\V4_Color_Variable_List;
use Elementor\Plugin;
use Elementor\Repeater;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Colors_Extension {
	public function register_hooks() {
		add_action( 'elementor/kit/global-colors/register_controls', [ $this, 'add_v4_variables_section' ] );
		add_action( 'elementor/editor/after_enqueue_scripts', [ $this, 'enqueue_editor_scripts' ] );
		add_filter( 'elementor/globals/colors/items', [ $this, 'add_v4_variables_section_to_color_selector' ] );
	}

	public function enqueue_editor_scripts() {
		$min_suffix = Utils::is_script_debug() ? '' : '.min';

		wp_enqueue_script(
			'elementor-design-system-sync-editor',
			plugins_url( '../assets/js/editor-variables-sync' . $min_suffix . '.js', __FILE__ ),
			[],
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

		$items = [];
		foreach ( $v4_colors as $variable ) {
			$items[] = [
				'_id' => $variable['id'],
				'title' => $variable['label'],
				'color' => strtoupper( $variable['value'] ),
			];
		}

		$tab->add_control(
			'heading_v4_variables',
			[
				'type' => Controls_Manager::HEADING,
				'label' => esc_html__( 'Atomic Variables', 'elementor' ),
				'separator' => 'before',
			]
		);

		$tab->add_control(
			'v4_color_variables_display',
			[
				'type' => V4_Color_Variable_List::TYPE,
				'items' => $items,
			]
		);
	}

	public function add_v4_variables_section_to_color_selector( array $items ): array {
		$v4_colors = $this->get_v4_color_variables();

		if ( empty( $v4_colors ) ) {
			return $items;
		}

		foreach ( $v4_colors as $color ) {
			$label = sanitize_text_field( $color['label'] ?? '' );

			if ( empty( $label ) ) {
				continue;
			}

			$id = Variables_Provider::get_v4_variable_id( $label );

			$items[ $id ] = [
				'id' => $id,
				'title' => $label,
				'value' => strtoupper( $color['value'] ),
				'group' => 'v4',
			];
		}

		return $items;
	}

	private function get_v4_color_variables(): array {
		$synced_variables = Variables_Provider::get_synced_color_variables();

		if ( empty( $synced_variables ) ) {
			return [];
		}

		$color_variables = [];

		foreach ( $synced_variables as $id => $variable ) {
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
