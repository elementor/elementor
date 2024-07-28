<?php

namespace Elementor\Modules\FloatingButtons\Widgets;

use Elementor\Modules\FloatingButtons\Base\Widget_Floating_Bars_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Elementor Floating Bars Var 1 widget.
 *
 * Elementor widget that displays a banner with icon and link
 *
 * @since 3.23.0
 */
class Floating_Bars_Var_1 extends Widget_Floating_Bars_Base {

	public function get_name(): string {
		return 'floating-bars-var-1';
	}

	public function get_title(): string {
		return esc_html__( 'Floating Bar CTA', 'elementor' );
	}

	public function get_group_name(): string {
		return 'floating-bars';
	}

	public function content_template() {
		?>
		<#

		view.addInlineEditingAttributes( 'announcement_text', 'none' );
		view.addInlineEditingAttributes( 'cta_text', 'none' );
		const announcementIcon = elementor.helpers.renderIcon( view, settings['announcement_icon'], { 'aria-hidden': true }, 'i' , 'object' ) ?? '';
		const ctaIcon = elementor.helpers.renderIcon( view, settings['cta_icon'], { 'aria-hidden': true }, 'i' , 'object' ) ?? '';

		let layout_classnames = 'e-floating-bars';
		const vertical_position = settings['advanced_vertical_position'];
		const is_sticky = settings['advanced_toggle_sticky'] === 'yes';
		const has_close_button = settings['floating_bar_close_switch'] === 'yes';

		layout_classnames += ' has-vertical-position-' + vertical_position;

		if ( has_close_button ) {
			layout_classnames += ' has-close-button';
		}

		if ( is_sticky ) {
			layout_classnames += ' is-sticky';
		}

		view.addRenderAttribute(
			'layout',
			{
				'class': layout_classnames,
				'id': settings.advanced_custom_css_id,
				'data-document-id': settings.document_id,
				'role': 'alertdialog',
			}
		);

		let hoverAnimation = settings['style_cta_button_hover_animation'];
		let corners = settings['style_cta_button_corners'];
		let linkType = settings['style_cta_type'];
		let entranceAnimation = settings['style_cta_button_animation'];

		let ctaClassnames = 'e-floating-bars__cta-button';

		if (hoverAnimation) {
			ctaClassnames += ' elementor-animation-' + hoverAnimation;
		}

		if (corners) {
			ctaClassnames += ' has-corners-' + corners;
		}

		if (linkType) {
			ctaClassnames += ' is-type-' + linkType;
		}

		if (entranceAnimation && entranceAnimation !== 'none') {
			ctaClassnames += ' has-entrance-animation';
		}

		view.addRenderAttribute(
			'cta-button',
			{
				'class': ctaClassnames,
			}
		);

		view.addRenderAttribute(
			'announcement_text',
			{
				'class': 'e-floating-bars__announcement-text',

			}
		);

		view.addRenderAttribute(
			'cta_text',
			{
				'class': 'e-floating-bars__cta-text',

			}
		);
		#>
		<div {{{ view.getRenderAttributeString( 'layout' ) }}}>
			<p {{{ view.getRenderAttributeString( 'announcement_text' ) }}}>
				{{{ settings.announcement_text }}}
			</p>
			<span class="e-floating-bars__announcement-icon">{{{ announcementIcon.value }}}</span>
			<div class="e-floating-bars__cta-button-container">
				<a {{{ view.getRenderAttributeString( 'cta-button' ) }}}>
					<span class="e-floating-bars__cta-icon">{{{ ctaIcon.value }}}</span>
					<span {{{ view.getRenderAttributeString( 'cta_text' ) }}}>
						{{{ settings.cta_text }}}
					</span>
				</a>
			</div>
			<# if ( has_close_button ) { #>
				<button class="e-floating-bars__close-button" aria-label="Close Banner" type="button" aria-controls="e-floating-bars">
					<i class="eicon-editor-close"></i>
				</button>
			<# } #>
			<div class="e-floating-bars__overlay"></div>
		</div>

<?php
	}
}
