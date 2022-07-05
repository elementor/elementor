<?php

namespace Elementor;

require_once dirname( __FILE__ ) . '/../interfaces/new-template-renderer-interface.php';

class New_Template_Select_Renderer implements New_Template_Renderer_Interface {

	public function render( $control_settings ) {
		$control_id = "elementor-new-template__form__{$control_settings['name']}";
		$wrapper_class = isset( $control_settings['wrapper_class'] ) ? $control_settings['wrapper_class'] : '';

		?>

		<div id="<?php echo esc_html( $control_id ); ?>__wrapper" class="elementor-form-field <?php echo esc_html( $wrapper_class ); ?>">
			<label for="<?php echo esc_html( $control_id ); ?>" class="elementor-form-field__label">
				<?php echo esc_html( $control_settings['label'] ); ?>
			</label>
			<div class="elementor-form-field__select__wrapper">
				<select id="<?php echo esc_html( $control_id ); ?>" class="elementor-form-field__select" name="meta[<?php echo esc_html( $control_settings['name'] ); ?>]">
					<?php
					foreach ( $control_settings['options'] as $key => $value ) {
						echo sprintf( '<option value="%1$s">%2$s</option>', esc_html( $key ), esc_html( $value ) );
					}
					?>
				</select>
			</div>
		</div>
		<?php
	}
}



