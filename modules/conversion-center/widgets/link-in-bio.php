<?php

namespace Elementor\Modules\ConversionCenter\Widgets;

use Elementor\Modules\ConversionCenter\Base\Widget_Link_In_Bio_Base;
use Elementor\Modules\ConversionCenter\Classes\Render\Core_Render;
use Elementor\Modules\ConversionCenter\Module as ConversionCenterModule;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Elementor Link in Bio widget.
 *
 * Elementor widget that displays an image, a bio, up to 4 CTA links and up to 5 icons.
 *
 * @since 3.23.0
 */
class Link_In_Bio extends Widget_Link_In_Bio_Base {

	public function get_name(): string {
		return 'link-in-bio';
	}

	public function get_title(): string {
		return esc_html__( 'Link In Bio', 'elementor' );
	}

	public function get_icon(): string {
		return 'eicon-bullet-list';
	}

	public function get_categories(): array {
		return [ 'general' ];
	}

	public function get_keywords(): array {
		return [ 'buttons', 'bio', 'widget' ];
	}

	public function show_in_panel(): bool {
		return Plugin::$instance->experiments->is_feature_active( ConversionCenterModule::EXPERIMENT_NAME );
	}

	public function get_stack( $with_common_controls = true ): array {
		return parent::get_stack( false );
	}

	protected function register_controls(): void {

		$this->add_identity_section();

		$this->add_bio_section();

		$this->add_icons_controls();

		$this->add_cta_controls();

		$this->add_style_tab();

		$this->add_advanced_tab();
	}

	protected function render(): void {
		$render_strategy = new Core_Render( $this );

		$render_strategy->render();
	}
}
