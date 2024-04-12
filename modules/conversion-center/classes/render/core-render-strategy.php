<?php

namespace Elementor\Modules\ConversionCenter\Classes\Render;
use Elementor\Utils;

class Core_Render_Strategy extends Base_Render_Strategy {

	public function render( \Elementor\Modules\ConversionCenter\Widgets\Link_In_Bio $widget ) {
		$settings = $widget->get_settings_for_display();

		/**
		 * Map args to internals
		 */

		//  Heading
		$heading_output = '';
		$heading_props_tag = $settings['heading_tag'] ?? 'h1';
		$heading_value = $settings['heading'] ?? '';

		//  Title
		$title_output = '';
		$title_props_tag = $settings['title_tag'] ?? 'h2';
		$title_value = $settings['title'] ?? '';

		//  Description
		$description_output = '';
		$description_value = $settings['description'] ?? '';

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
		$has_description = ! empty( $description_value );
		$has_heading = ! empty( $heading_value );
		$has_icons = ! empty( $icons_value );
		$has_title = ! empty( $title_value );

		// Render conditions
		if ( ! $has_heading ) {
			return;
		}
		?>
			<style>
				.elementor-widget-link-in-bio {
					--align-self: center;
				}
				.elementor-widget-link-in-bio .elementor-widget-container {
					border: 1px solid blue;
					margin-inline: auto;
					max-width: 100%;
					padding: 2em;
					width: 100%;
				}
				.elementor-link-in-bio-content-container {
					display: flex;
					flex-direction: column;
					gap: 1em;
					margin-inline: auto;
					text-align: center;
				}
				.elementor-link-in-bio-content-container * {
					word-wrap: break-word;
				}
				.elementor-link-in-bio-identity img.elementor-link-in-bio-identity-image {
					aspect-ratio: 1;
					border: 1px solid blue;
					border-radius: 50%;
					display: block;
					object-fit: cover;
					margin-inline: auto;
					max-width: 100%;
					width: 150px;
				}
				.elementor-link-in-bio-icons {
					display: flex;
					gap: 1em;
					justify-content: center;
				}
				.elementor-link-in-bio-icon {
					aspect-ratio: 1;
					display: flex;
					width: 2em;
				}
				a.elementor-link-in-bio-icon-link {
					color: inherit;
					display: flex;
					flex: 1 0 auto;
				}
				a.elementor-link-in-bio-icon-link:where(:hover, :focus, :active) {
					color: inherit;
				}
				.elementor-link-in-bio-icon-link svg {
					aspect-ratio: 1;
				}
				.elementor-link-in-bio-ctas {
					display: flex;
					flex-direction: column;
					gap: 1em;
				}
				a.elementor-link-in-bio-cta {
					border-radius: 1em;
					background: blue;
					color: white;
					display: block;
					padding: 1em;
				}
				a.elementor-link-in-bio-cta:where(:hover, :focus, :active) {
					color: white;
				}
			</style>
			<div class="elementor-link-in-bio-content-container">
				<figure class="elementor-link-in-bio-identity">
					<img class="elementor-link-in-bio-identity-image" src="https://doodleipsum.com/700/avatar?bg=6392D9" alt="" />
				</figure>
				<?php if ( $has_heading || $has_title || $has_description ) : ?>
					<div class="elementor-link-in-bio-content">
						<?php if ( $has_heading ) {
							$widget->add_render_attribute( 'heading', 'class', 'elementor-link-in-bio-heading' );
							$heading_output = sprintf( '<%1$s %2$s>%3$s</%1$s>',  Utils::validate_html_tag( $heading_props_tag ), $widget->get_render_attribute_string( 'heading' ), $heading_value );
							// echo ( $heading_output );
							Utils::print_unescaped_internal_string( $heading_output );
						}?>
						<?php if ( $has_title ) {
							$widget->add_render_attribute( 'title', 'class', 'elementor-link-in-bio-title' );
							$title_output = sprintf( '<%1$s %2$s>%3$s</%1$s>',  Utils::validate_html_tag( $title_props_tag ), $widget->get_render_attribute_string( 'title' ), $title_value );
							// echo ( $title_output );
							Utils::print_unescaped_internal_string( $title_output );
						}?>
						<?php if ( $has_description ) {
							$widget->add_render_attribute( 'description', 'class', 'elementor-link-in-bio-description' );
							$description_output = sprintf( '<p %1$s>%2$s</p>', $widget->get_render_attribute_string( 'description' ), $description_value );
							// echo ( $description_output );
							Utils::print_unescaped_internal_string( $description_output );
						}?>
					</div>
				<?php endif; ?>
				<?php if ( $has_icons ) : ?>
					<div class="elementor-link-in-bio-icons">
						<?php
						foreach ( $icons_value as $key => $icon ) { ?>
							<div class="elementor-link-in-bio-icon">
								<a class="elementor-link-in-bio-icon-link" href="<?php echo esc_attr( $icon['link'] ) ?>">
									<?php Utils::print_unescaped_internal_string( $icon['svg'] ); ?>
								</a>
							</div>
						<?php } ?>
					</div>
				<?php endif; ?>
				<?php if ( $has_ctas ) : ?>
					<div class="elementor-link-in-bio-ctas">
						<?php
						foreach ( $ctas_value as $key => $cta ) { ?>
							<a class="elementor-link-in-bio-cta" href="<?php echo esc_attr( $cta['link'] ) ?>">
								<span class="elementor-link-in-bio-cta-text">
									<?php Utils::print_unescaped_internal_string( $cta['text'] ); ?>
								</span>
							</a>
						<?php } ?>
					</div>
				<?php endif; ?>
			</div>
		<?php
	}
}
