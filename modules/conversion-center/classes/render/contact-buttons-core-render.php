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
		?>
		<div <?php echo $this->widget->get_render_attribute_string( 'layout' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<div class="e-contact-buttons__content-wrapper hidden">
				<div class="e-contact-buttons__content">
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
