<?php

namespace Elementor\Modules\ConversionCenter\Classes\Render;

use Elementor\Icons_Manager;
use Elementor\Modules\ConversionCenter\Classes\Providers\Social_Network_Provider;
use Elementor\Utils;

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
			<div class="e-contact-buttons__content">
				<?php
				$this->render_top_bar();
				?>
			</div>
			<?php
			$this->render_chat_button();
			?>
		</div>
		<?php
	}

	private function render_chat_button(): void {
		$platform = $this->settings['chat_button_platform'] ?? '';
		$display_dot = $this->settings['chat_button_show_dot'];
		$button_size = $this->settings['style_chat_button_size'];
		$hover_animation = $this->settings['style_button_color_hover_animation'];

		$button_classnames = 'e-contact-buttons__chat-button';

		if (! empty($button_size)) {
			$button_classnames .= ' has-size-' . $button_size;
		}
		
		if (! empty($hover_animation)) {
			$button_classnames .= ' elementor-animation-' . $hover_animation;
		}

		if ('yes' === $display_dot) {
			$button_classnames .= ' has-dot';
		}

		$this->widget->add_render_attribute( 'button-', [
			'class' => $button_classnames,
		] );

		?>
		<div class="e-contact-buttons__chat-button-container">
			<button <?php echo $this->widget->get_render_attribute_string( 'button-' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> type="button" aria-label="Open">

				<!-- TODO: add icon dynamically -->
				<svg aria-hidden="true" class="e-font-icon-svg e-fab-whatsapp" viewBox="0 0 448 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path></svg>
				</button>
			</div>
		<?php
	}

	private function render_top_bar(): void {
		$profile_image_value = $this->settings['top_bar_image'] ?? [];
		$has_profile_image = ! empty( $profile_image_value ) && ( ! empty( $profile_image_value['url'] || ! empty( $profile_image_value['id'] ) ) );
		$profile_image_size = $this->settings['style_top_bar_image_size'];
		$display_profile_dot = $this->settings['top_bar_show_dot'];

		$profile_image_classnames = 'e-contact-buttons__profile-image';

		if (! empty($profile_image_size)) {
			$profile_image_classnames .= ' has-size-' . $profile_image_size;
		}

		if ('yes' === $display_profile_dot) {
			$profile_image_classnames .= ' has-dot';
		}

		$top_bar_name = $this->settings['top_bar_name'] ?? '';
		$top_bar_title = $this->settings['top_bar_title'] ?? '';

		$has_top_bar_name = ! empty( $top_bar_name );
		$has_top_bar_title = ! empty( $top_bar_title );

		$this->widget->add_render_attribute( 'profile-image', [
			'class' => $profile_image_classnames,
		] );
		?>
		<div class="e-contact-buttons__top-bar">
			<button type="button" class="e-contact-buttons__close-button">
				<!-- TODO: make icon dynamic -->
				<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
			</button>
			<div <?php echo $this->widget->get_render_attribute_string( 'profile-image' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
				<?php if ( ! empty( $profile_image_value['id'] ) ) {
					echo wp_get_attachment_image( $profile_image_value['id'], 'medium', false, [
						'class' => 'e-contact-buttons__profile-image-el',
					] );
				} else {
					$this->widget->add_render_attribute( 'profile-image-src', [
						'alt'   => '',
						'class' => 'e-contact-buttons__profile-image-el',
						'src'   => esc_url( $profile_image_value['url'] ),
					] );
					?>
					<img <?php echo $this->widget->get_render_attribute_string( 'profile-image-src' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> />
				<?php }; ?>
			</div>

			<div class="e-contact-buttons__top-bar-details">
				<?php if ( $has_top_bar_name ) {
					$this->widget->add_render_attribute( 'top-bar-name', 'class', 'e-contact-buttons__top-bar-name' );
					$top_bar_name_output = sprintf( '<p %1$s>%2$s</p>', $this->widget->get_render_attribute_string( 'top-bar-name' ), $top_bar_name );
					Utils::print_unescaped_internal_string( $top_bar_name_output );
				} ?>
				<?php if ( $has_top_bar_title ) {
					$this->widget->add_render_attribute( 'top-bar-title', 'class', 'e-contact-buttons__top-bar-title' );
					$top_bar_title_output = sprintf( '<p %1$s>%2$s</p>', $this->widget->get_render_attribute_string( 'top-bar-title' ), $top_bar_title );
					Utils::print_unescaped_internal_string( $top_bar_title_output );
				} ?>
			</div>
		</div>
		<?php
	}

	private function build_layout_render_attribute(): void {
		$layout_classnames = 'e-contact-buttons';
		$custom_classes = $this->settings['advanced_custom_css_classes'] ?? '';

		if ( $custom_classes ) {
			$layout_classnames .= ' ' . $custom_classes;
		}

		$this->widget->add_render_attribute( 'layout', [
			'class' => $layout_classnames,
			'id'    => $this->settings['advanced_custom_css_id'],
		] );
	}
}