<?php

namespace Elementor\Modules\FloatingBars\Classes\Render;

use Elementor\Icons_Manager;

/**
 * Class Floating_Bars_Core_Render.
 *
 * This class handles the rendering of the Contact Buttons widget for the core version.
 *
 * @since 3.23.0
 */
class Floating_Bars_Core_Render extends Floating_Bars_Render_Base {

	protected function render_announcement_icon(): void {
		$icon = $this->settings['announcement_icon'] ?? '';

		if ( '' !== $icon ): ?>
			<span class="e-floating-bars__announcement-icon"><?php Icons_Manager::render_icon( $icon, [ 'aria-hidden' => 'true' ] ); ?></span>
		<?php endif;
	}

	protected function render_announcement_text(): void {
		$text = $this->settings['announcement_text'] ?? '';
		if ( ! empty( $text) ): ?>
			<p class="e-floating-bars__announcement-text"><?php echo esc_html( $text ); ?></p>
		<?php endif;
	}

	public function render(): void {
		$this->build_layout_render_attribute();
		$icon_position = $this->settings['style_announcement_icon_position'];

		?>
		<div <?php echo $this->widget->get_render_attribute_string( 'layout' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<?php if ( 'start' == $icon_position ) {
				$this->render_announcement_icon();
			} ?>
			<?php $this->render_announcement_text(); ?>
			<?php if ( 'end' == $icon_position ) {
				$this->render_announcement_icon();
			} ?>
		</div>
		<?php
	}

	protected function add_layout_render_attribute( $layout_classnames ) {
		$this->widget->add_render_attribute( 'layout', [
			'class' => $layout_classnames,
			// 'id' => $this->settings['advanced_custom_css_id'],
			'data-document-id' => get_the_ID(),
		] );
	}
}
