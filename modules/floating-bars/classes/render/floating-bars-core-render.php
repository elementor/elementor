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

	protected function render_cta_icon(): void {
		$icon = $this->settings['cta_icon'] ?? '';

		if ( '' !== $icon ): ?>
			<span class="e-floating-bars__cta-icon"><?php Icons_Manager::render_icon( $icon, [ 'aria-hidden' => 'true' ] ); ?></span>
		<?php endif;
	}

	protected function render_cta_button(): void {
		$link = $this->settings['cta_link'] ?? '';
		$text = $this->settings['cta_text'] ?? '';
		$icon_position = $this->settings['style_cta_icon_position'];

		$hover_animation = $this->settings['style_cta_button_hover_animation'];
		$corners = $this->settings['style_cta_button_corners'];
		$link_type = $this->settings['style_cta_type'];

		$cta_classnames = 'e-floating-bars__cta-button';

		if ( ! empty( $hover_animation ) ) {
			$cta_classnames .= ' elementor-animation-' . $hover_animation;
		}

		if ( ! empty( $corners ) ) {
			$cta_classnames .= ' has-corners-' . $corners;
		}

		if ( ! empty( $link_type ) ) {
			$cta_classnames .= ' is-type-' . $link_type;
		}

		$this->widget->add_render_attribute( 'cta-button', [
			'class' => $cta_classnames,
		] );

		if ( ! empty( $link['url'] ) ) {
			$this->widget->add_link_attributes( 'cta-button', $link );
			?>
				<a <?php echo $this->widget->get_render_attribute_string( 'cta-button' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
					<?php if ( 'start' == $icon_position ) {
						$this->render_cta_icon();
					} ?>
					<?php echo esc_html( $text ); ?>
					<?php if ( 'end' == $icon_position ) {
						$this->render_cta_icon();
					} ?>
				</a>
			<?php
		}
	}

	protected function render_close_button(): void {
		$button_position = $this->settings['floating_bar_close_button_position'];
		$close_button_classnames = 'e-floating-bars__close-button has-position-' . $button_position;

		$this->widget->add_render_attribute( 'close-button', [
			'class' => $close_button_classnames,
			'aria-label' => __( 'Close', 'elementor' ),
		] );

		?>
			<button <?php echo $this->widget->get_render_attribute_string( 'close-button' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
				<?php if ( ! empty( $close_button_icon ) ) {
					Icons_Manager::render_icon( $close_button_icon, [ 'aria-hidden' => 'true' ] );
				} ?>
				<?php if ( ! empty( $close_button_text ) ) {
					echo esc_html( $close_button_text );
				} ?>
			</button>
		<?php
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
			<?php $this->render_cta_button(); ?>
			<?php $this->render_close_button(); ?>
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
