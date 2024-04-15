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
		$bio_heading_props_tag = $settings['bio_heading_tag'] ?? 'h1';
		$bio_heading_value = $settings['bio_heading'] ?? '';

		//  Bio Title
		$bio_title_output = '';
		$bio_title_props_tag = $settings['bio_title_tag'] ?? 'h2';
		$bio_title_value = $settings['bio_title'] ?? '';

		//  Bio Description
		$bio_description_output = '';
		$bio_description_value = $settings['bio_description'] ?? '';

		// Icons
		$icons_value = $settings['icons'] ?? [
			[
				'email' => 'test@test.com',
				'link' => '#',
				'number' => '',
				'svg' => '<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M9.6 8a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0Z" fill="currentColor"/></svg>',
			],
			[
				'email' => 'test@test.com',
				'link' => '#',
				'number' => '',
				'svg' => '<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M9.6 8a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0Z" fill="currentColor"/></svg>',
			],
			[
				'email' => 'test@test.com',
				'link' => '#',
				'number' => '',
				'svg' => '<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M9.6 8a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0Z" fill="currentColor"/></svg>',
			],
			[
				'email' => 'test@test.com',
				'link' => '#',
				'number' => '',
				'svg' => '<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M9.6 8a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0Z" fill="currentColor"/></svg>',
			],
		];// TODO : remove when control exists

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
							$widget->add_render_attribute( 'icon-link', [
								'class' => 'e-link-in-bio__icon-link',
								'href' => $icon['link'],
							]);
							?>
							<div class="e-link-in-bio__icon">
								<a <?php echo $widget->get_render_attribute_string( 'icon-link' ); ?>>
									<?php Utils::print_unescaped_internal_string( $icon['svg'] ); ?>
								</a>
							</div>
						<?php } ?>
					</div>
				<?php endif; ?>
				<?php if ( $has_ctas ) : ?>
					<div class="e-link-in-bio__ctas">
						<?php
						foreach ( $ctas_value as $key => $cta ) {
							$widget->add_render_attribute( 'cta', [
								'class' => 'e-link-in-bio__cta',
								'href' => $cta['link'],
							]);
							?>
							<a <?php echo $widget->get_render_attribute_string( 'cta' ); ?>>
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
