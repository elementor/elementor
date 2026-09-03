<?php

namespace Elementor\Modules\Promotions\Widgets;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Carousel\Carousel_Promotion;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Carousel_Widget_Promotion {

	public function register(): void {
		add_filter( 'elementor/editor/localize_settings', [ $this, 'add_promotion_data' ] );
	}

	private function is_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( 'e_atomic_elements' )
			&& Plugin::$instance->experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_CAROUSEL_PROMOTION );
	}

	public function add_promotion_data( array $settings ): array {
		if ( ! current_user_can( 'manage_options' ) || ! $this->is_active() ) {
			return $settings;
		}

		if ( ! isset( $settings['atomicWidgetPromotions'] ) ) {
			$settings['atomicWidgetPromotions'] = [];
		}

		$settings['atomicWidgetPromotions'][] = [
			'type' => 'atomic-carousel',
			'cardType' => 'atomic',
			'widgets' => $this->get_widgets(),
			'content' => $this->get_promotion_content(),
		];

		return $settings;
	}

	private function get_widgets(): array {
		return [
			[
				'name' => 'e-carousel',
				'title' => __( 'Carousel', 'elementor' ),
				'icon' => 'eicon-nested-carousel',
				'categories' => '["v4-elements"]',
			],
		];
	}

	private function get_promotion_content(): array {
		return [
			'title' => __( 'Carousel', 'elementor' ),
			'content' => __( 'Upgrade to build engaging slideshows with customizable slides, arrow navigation, pagination dots and autoplay controls.', 'elementor' ),
			'ctaText' => __( 'Upgrade now', 'elementor' ),
			'widgetCtaUrl' => Carousel_Promotion::MODAL_UPGRADE_URL,
			'sectionCtaUrl' => Carousel_Promotion::SECTION_UPGRADE_URL,
		];
	}
}
