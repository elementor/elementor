<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Box_Shadow extends Control_Base_Multiple {

	public function get_type() {
		return 'box_shadow';
	}

	public function get_default_value() {
		return [
			'horizontal' => 0,
			'vertical' => 0,
			'blur' => 0,
			'spread' => 0,
		];
	}

	public function get_sliders() {
		return [
			[ 'label' => 'Horizontal Length', 'type' => 'horizontal' ],
			[ 'label' => 'Vertical Length', 'type' => 'vertical' ],
			[ 'label' => 'Blur Radius', 'type' => 'blur' ],
			[ 'label' => 'Spread Radius', 'type' => 'spread' ],
		];
	}

	public function content_template() {
		foreach ( $this->get_sliders() as $slider ) : ?>
			<div class="elementor-control-field">
				<label class="elementor-control-title">
					<?php echo $slider['label']; ?>
				</label>
				<div class="elementor-control-input-wrapper">
					<div class="elementor-control-slider"></div>
					<div class="elementor-control-slider-input">
						<input type="number" min="<%= data.min %>" max="<%= data.max %>" step="<%= data.step %>" data-setting="<?php echo $slider['type']; ?>" />
					</div>
				</div>
			</div>
		<?php endforeach; ?>

		<?php
	}
}
