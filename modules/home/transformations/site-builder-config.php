<?php
namespace Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Abstract;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Site_Builder_Config extends Transformations_Abstract {

	const ASSETS_BASE_URL = 'https://assets.elementor.com/';

	const SITE_BUILDER_URL = '/wp-admin/admin.php?page=elementor-app#site-builder';

	const PLANNER_STEPS = [
		'INIT' => 0,
		'CHAT' => 1,
		'SITEMAP' => 2,
		'WIREFRAMES' => 3,
		'DEPLOYING' => 4,
		'DEPLOYED_TO_PLUGIN' => 6,
	];

	public function transform( array $home_screen_data ): array {
		$site_builder = Plugin::$instance->app->get_component( 'site-builder' );

		if ( ! $site_builder ) {
			unset( $home_screen_data['site_builder'] );
			return $home_screen_data;
		}

		$site_builder_config = $site_builder->get_config();

		if ( ! $site_builder_config ) {
			unset( $home_screen_data['site_builder'] );
			return $home_screen_data;
		}

		$step_config = isset( $home_screen_data['site_builder'] ) && is_array( $home_screen_data['site_builder'] )
			? $home_screen_data['site_builder']
			: [];

		$validated_step_config = $this->validate_and_sanitize_step_config( $step_config );

		$snapshot = $this->wordpress_adapter->get_option( 'elementor_site_builder_snapshot' );

		$home_screen_data['site_builder'] = array_merge( $site_builder_config, [
			'siteBuilderUrl' => self::SITE_BUILDER_URL,
			'previewImage1' => self::ASSETS_BASE_URL . 'home-screen/v1/images/site-planner-01.jpg',
			'previewImage2' => self::ASSETS_BASE_URL . 'home-screen/v1/images/site-planner-02.jpg',
			'bgImage' => self::ASSETS_BASE_URL . 'home-screen/v1/images/site-planner-bg.jpg',
			'plannerSteps' => self::PLANNER_STEPS,
			'stepConfig' => $validated_step_config,
			'site_builder_snapshot' => is_array( $snapshot ) ? $snapshot : [],
		] );

		return $home_screen_data;
	}

	private function validate_and_sanitize_step_config( array $step_config ): array {
		$validated = [];
		$valid_steps = array_values( self::PLANNER_STEPS );

		foreach ( $step_config as $step_key => $step_data ) {
			if ( ! is_numeric( $step_key ) || ! in_array( (int) $step_key, $valid_steps, true ) ) {
				continue;
			}

			if ( ! is_array( $step_data ) ) {
				continue;
			}

			$validated_step = [];

			if ( isset( $step_data['hasInput'] ) ) {
				$validated_step['hasInput'] = (bool) $step_data['hasInput'];
			}

			if ( isset( $step_data['title'] ) && is_string( $step_data['title'] ) ) {
				$sanitized_title = sanitize_text_field( $step_data['title'] );
				$validated_step['title'] = mb_substr( $sanitized_title, 0, 200 );
			}

			if ( isset( $step_data['buttonLabel'] ) && is_string( $step_data['buttonLabel'] ) ) {
				$sanitized_label = sanitize_text_field( $step_data['buttonLabel'] );
				$validated_step['buttonLabel'] = mb_substr( $sanitized_label, 0, 100 );
			}

			$has_input = $validated_step['hasInput'] ?? false;

			if ( $has_input && isset( $step_data['placeholder'] ) && is_string( $step_data['placeholder'] ) ) {
				$sanitized_placeholder = sanitize_text_field( $step_data['placeholder'] );
				$validated_step['placeholder'] = mb_substr( $sanitized_placeholder, 0, 200 );
			}

			if ( ! $has_input && isset( $step_data['text'] ) && is_string( $step_data['text'] ) ) {
				$sanitized_text = sanitize_text_field( $step_data['text'] );
				$validated_step['text'] = mb_substr( $sanitized_text, 0, 300 );
			}

			if ( ! empty( $validated_step ) ) {
				$validated[ $step_key ] = $validated_step;
			}
		}

		return $validated;
	}
}
