<?php

namespace Elementor\Modules\Promotions\Widgets;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Collection_Loop_Widget_Promotion {

	public function register(): void {
		add_filter( 'elementor/editor/localize_settings', [ $this, 'add_promotion_data' ] );
	}

	private function is_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( 'e_atomic_elements' );
	}

	public function add_promotion_data( array $settings ): array {
		if ( ! current_user_can( 'manage_options' ) || ! $this->is_active() ) {
			return $settings;
		}

		$settings['collectionLoopPromotionWidgets'] = $this->get_widgets();
		$settings['collectionLoopPromotion'] = $this->get_promotion_content();

		return $settings;
	}

	private function get_widgets(): array {
		return [
			[
				'name' => 'e-collection-loop',
				'title' => __( 'Collection Loop', 'elementor' ),
				'icon' => 'eicon-loop-builder',
				'categories' => '["v4-elements"]',
			],
		];
	}

	private function get_promotion_content(): array {
		return [
			'title' => __( 'Collection Loop', 'elementor' ),
			'content' => __( 'Display dynamic content in a repeating layout with full query control.', 'elementor' ),
			'ctaText' => __( 'Upgrade now', 'elementor' ),
			'widgetCtaUrl' => 'https://go.elementor.com/go-pro-collection-loop-modal/',
			'sectionCtaUrl' => 'https://go.elementor.com/go-pro-collection-loop-section/',
		];
	}
}
