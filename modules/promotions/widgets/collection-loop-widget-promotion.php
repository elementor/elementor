<?php

namespace Elementor\Modules\Promotions\Widgets;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Collection_Loop_Widget_Promotion {

	private const LOOP_PROMOTION_IMAGE_URL = 'https://assets.elementor.com/packages/v1/images/Loop_grid_promotion.png';

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

		if ( ! isset( $settings['atomicWidgetPromotions'] ) ) {
			$settings['atomicWidgetPromotions'] = [];
		}

		$settings['atomicWidgetPromotions'][] = [
			'type' => 'collection-loop',
			'cardType' => 'widgetPromotion',
			'widgets' => $this->get_widgets(),
			'content' => $this->get_promotion_content(),
		];

		return $settings;
	}

	private function get_widgets(): array {
		return [
			[
				'name' => 'e-collection-loop',
				'title' => __( 'Loop', 'elementor' ),
				'icon' => 'eicon-loop-widget',
				'categories' => '["v4-elements"]',
			],
		];
	}

	private function get_promotion_content(): array {
		return [
			'title' => __( 'Loop', 'elementor' ),
			'content' => __( 'Upgrade to connect custom layouts directly to your site database, seamlessly rendering dynamic content queries that engage your site visitors.', 'elementor' ),
			'ctaText' => __( 'Upgrade now', 'elementor' ),
			'image' => self::LOOP_PROMOTION_IMAGE_URL,
			'widgetCtaUrl' => 'https://go.elementor.com/go-pro-loop-modal/',
			'sectionCtaUrl' => 'https://go.elementor.com/go-pro-loop-section/',
		];
	}
}
