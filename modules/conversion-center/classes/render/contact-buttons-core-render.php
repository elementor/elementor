<?php

namespace Elementor\Modules\ConversionCenter\Classes\Render;

/**
 * Class Contact_Buttons_Core_Render.
 *
 * This class handles the rendering of the Contact Buttons widget for the core version.
 *
 * @since 3.23.0
 */
class Contact_Buttons_Core_Render extends Contact_Buttons_Render_Base {

	public function render(): void {
		$this->build_layout_render_attribute();

		$content_classnames = 'e-contact-buttons__content';
		$animation_duration = $this->settings['style_chat_box_animation_duration'];

		if ( ! empty( $animation_duration ) ) {
			$content_classnames .= ' has-animation-duration-' . $animation_duration;
		}

		$this->widget->add_render_attribute( 'content', [
			'class' => $content_classnames,
		] );
		?>
		<div <?php echo $this->widget->get_render_attribute_string( 'layout' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<div class="e-contact-buttons__content-wrapper hidden">
				<div <?php echo $this->widget->get_render_attribute_string( 'content' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
					<?php
					$this->render_top_bar();
					$this->render_message_bubble();
					$this->render_send_button();
					?>
				</div>
			</div>
			<?php
			$this->render_chat_button();
			?>
		</div>
		<?php
	}

}
