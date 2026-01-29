<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Base;

use Elementor\Modules\AtomicWidgets\Elements\TemplateRenderer\Template_Renderer;
use Elementor\Modules\Interactions\Adapter as Interactions_Adapter;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Has_Atomic_Base
 */
trait Has_Template {

	public function get_initial_config() {
		$config = parent::get_initial_config();

		$config['twig_main_template'] = $this->get_main_template();
		$config['twig_templates'] = $this->get_templates_contents();
		return $config;
	}

	protected function render() {
		try {
			$renderer = Template_Renderer::instance();

			foreach ( $this->get_templates() as $name => $path ) {
				if ( $renderer->is_registered( $name ) ) {
					continue;
				}

				$renderer->register( $name, $path );
			}

			$context = [
				'id' => $this->get_id(),
				'type' => $this->get_name(),
				'settings' => $this->get_atomic_settings(),
				'base_styles' => $this->get_base_styles_dictionary(),
				'interactions' => $this->get_interactions_ids(),
			];

			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo $renderer->render( $this->get_main_template(), $context );
		} catch ( \Exception $e ) {
			if ( Utils::is_elementor_debug() ) {
				throw $e;
			}
		}
	}

	public function get_interactions_ids() {
		$animation_ids = [];

		$list_of_interactions = $this->extract_interactions_items( $this->interactions );

		foreach ( $list_of_interactions as $interaction ) {

			if ( isset( $interaction['$$type'] ) && 'interaction-item' === $interaction['$$type'] ) {
				$animation_id = $this->extract_animation_id_from_prop_type( $interaction );
				if ( $animation_id ) {
					$animation_ids[] = $animation_id;
				}
			} elseif ( isset( $interaction['animation']['animation_id'] ) ) {
				$animation_ids[] = $interaction['animation']['animation_id'];
			}
		}

		return $animation_ids;
	}

	/**
	 * Extract items array from interactions data.
	 * Handles both v1 format (items is array) and v2 format (items is wrapped with $$type).
	 */
	private function extract_interactions_items( $interactions ) {
		if ( ! is_array( $interactions ) || ! isset( $interactions['items'] ) ) {
			return [];
		}

		$items = $interactions['items'];

		// Handle v2 wrapped format: {$$type: 'interactions-array', value: [...]}
		if ( isset( $items['$$type'] ) && Interactions_Adapter::ITEMS_TYPE === $items['$$type'] ) {
			return isset( $items['value'] ) && is_array( $items['value'] ) ? $items['value'] : [];
		}

		// v1 format: items is direct array
		return is_array( $items ) ? $items : [];
	}

	private function extract_animation_id_from_prop_type( $item ) {
		if ( ! isset( $item['value'] ) || ! is_array( $item['value'] ) ) {
			return null;
		}

		$item_value = $item['value'];

		$trigger = $this->extract_prop_value_simple( $item_value, 'trigger' );
		$animation = $this->extract_prop_value_simple( $item_value, 'animation' );

		if ( ! is_array( $animation ) ) {
			return null;
		}

		$effect = $this->extract_prop_value_simple( $animation, 'effect' );
		$type = $this->extract_prop_value_simple( $animation, 'type' );
		$direction = $this->extract_prop_value_simple( $animation, 'direction' );
		$timing_config = $this->extract_prop_value_simple( $animation, 'timing_config' );
		$config = $this->extract_prop_value_simple( $animation, 'config' );

		$duration = 600;
		$delay = 0;
		$replay = 0;
		$easing = 'easeIn';
		$relative_to = 'viewport';
		$offset_top = 15;
		$offset_bottom = 85;

		if ( is_array( $timing_config ) ) {
			$duration = Interactions_Adapter::extract_time_value( $timing_config['duration'] ?? null, 600 );
			$delay = Interactions_Adapter::extract_time_value( $timing_config['delay'] ?? null, 0 );
		}

		if ( is_array( $config ) ) {
			$relative_to = $this->extract_prop_value_simple( $config, 'relativeTo', 'viewport' );
			$offset_top = Interactions_Adapter::extract_numeric_value( $config['offsetTop'] ?? null, 15 );
			$offset_bottom = Interactions_Adapter::extract_numeric_value( $config['offsetBottom'] ?? null, 85 );
			$replay = $this->extract_prop_value_simple( $config, 'replay', 0 );
			if ( empty( $replay ) && 0 !== $replay && '0' !== $replay ) {
				$replay = 0;
			}
			$easing = $this->extract_prop_value_simple( $config, 'easing', 'easeIn' );
		} else {
			$replay = 0;
		}

		return implode( '-', [
			$trigger,
			$effect,
			$type,
			$direction,
			$duration,
			$delay,
			$replay,
			$easing,
			$relative_to,
			$offset_top,
			$offset_bottom,
		] );
	}

	private function extract_prop_value_simple( $data, $key, $default = '' ) {
		if ( ! is_array( $data ) || ! isset( $data[ $key ] ) ) {
			return $default;
		}

		$value = $data[ $key ];

		if ( is_array( $value ) && isset( $value['$$type'] ) && isset( $value['value'] ) ) {
			return $value['value'];
		}

		return null !== $value ? $value : $default;
	}

	protected function get_templates_contents() {
		return array_map(
			fn ( $path ) => Utils::file_get_contents( $path ),
			$this->get_templates()
		);
	}

	protected function get_main_template() {
		$templates = $this->get_templates();

		if ( count( $templates ) > 1 ) {
			Utils::safe_throw( 'When having more than one template, you should override this method to return the main template.' );

			return null;
		}

		foreach ( $templates as $key => $path ) {
			// Returns first key in the array.
			return $key;
		}

		return null;
	}

	abstract protected function get_templates(): array;
}
