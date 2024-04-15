<?php

namespace Elementor\Modules\ConversionCenter\Classes\Render;
use Elementor\Utils;

class Core_Render_Strategy extends Base_Render_Strategy {

	public function render( \Elementor\Modules\ConversionCenter\Widgets\Link_In_Bio $widget ) {
		$settings = $widget->get_settings_for_display();

		/**
		 * Map args to internals
		 */

		//  Identity Image
		$identity_image = $settings['identity_image'] ?? [];

		//  Bio Heading
		$bio_heading_output = '';
		$bio_heading_props_tag = $settings['bio_heading_tag'] ?? 'h2';
		$bio_heading_value = $settings['bio_heading'] ?? '';

		//  Bio Title
		$bio_title_output = '';
		$bio_title_props_tag = $settings['bio_title_tag'] ?? 'h2';
		$bio_title_value = $settings['bio_title'] ?? '';

		//  Bio Description
		$bio_description_output = '';
		$bio_description_value = $settings['bio_description'] ?? '';

		// Icons
		$icons_value = $settings['icon'] ?? [];

		// CTAs
		$ctas_value = $settings['ctas'] ?? [
			[
				'email' => '',
				'file' => '',
				'link' => '#',
				'link_type' => 'url',
				'number' => '',
				'text' => 'Get Healthy',
			],
			[
				'email' => '',
				'file' => '',
				'link' => '#',
				'link_type' => 'url',
				'number' => '',
				'text' => 'Top 10 Recipes',
			],
			[
				'email' => '',
				'file' => '',
				'link' => '#',
				'link_type' => 'url',
				'number' => '',
				'text' => 'Meal Prep',
			],
			[
				'email' => '',
				'file' => '',
				'link' => '#',
				'link_type' => 'url',
				'number' => '',
				'text' => 'Healthy Living Resources',
			],
		];// TODO : remove when control exists

		/**
		 * Checks
		 */

		$has_ctas = ! empty( $ctas_value );
		$has_description = ! empty( $bio_description_value );
		$has_heading = ! empty( $bio_heading_value );
		$has_identity_image = ! empty( $identity_image ) && ( ! empty( $identity_image['url'] || ! empty( $identity_image['id'] ) ));
		$has_icons = ! empty( $icons_value );
		$has_title = ! empty( $bio_title_value );

		// Render conditions
		if ( ! $has_heading ) {
			return;
		}
		?>
			<div class="e-link-in-bio__content-container">
				<?php if ( $has_identity_image ) : ?>
					<figure class="e-link-in-bio__identity">
						<?php if ( ! empty( $identity_image['id'] ) ) {
							echo wp_get_attachment_image( $identity_image['id'], 'thumbnail', false, [
								'class' => 'e-link-in-bio__identity-image',
							] );
						} else {
							$widget->add_render_attribute( 'identity_image', [
								'alt' => '',
								'class' => 'e-link-in-bio__identity-image',
								'src' => esc_url( $identity_image['url'] ),
							]);
							?>
							<img <?php echo $widget->get_render_attribute_string( 'icon-link' ); ?> />
						<?php }; ?>
					</figure>
				<?php endif; ?>
				<?php if ( $has_heading || $has_title || $has_description ) : ?>
					<div class="e-link-in-bio__content">
						<?php if ( $has_heading ) {
							$widget->add_render_attribute( 'heading', 'class', 'e-link-in-bio__heading' );
							$bio_heading_output = sprintf( '<%1$s %2$s>%3$s</%1$s>',  Utils::validate_html_tag( $bio_heading_props_tag ), $widget->get_render_attribute_string( 'heading' ), $bio_heading_value );
							Utils::print_unescaped_internal_string( $bio_heading_output );
						}?>
						<?php if ( $has_title ) {
							$widget->add_render_attribute( 'title', 'class', 'e-link-in-bio__title' );
							$bio_title_output = sprintf( '<%1$s %2$s>%3$s</%1$s>',  Utils::validate_html_tag( $bio_title_props_tag ), $widget->get_render_attribute_string( 'title' ), $bio_title_value );
							Utils::print_unescaped_internal_string( $bio_title_output );
						}?>
						<?php if ( $has_description ) {
							$widget->add_render_attribute( 'description', 'class', 'e-link-in-bio__description' );
							$bio_description_output = sprintf( '<p %1$s>%2$s</p>', $widget->get_render_attribute_string( 'description' ), $bio_description_value );
							Utils::print_unescaped_internal_string( $bio_description_output );
						}?>
					</div>
				<?php endif; ?>
				<?php if ( $has_icons ) : ?>
					<div class="e-link-in-bio__icons">
						<?php
						foreach ( $icons_value as $key => $icon ) {
							// Bail if no icon
							if ( empty( $icon['icon_icon'] ) ) {
								return;
							}

							// Check for link format based on platform type
							$formatted_link = $icon['icon_url']['url'] ?? '';

							// Ensure we clear the default link value if the matching type value is empty
							switch ($icon['icon_platform']) {
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
								return;
							}

							$widget->add_render_attribute( "icon-link-{$key}", [
								'aria-label' => $icon['icon_platform'],
								'class' => 'e-link-in-bio__icon-link',
								'href' => esc_url( $formatted_link ),
							]);
							?>
							<div class="e-link-in-bio__icon">
								<a <?php echo $widget->get_render_attribute_string( "icon-link-{$key}" ); ?>>
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
							$widget->add_render_attribute( "cta-{$key}", [
								'class' => 'e-link-in-bio__cta',
								'href' => $cta['link'],
							]);
							?>
							<a <?php echo $widget->get_render_attribute_string( "cta-{$key}" ); ?>>
								<span class="e-link-in-bio__cta-text">
									<?php echo $cta['text']; ?>
								</span>
							</a>
						<?php } ?>
					</div>
				<?php endif; ?>
			</div>
		<?php
	}
}
