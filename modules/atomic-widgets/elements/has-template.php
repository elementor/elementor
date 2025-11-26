<?php

namespace Elementor\Modules\AtomicWidgets\Elements;

use Elementor\Modules\AtomicWidgets\TemplateRenderer\Template_Renderer;
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

	// public function get_interactions_ids() {
	// 	$animation_ids = [];

	// 	$list_of_interactions = ( is_array( $this->interactions ) && isset( $this->interactions['items'] ) )
	// 		? $this->interactions['items']
	// 		: [];

	// 	foreach ( $list_of_interactions as $interaction ) {
	// 		if ( isset( $interaction['animation']['animation_id'] ) ) {
	// 			$animation_ids[] = $interaction['animation']['animation_id'];
	// 		}
	// 	}

	// 	return $animation_ids;
	// }

	public function get_interactions_ids() {
		$animation_ids = [];
	
		$list_of_interactions = ( is_array( $this->interactions ) && isset( $this->interactions['items'] ) )
			? $this->interactions['items']
			: [];
	
		foreach ( $list_of_interactions as $interaction ) {
			$animation_id = $this->parse_interaction_to_animation_id( $interaction );
			
			if ( ! empty( $animation_id ) ) {
				$animation_ids[] = $animation_id;
			}
		}
	
		return $animation_ids;
	}
	
	private function parse_interaction_to_animation_id( $interaction ) {
		if ( ! is_array( $interaction ) ) {
			return '';
		}

		if ( isset( $interaction['$$type'] ) && $interaction['$$type'] === 'interaction-item' && isset( $interaction['value'] ) ) {
			$interaction = $interaction['value'];
		}
	
		$interaction_id = $this->get_prop_value( $interaction, 'interaction_id' );
		$trigger = $this->get_prop_value( $interaction, 'trigger' );
		$animation = $this->get_prop_value( $interaction, 'animation' );
	
		if ( empty( $trigger ) || empty( $animation ) ) {
			return '';
		}
	
		$effect = $this->get_prop_value( $animation, 'effect' );
		$type = $this->get_prop_value( $animation, 'type' );
		$direction = $this->get_prop_value( $animation, 'direction' );
		$timing_config = $this->get_prop_value( $animation, 'timing_config' );
	
		if ( empty( $effect ) || empty( $type ) ) {
			return '';
		}
	
		$duration = 300;
		$delay = 0;
	
		if ( is_array( $timing_config ) ) {
			$duration = $this->get_prop_value( $timing_config, 'duration', 300 );
			$delay = $this->get_prop_value( $timing_config, 'delay', 0 );
		}
	
		$parts = [
			$interaction_id ?: '',
			$trigger,
			$effect,
			$type,
			$direction ?: '',
			$duration,
			$delay,
		];
	
		return implode( '-', array_filter( $parts, function( $part ) {
			return '' !== $part && null !== $part;
		} ) );
	}
	
	private function get_prop_value( $data, $key, $default = '' ) {
		if ( ! is_array( $data ) || ! isset( $data[ $key ] ) ) {
			return $default;
		}
	
		$value = $data[ $key ];
	
		if ( is_array( $value ) ) {
			if ( isset( $value['$$type'] ) && isset( $value['value'] ) ) {
				return $value['value'];
			}
	
			if ( isset( $value['value'] ) ) {
				return $value['value'];
			}
	
			return $value;
		}
	
		return $value;
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
