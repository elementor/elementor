<?php

namespace Elementor\Modules\Promotions\Widgets;

use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Form_Widget_Promotion {

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

		$settings['atomicFormPromotionWidgets'] = $this->get_widgets();
		$settings['atomicFormPromotion'] = $this->get_promotion_content();

		return $settings;
	}

	private function get_widgets(): array {
		return [
			[
				'name' => 'e-form',
				'title' => __( 'Form', 'elementor' ),
				'icon' => 'eicon-atomic-form',
				'categories' => '["atomic-form"]',
			],
			[
				'name' => 'e-form-input',
				'title' => __( 'Input', 'elementor' ),
				'icon' => 'eicon-atomic-input',
				'categories' => '["atomic-form"]',
			],
			[
				'name' => 'e-form-label',
				'title' => __( 'Label', 'elementor' ),
				'icon' => 'eicon-atomic-label',
				'categories' => '["atomic-form"]',
			],
			[
				'name' => 'e-form-textarea',
				'title' => __( 'Text area', 'elementor' ),
				'icon' => 'eicon-atomic-text-area',
				'categories' => '["atomic-form"]',
			],
			[
				'name' => 'e-form-submit-button',
				'title' => __( 'Submit button', 'elementor' ),
				'icon' => 'eicon-atomic-submit-button',
				'categories' => '["atomic-form"]',
			],
			[
				'name' => 'e-form-checkbox',
				'title' => __( 'Checkbox', 'elementor' ),
				'icon' => 'eicon-atomic-checkbox',
				'categories' => '["atomic-form"]',
			],
		];
	}

	private function get_promotion_content(): array {
		return [
			'title' => __( 'Atomic form', 'elementor' ),
			'content' => __( 'Design fully customized forms to capture leads without compromising on style.', 'elementor' ),
			'ctaText' => __( 'Upgrade now', 'elementor' ),
			'widgetCtaUrl' => 'https://go.elementor.com/go-pro-atomic-form-modal/',
			'sectionCtaUrl' => 'https://go.elementor.com/go-pro-atomic-form-section/',
		];
	}
}
