<?php

namespace Elementor\Modules\ConversionCenter\Classes\Render;

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
		$settings = $widget->get_settings_for_display();

		/**
		 * Map args to internals
		 */

		//  Identity Image
		$identity_image_props_style = $settings['identity_image_style'] ?? 'profile';
		$identity_image_value       = $settings['identity_image'] ?? [];

		//  Bio Heading
		$bio_heading_output    = '';
		$bio_heading_props_tag = $settings['bio_heading_tag'] ?? 'h2';
		$bio_heading_value     = $settings['bio_heading'] ?? '';

		//  Bio Title
		$bio_title_output    = '';
		$bio_title_props_tag = $settings['bio_title_tag'] ?? 'h2';
		$bio_title_value     = $settings['bio_title'] ?? '';

		//  Bio Description
		$bio_description_output = '';
		$bio_description_value  = $settings['bio_description'] ?? '';

		// Icons
		$icons_value = $settings['icon'] ?? [];

		// CTAs
		$ctas_value = $settings['cta_link'] ?? [];

		/**
		 * Checks
		 */

		$has_bio_description = ! empty( $bio_description_value );
		$has_bio_heading     = ! empty( $bio_heading_value );
		$has_bio_title       = ! empty( $bio_title_value );
		$has_ctas            = ! empty( $ctas_value );
		$has_icons           = ! empty( $icons_value );
		$has_identity_image  = ! empty( $identity_image_value ) && ( ! empty( $identity_image_value['url'] || ! empty( $identity_image_value['id'] ) ) );

		// Render conditions
		if ( ! $has_bio_heading ) {
			return;
		}
		?>
		<div class="e-link-in-bio__content-container">
			<?php if ( $has_identity_image ) :
				$widget->add_render_attribute( 'identity', [
					'class' => [ 'e-link-in-bio__identity', "e-link-in-bio__identity--{$identity_image_props_style}" ],
				] );
				?>
				<figure <?php echo esc_attr( $widget->get_render_attribute_string( 'identity' ) ); ?>>
					<?php if ( ! empty( $identity_image_value['id'] ) ) {
						echo wp_get_attachment_image( $identity_image_value['id'], 'medium', false, [
							'class' => 'e-link-in-bio__identity-image',
						] );
					} else {
						$widget->add_render_attribute( 'identity_image', [
							'alt'   => '',
							'class' => 'e-link-in-bio__identity-image',
							'src'   => esc_url( $identity_image_value['url'] ),
						] );
						?>
						<img <?php echo esc_attr( $widget->get_render_attribute_string( 'icon-link' ) ); ?> />
					<?php }; ?>
				</figure>
			<?php endif; ?>
			<?php if ( $has_bio_heading || $has_bio_title || $has_bio_description ) : ?>
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
			<?php endif; ?>
			<?php if ( $has_icons ) : ?>
				<div class="e-link-in-bio__icons">
					<?php
					foreach ( $icons_value as $key => $icon ) {
						// Bail if no icon
						if ( empty( $icon['icon_icon'] ) ) {
							break;
						}

						// Check for link format based on type
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

						// Bail if no link
						if ( empty( $formatted_link ) ) {
							break;
						}

						$widget->add_render_attribute( 'icon-link-' . $key, [
							'aria-label' => $icon['icon_platform'],
							'class'      => 'e-link-in-bio__icon-link',
							'href'       => esc_url( $formatted_link ),
							'rel'        => 'noopener noreferrer',
							'target'     => '_blank',
						] );
						?>
						<div class="e-link-in-bio__icon">
							<a <?php echo esc_attr( $widget->get_render_attribute_string( "icon-link-{$key}" ) ); ?>>
								<?php \Elementor\Icons_Manager::render_icon( $icon['icon_icon'], [ 'aria-hidden' => 'true' ] ); ?>
							</a>
						</div>
					<?php } ?>
				</div>
			<?php endif; ?>
			<?php if ( $has_ctas ) : ?>
				<div class="e-link-in-bio__ctas">
					<?php
					foreach ( $ctas_value as $key => $cta ) {
						// Bail if no text
						if ( empty( $cta['cta_link_text'] ) ) {
							break;
						}

						// Check for link format based on type
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
						}

						// Bail if no link
						if ( empty( $formatted_link ) ) {
							break;
						}

						$widget->add_render_attribute( "cta-{$key}", [
							'class' => 'e-link-in-bio__cta',
							'href'  => esc_url( $formatted_link ),
						] );

						if ( 'File Download' === $cta['cta_link_type'] ) {
							$widget->add_render_attribute( "cta-{$key}", [
								'download' => 'download',
							] );
						}
						?>
						<a <?php echo esc_attr( $widget->get_render_attribute_string( "cta-{$key}" ) ); ?>>
							<span class="e-link-in-bio__cta-text">
								<?php echo esc_html( $cta['cta_link_text'] ); ?>
							</span>
						</a>
					<?php } ?>
				</div>
			<?php endif; ?>
		</div>
		<?php
	}
}
