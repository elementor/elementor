<?php

namespace Elementor\Modules\ConversionCenter\Classes\Render;

use Elementor\Modules\ConversionCenter\Widgets\Link_In_Bio;
use Elementor\Utils;

/**
 * Class Core_Render.
 *
 * This class handles the rendering of the Link In Bio widget for the core version.
 *
 * @since 3.23.0
 */
class Core_Render extends Render_Base {

	public function render( Link_In_Bio $widget ): void {
		?>
		<div class="e-link-in-bio">
			<div class="e-link-in-bio__content-container">

				<?php $this->add_identity_image( $widget ); ?>

				<?php $this->add_bio( $widget ); ?>

				<?php $this->add_icons( $widget ); ?>

				<?php $this->render_ctas( $widget ); ?>

			</div>
		</div>
		<?php
	}

	private function render_ctas( Link_In_Bio $widget ): void {
		$settings               = $widget->get_settings_for_display();
		$ctas_props_corners     = $settings['cta_links_corners'] ?? 'rounded';
		$ctas_props_show_border = $settings['cta_links_show_border'] ?? false;
		$ctas_props_type        = $settings['cta_links_type'] ?? 'button';
		$ctas_value             = $settings['cta_link'] ?? [];

		$has_ctas = ! empty( $ctas_value );
		if ( ! $has_ctas ) {
			return;
		}
		?>

		<div class="e-link-in-bio__ctas">
			<?php
			foreach ( $ctas_value as $key => $cta ) {
				// Bail if no text
				if ( empty( $cta['cta_link_text'] ) ) {
					break;
				}
				$formatted_link = $this->get_formatted_link_based_on_type_for_cta( $cta );

				// Bail if no link
				if ( empty( $formatted_link ) ) {
					break;
				}

				$ctas_classnames = "e-link-in-bio__cta has-type-{$ctas_props_type}";

				if ( $ctas_props_show_border ) {
					$ctas_classnames .= ' has-border';
				}

				if ( 'button' === $ctas_props_type && $ctas_props_show_border ) {
					$ctas_classnames .= " has-corners-{$ctas_props_corners}";
				}

				$widget->add_render_attribute( "cta-{$key}", [
					'class' => $ctas_classnames,
					'href'  => esc_url( $formatted_link ),
				] );

				if ( 'File Download' === $cta['cta_link_type'] ) {
					$widget->add_render_attribute( "cta-{$key}", [
						'download' => 'download',
					] );
				}
				?>
				<a <?php echo $widget->get_render_attribute_string( "cta-{$key}" ); ?>>
					<span class="e-link-in-bio__cta-text">
						<?php echo esc_html( $cta['cta_link_text'] ); ?>
					</span>
				</a>
			<?php } ?>
		</div>
		<?php
	}

	private function add_icons( Link_In_Bio $widget ): void {
		$settings = $widget->get_settings_for_display();

		$icons_props_size = $settings['icons_size'] ?? 'small';
		$icons_value      = $settings['icon'] ?? [];
		$has_icons        = ! empty( $icons_value );
		if ( ! $has_icons ) {
			return;
		}

		?>
		<div class="e-link-in-bio__icons">
			<?php
			foreach ( $icons_value as $key => $icon ) {
				// Bail if no icon
				if ( empty( $icon['icon_icon'] ) ) {
					break;
				}

				$formatted_link = $this->get_formatted_link_for_icon( $icon );

				// Bail if no link
				if ( empty( $formatted_link ) ) {
					break;
				}

				$widget->add_render_attribute( "icon-{$key}", [
					'class' => "e-link-in-bio__icon has-size-{$icons_props_size}",
				] );

				$widget->add_render_attribute( "icon-link-{$key}", [
					'aria-label' => $icon['icon_platform'],
					'class'      => 'e-link-in-bio__icon-link',
					'href'       => esc_url( $formatted_link ),
					'rel'        => 'noopener noreferrer',
					'target'     => '_blank',
				] );
				?>
				<div <?php echo $widget->get_render_attribute_string( "icon-{$key}" ); ?>>
					<a <?php echo $widget->get_render_attribute_string( "icon-link-{$key}" ); ?>>
						<?php \Elementor\Icons_Manager::render_icon( $icon['icon_icon'], [ 'aria-hidden' => 'true' ] ); ?>
					</a>
				</div>
			<?php } ?>
		</div>
		<?php
	}

	private function add_bio( Link_In_Bio $widget ): void {
		$settings = $widget->get_settings_for_display();

		$bio_heading_props_tag = $settings['bio_heading_tag'] ?? 'h2';
		$bio_heading_value     = $settings['bio_heading'] ?? '';

		$bio_title_props_tag = $settings['bio_title_tag'] ?? 'h2';
		$bio_title_value     = $settings['bio_title'] ?? '';

		$bio_description_value = $settings['bio_description'] ?? '';

		$has_bio_description = ! empty( $bio_description_value );
		$has_bio_heading     = ! empty( $bio_heading_value );
		$has_bio_title       = ! empty( $bio_title_value );

		if ( $has_bio_title || $has_bio_description || $has_bio_heading ) {
			?>
			<div class="e-link-in-bio__content">
				<?php if ( $has_bio_heading ) {
					$widget->add_render_attribute( 'heading', 'class', 'e-link-in-bio__heading' );
					$bio_heading_output = sprintf( '<%1$s %2$s>%3$s</%1$s>', Utils::validate_html_tag( $bio_heading_props_tag ), $widget->get_render_attribute_string( 'heading' ), $bio_heading_value );
					Utils::print_unescaped_internal_string( $bio_heading_output );
				} ?>
				<?php if ( $has_bio_title ) {
					$widget->add_render_attribute( 'title', 'class', 'e-link-in-bio__title' );
					$bio_title_output = sprintf( '<%1$s %2$s>%3$s</%1$s>', Utils::validate_html_tag( $bio_title_props_tag ), $widget->get_render_attribute_string( 'title' ), $bio_title_value );
					Utils::print_unescaped_internal_string( $bio_title_output );
				} ?>
				<?php if ( $has_bio_description ) {
					$widget->add_render_attribute( 'description', 'class', 'e-link-in-bio__description' );
					$bio_description_output = sprintf( '<p %1$s>%2$s</p>', $widget->get_render_attribute_string( 'description' ), $bio_description_value );
					Utils::print_unescaped_internal_string( $bio_description_output );
				} ?>
			</div>
			<?php
		}
	}

	private function add_identity_image( Link_In_Bio $widget ): void {
		$settings                                = $widget->get_settings_for_display();
		$identity_image_props_shape              = $settings['identity_image_shape'] ?? 'circle';
		$identity_image_props_style              = $settings['identity_image_style'] ?? 'profile';
		$identity_image_props_show_border        = $settings['identity_image_show_border'] ?? false;
		$identity_image_props_show_bottom_border = $settings['identity_image_show_bottom_border'] ?? false;
		$identity_image_value                    = $settings['identity_image'] ?? [];

		$has_identity_image = ! empty( $identity_image_value ) && ( ! empty( $identity_image_value['url'] || ! empty( $identity_image_value['id'] ) ) );

		if ( ! $has_identity_image ) {
			return;
		}

		$identity_image_classnames = "e-link-in-bio__identity-image e-link-in-bio__identity-image-{$identity_image_props_style}";
		if ( $identity_image_props_show_border || $identity_image_props_show_bottom_border ) {
			$identity_image_classnames .= ' has-border';
		}
		if ( $identity_image_props_show_border || $identity_image_props_show_bottom_border ) {
			$identity_image_classnames .= ' has-border';
		}
		if ( ! empty( $identity_image_props_shape ) && 'profile' === $identity_image_props_style ) {
			$identity_image_classnames .= " has-style-{$identity_image_props_shape}";
		}
		$widget->add_render_attribute( 'identity_image', [
			'class' => $identity_image_classnames,
		] );
		?>
		<div class="e-link-in-bio__identity">
			<div <?php echo $widget->get_render_attribute_string( 'identity_image' ); ?>>
				<?php if ( ! empty( $identity_image_value['id'] ) ) {
					echo wp_get_attachment_image( $identity_image_value['id'], 'medium', false, [
						'class' => 'e-link-in-bio__identity-image-el',
					] );
				} else {
					$widget->add_render_attribute( 'identity_image_src', [
						'alt'   => '',
						'class' => 'e-link-in-bio__identity-image-el',
						'src'   => esc_url( $identity_image_value['url'] ),
					] );
					?>
					<img <?php echo $widget->get_render_attribute_string( 'identity_image_src' ); ?> />
				<?php }; ?>
			</div>
		</div>
		<?php
	}

	private function get_formatted_link_based_on_type_for_cta( array $cta ): string {

		$formatted_link = $cta['cta_link_url']['url'] ?? '';

		// Ensure we clear the default link value if the matching type value is empty
		switch ( $cta['cta_link_type'] ) {
			case 'Email':
				$formatted_link = ! empty( $cta['cta_link_mail'] ) ? "mailto:{$cta['cta_link_mail']}" : '';
				break;
			case 'Telephone':
				$formatted_link = ! empty( $cta['cta_link_number'] ) ? "tel:{$cta['cta_link_number']}" : '';
				break;
			case 'Telegram':
				$formatted_link = ! empty( $cta['cta_link_number'] ) ? "https://telegram.me/{$cta['cta_link_number']}" : '';
				break;
			case 'Waze':
				$formatted_link = ! empty( $cta['cta_link_number'] ) ? "https://www.waze.com/ul?ll={$cta['cta_link_number']}&navigate=yes" : '';
				break;
			case 'WhatsApp':
				$formatted_link = ! empty( $cta['cta_link_number'] ) ? "https://wa.me/{$cta['cta_link_number']}" : '';
				break;
			case 'File Download':
				$formatted_link = ! empty( $cta['cta_link_file']['url'] ) ? $cta['cta_link_file']['url'] : '';
				break;
			default:
				break;
		}

		return $formatted_link;
	}

	private function get_formatted_link_for_icon( array $icon ): string {

		$formatted_link = $icon['icon_url']['url'] ?? '';

		// Ensure we clear the default link value if the matching type value is empty
		switch ( $icon['icon_platform'] ) {
			case 'Email':
				$formatted_link = ! empty( $icon['icon_mail'] ) ? "mailto:{$icon['icon_mail']}" : '';
				break;
			case 'Telephone':
				$formatted_link = ! empty( $icon['icon_number'] ) ? "tel:{$icon['icon_number']}" : '';
				break;
			case 'Telegram':
				$formatted_link = ! empty( $icon['icon_number'] ) ? "https://telegram.me/{$icon['icon_number']}" : '';
				break;
			case 'Waze':
				$formatted_link = ! empty( $icon['icon_number'] ) ? "https://www.waze.com/ul?ll={$icon['icon_number']}&navigate=yes" : '';
				break;
			case 'WhatsApp':
				$formatted_link = ! empty( $icon['icon_number'] ) ? "https://wa.me/{$icon['icon_number']}" : '';
				break;
		}

		return $formatted_link;
	}
}
