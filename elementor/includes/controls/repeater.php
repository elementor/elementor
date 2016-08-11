<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Repeater extends Control_Base {

	public function get_type() {
		return 'repeater';
	}

	protected function get_default_settings() {
		return [
			'prevent_empty' => true,
		];
	}

	public function get_value( $control, $instance ) {
		$value = parent::get_value( $control, $instance );

		if ( ! empty( $value ) ) {
			foreach ( $value as &$item ) {
				foreach ( $control['fields'] as $field ) {
					$control_obj = Plugin::instance()->controls_manager->get_control( $field['type'] );
					if ( ! $control_obj )
						continue;

					$item[ $field['name'] ] = $control_obj->get_value( $field, $item );
				}
			}
		}
		return $value;
	}

	public function content_template() {
		?>
		<label>
			<span class="elementor-control-title"><%= data.label %></span>
		</label>
		<div class="elementor-repeater-fields"></div>
		<div class="elementor-button-wrapper">
			<button class="elementor-button elementor-repeater-add"><span class="eicon-plus"></span><?php _e( 'Add Item', 'elementor' ); ?></button>
		</div>
		<?php
	}
}
