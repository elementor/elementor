<?php

namespace Elementor\App\Modules\Onboarding;

use Elementor\Includes\EditorAssetsAPI;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Account_Screen_Assets {

	const TRANSIENT_KEY = '_elementor_onboarding_account_screen_assets';

	public static function get_editor_config(): ?array {
		$defaults = self::get_defaults();
		$assets = self::get_raw_assets_data();

		if ( empty( $assets['is_active'] ) ) {
			return null;
		}

		return [
			'headlineLine1' => self::read_string( $assets, 'headline_line1', $defaults['headlineLine1'] ),
			'headlineLine2' => self::read_string( $assets, 'headline_line2', $defaults['headlineLine2'] ),
			'description' => self::read_string( $assets, 'description', $defaults['description'] ),
			'showDescription' => self::read_bool( $assets, 'show_description', $defaults['showDescription'] ),
			'benefits' => [
				self::read_string( $assets, 'benefit_1', $defaults['benefits'][0] ),
				self::read_string( $assets, 'benefit_2', $defaults['benefits'][1] ),
				self::read_string( $assets, 'benefit_3', $defaults['benefits'][2] ),
			],
			'showBenefits' => [
				self::read_bool( $assets, 'show_benefit_1', $defaults['showBenefits'][0] ),
				self::read_bool( $assets, 'show_benefit_2', $defaults['showBenefits'][1] ),
				self::read_bool( $assets, 'show_benefit_3', $defaults['showBenefits'][2] ),
			],
			'illustrationUrl' => self::read_illustration_url( $assets, $defaults['illustrationUrl'] ),
			'showIllustration' => self::read_bool( $assets, 'show_illustration', $defaults['showIllustration'] ),
			'primaryCtaLabel' => self::read_string( $assets, 'primary_cta_label', $defaults['primaryCtaLabel'] ),
			'existingAccountPrefix' => self::read_string( $assets, 'existing_account_prefix', $defaults['existingAccountPrefix'] ),
			'existingAccountLinkText' => self::read_string( $assets, 'existing_account_link_text', $defaults['existingAccountLinkText'] ),
			'showExistingAccount' => self::read_bool( $assets, 'show_existing_account', $defaults['showExistingAccount'] ),
			'skipCtaLabel' => self::read_string( $assets, 'skip_cta_label', $defaults['skipCtaLabel'] ),
		];
	}

	private static function get_raw_assets_data(): array {
		$api = new EditorAssetsAPI( [
			EditorAssetsAPI::ASSETS_DATA_TRANSIENT_KEY => self::TRANSIENT_KEY,
			EditorAssetsAPI::ASSETS_DATA_URL => EditorAssetsAPI::PRODUCTION_URL . '/onboarding/v1/account-screen.json',
			EditorAssetsAPI::ASSETS_DATA_KEY => 'account-screen',
		] );

		$assets = $api->get_assets_data();

		return apply_filters( 'elementor/onboarding/account_screen_assets', is_array( $assets ) ? $assets : [] );
	}

	private static function get_defaults(): array {
		return [
			'headlineLine1' => __( 'You\'re here!', 'elementor' ),
			'headlineLine2' => __( 'Let\'s get connected.', 'elementor' ),
			'description' => __( 'To get the most of Elementor, we\'ll connect your account.', 'elementor' ) . ' ' . __( 'Then you can:', 'elementor' ),
			'showDescription' => true,
			'benefits' => [
				__( 'Access dozens of professionally designed templates', 'elementor' ),
				__( 'Manage all your sites from the My Elementor dashboard', 'elementor' ),
				__( 'Unlock tools that streamline your workflow and site setup', 'elementor' ),
			],
			'showBenefits' => [ true, true, true ],
			'illustrationUrl' => '',
			'showIllustration' => true,
			'primaryCtaLabel' => __( 'Start setup', 'elementor' ),
			'existingAccountPrefix' => __( 'Already have an account?', 'elementor' ),
			'existingAccountLinkText' => __( 'Click here to connect', 'elementor' ),
			'showExistingAccount' => true,
			'skipCtaLabel' => __( 'Skip setup', 'elementor' ),
		];
	}

	private static function read_string( array $assets, string $key, string $fallback ): string {
		if ( ! isset( $assets[ $key ] ) || ! is_string( $assets[ $key ] ) || '' === trim( $assets[ $key ] ) ) {
			return $fallback;
		}

		return $assets[ $key ];
	}

	private static function read_bool( array $assets, string $key, bool $fallback ): bool {
		if ( ! array_key_exists( $key, $assets ) ) {
			return $fallback;
		}

		return (bool) $assets[ $key ];
	}

	private static function read_illustration_url( array $assets, string $fallback ): string {
		if ( empty( $assets['illustration_url'] ) || ! is_string( $assets['illustration_url'] ) ) {
			return $fallback;
		}

		$url = trim( $assets['illustration_url'] );

		if ( ! EditorAssetsAPI::is_allowed_url( $url ) ) {
			return $fallback;
		}

		return esc_url_raw( $url );
	}
}
