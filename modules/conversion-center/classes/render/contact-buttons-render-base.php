<?php

namespace Elementor\Modules\ConversionCenter\Classes\Render;

use Elementor\Icons_Manager;
use Elementor\Modules\ConversionCenter\Classes\Providers\Social_Network_Provider;
use Elementor\Modules\ConversionCenter\Widgets\Contact_Buttons;

/**
 * Class Contact_Buttons_Render_Base.
 *
 * This is the base class that will hold shared functionality that will be needed by all the various widget versions.
 *
 * @since 3.23.0
 */
abstract class Contact_Buttons_Render_Base {

	protected Contact_Buttons $widget;

	protected array $settings;


	abstract public function render(): void;

	public function __construct( Contact_Buttons $widget ) {
		$this->widget   = $widget;
		$this->settings = $widget->get_settings_for_display();
	}

	protected function render_chat_button(): void {
		$platform = $this->settings['chat_button_platform'] ?? '';
		$display_dot = $this->settings['chat_button_show_dot'];
		$button_size = $this->settings['style_chat_button_size'];
		$hover_animation = $this->settings['style_button_color_hover_animation'];

		$button_classnames = 'e-contact-buttons__chat-button';

		if ( ! empty( $button_size ) ) {
			$button_classnames .= ' has-size-' . $button_size;
		}

		if ( ! empty( $hover_animation ) ) {
			$button_classnames .= ' elementor-animation-' . $hover_animation;
		}

		if ( 'yes' === $display_dot ) {
			$button_classnames .= ' has-dot';
		}

		$this->widget->add_render_attribute( 'button-', [
			'class' => $button_classnames,
		] );

		?>
		<div class="e-contact-buttons__chat-button-container">
			<button <?php echo $this->widget->get_render_attribute_string( 'button-' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> type="button" aria-label="<?php echo esc_attr__( 'Open Contact Buttons', 'elementor' ); ?>">
				<?php
				$mapping = Social_Network_Provider::get_icon_mapping( $platform );
				$icon_lib = explode( ' ', $mapping )[0];
				$library = 'fab' === $icon_lib ? 'fa-brands' : 'fa-solid';
				Icons_Manager::render_icon(
					[
						'library' => $library,
						'value' => $mapping,
					],
					[ 'aria-hidden' => 'true' ]
				);
				?>
			</button>
		</div>
		<?php
	}

	protected function render_top_bar(): void {
		$profile_image_value = $this->settings['top_bar_image'] ?? [];
		$has_profile_image = ! empty( $profile_image_value ) && ( ! empty( $profile_image_value['url'] || ! empty( $profile_image_value['id'] ) ) );
		$profile_image_size = $this->settings['style_top_bar_image_size'];
		$display_profile_dot = $this->settings['top_bar_show_dot'];

		$profile_image_classnames = 'e-contact-buttons__profile-image';

		if ( ! empty( $profile_image_size ) ) {
			$profile_image_classnames .= ' has-size-' . $profile_image_size;
		}

		if ( 'yes' === $display_profile_dot ) {
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
			<button type="button" class="e-contact-buttons__close-button" aria-label=<?php echo esc_attr__( 'Close Contact Buttons', 'elementor' ); ?>>
				<i class="eicon-close"></i>
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
				<?php if ( $has_top_bar_name ) { ?>
					<p class="e-contact-buttons__top-bar-name"><?php echo esc_html( $top_bar_name ); ?></p>
				<?php } ?>
				<?php if ( $has_top_bar_title ) { ?>
					<p class="e-contact-buttons__top-bar-title"><?php echo esc_html( $top_bar_title ); ?></p>
				<?php } ?>
			</div>
		</div>
		<?php
	}

	protected function render_message_bubble(): void {
		$message_bubble_name = $this->settings['message_bubble_name'] ?? '';
		$message_bubble_body = $this->settings['message_bubble_body'] ?? '';
		$has_message_bubble_name = ! empty( $message_bubble_name );
		$has_message_bubble_body = ! empty( $message_bubble_body );
		$has_typing_animation = 'yes' === $this->settings['chat_button_show_animation'];
		$time_format = $this->settings['chat_button_time_format'];
		$powered_by_url = 'https://elementor.com/pro';

		$message_bubble_classnames = 'e-contact-buttons__message-bubble';

		if ( $has_typing_animation ) {
			$message_bubble_classnames .= ' has-typing-animation';
		}

		$this->widget->add_render_attribute( 'message-bubble', [
			'class' => $message_bubble_classnames,
		] );
		?>
		<div <?php echo $this->widget->get_render_attribute_string( 'message-bubble' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<?php if ( $has_typing_animation ) { ?>
				<div class="e-contact-buttons__dots-container">
					<span class="e-contact-buttons__dot e-contact-buttons__dot-1"></span>
					<span class="e-contact-buttons__dot e-contact-buttons__dot-2"></span>
					<span class="e-contact-buttons__dot e-contact-buttons__dot-3"></span>
				</div>
			<?php } ?>
			<div class="e-contact-buttons__bubble-container">
				<div class="e-contact-buttons__bubble">
					<?php if ( $has_message_bubble_name ) { ?>
						<p class="e-contact-buttons__message-bubble-name"><?php echo esc_html( $message_bubble_name ); ?></p>
					<?php } ?>
					<?php if ( $has_message_bubble_body ) { ?>
						<p class="e-contact-buttons__message-bubble-body"><?php echo esc_html( $message_bubble_body ); ?></p>
					<?php } ?>
					<p class="e-contact-buttons__message-bubble-time" data-time-format="<?php echo esc_attr( $time_format ); ?>"></p>
				</div>
			</div>
			<div class="e-contact-buttons__powered-container">
				<a href="<?php esc_url( $powered_by_url ); ?>" class="e-contact-buttons__powered-text">
					<?php echo esc_attr__( 'Powered by Elementor', 'elementor' ); ?>
				</a>
			</div>
		</div>
		<?php
	}

	protected function render_send_button(): void {
		$platform = $this->settings['chat_button_platform'] ?? '';
		$send_button_text = $this->settings['send_button_text'];
		$hover_animation = $this->settings['style_send_hover_animation'];
		$cta_classnames = 'e-contact-buttons__send-cta';
		$formatted_link = $this->get_formatted_link_based_on_platform( $platform );

		if ( ! empty( $hover_animation ) ) {
			$cta_classnames .= ' elementor-animation-' . $hover_animation;
		}

		$this->widget->add_render_attribute( 'formatted-cta', [
			'class' => $cta_classnames,
			'href' => $formatted_link,
		] );

		?>
		<div class="e-contact-buttons__send-button">
			<div class="e-contact-buttons__send-button-container">
				<?php if ( $send_button_text ) { ?>
					<a <?php echo $this->widget->get_render_attribute_string( 'formatted-cta' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
						<?php
							$mapping = Social_Network_Provider::get_icon_mapping( $platform );
							$icon_lib = explode( ' ', $mapping )[0];
							$library = 'fab' === $icon_lib ? 'fa-brands' : 'fa-solid';
							Icons_Manager::render_icon(
								[
									'library' => $library,
									'value' => $mapping,
								],
								[ 'aria-hidden' => 'true' ]
							);
						?>
						<?php echo esc_html( $send_button_text ); ?>
					</a>
				<?php } ?>
			</div>
		</div>
		<?php
	}

	public function build_viber_link() {
		$chat_button_number = $this->settings['chat_button_number'];
		$viber_action = $this->settings['chat_button_viber_action'];

		if ( empty( $chat_button_number ) ) {
			return '';
		}

		$action = 'contact';

		if ( ! empty( $viber_action ) ) {
			$action = $viber_action;
		}

		return add_query_arg( [
			'number' => urlencode( $chat_button_number ),
		], 'viber://' . $action );
	}

	protected function get_formatted_link_based_on_platform( string $platform ): string {
		$chat_button_number = $this->settings['chat_button_number'] ?? '';
		$chat_button_username = $this->settings['chat_button_username'] ?? '';
		$platform_skype_username = $this->settings['chat_button_skype_username'] ?? '';

		$email_data = [
			'chat_button_mail' => $this->settings['chat_button_mail'] ?? '',
			'chat_button_mail_subject' => $this->settings['chat_button_mail_subject'] ?? '',
			'chat_button_mail_body' => $this->settings['chat_button_mail_body'] ?? '',
		];

		// Ensure we clear the default link value if the matching type value is empty
		switch ( $platform ) {
			case Social_Network_Provider::EMAIL:
				$formatted_link = Social_Network_Provider::build_email_link( $email_data, 'chat_button' );
				break;
			case Social_Network_Provider::SMS:
				$formatted_link = ! empty( $chat_button_number ) ? 'sms:' . $chat_button_number : '';
				break;
			case Social_Network_Provider::MESSENGER:
				$formatted_link = ! empty( $chat_button_username ) ?
					'https://www.facebook.com/messages/t/' . $chat_button_username :
					'';
				break;
			case Social_Network_Provider::WHATSAPP:
				$formatted_link = ! empty( $chat_button_number ) ? 'https://wa.me/' . $chat_button_number : '';
				break;
			case Social_Network_Provider::VIBER:
				$formatted_link = $this->build_viber_link();
				break;
			case Social_Network_Provider::SKYPE:
				$formatted_link = ! empty( $chat_button_username ) ? 'skype:' . $chat_button_username . '?chat' : '';
				break;
			default:
				break;
		}

		return $formatted_link;
	}

	protected function build_layout_render_attribute(): void {
		$layout_classnames = 'e-contact-buttons';
		$platform = $this->settings['chat_button_platform'];
		$border_radius = $this->settings['style_chat_box_corners'];
		$alignment_position = $this->settings['advanced_horizontal_position'];
		$has_animations = ! empty( $this->settings['style_chat_box_exit_animation'] ) || ! empty( $this->settings['style_chat_box_entrance_animation'] );
		$custom_classes = $this->settings['advanced_custom_css_classes'] ?? '';

		$icon_name_mapping = Social_Network_Provider::get_name_mapping( $platform );

		if ( ! empty( $platform ) ) {
			$layout_classnames .= ' has-platform-' . $icon_name_mapping;
		}

		if ( ! empty( $border_radius ) ) {
			$layout_classnames .= ' has-corners-' . $border_radius;
		}

		if ( ! empty( $alignment_position ) ) {
			$layout_classnames .= ' has-alignment-' . $alignment_position;
		}

		if ( $has_animations ) {
			$layout_classnames .= ' has-animations';
		}

		if ( $custom_classes ) {
			$layout_classnames .= ' ' . $custom_classes;
		}

		$this->widget->add_render_attribute( 'layout', [
			'class' => $layout_classnames,
			'id'    => $this->settings['advanced_custom_css_id'],
		] );
	}
}
