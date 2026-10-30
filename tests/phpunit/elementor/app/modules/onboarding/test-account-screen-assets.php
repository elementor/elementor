<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\Onboarding;

use Elementor\App\Modules\Onboarding\Account_Screen_Assets;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Account_Screen_Assets extends Elementor_Test_Base {

	public function tearDown(): void {
		remove_all_filters( 'elementor/onboarding/account_screen_assets' );

		parent::tearDown();
	}

	public function test_get_editor_config_uses_defaults_when_cdn_inactive(): void {
		add_filter(
			'elementor/onboarding/account_screen_assets',
			static function (): array {
				return [
					'is_active' => false,
					'headline_line1' => 'CDN headline',
				];
			}
		);

		$config = Account_Screen_Assets::get_editor_config();

		$this->assertSame( __( 'You\'re here!', 'elementor' ), $config['headlineLine1'] );
		$this->assertTrue( $config['showDescription'] );
		$this->assertSame( __( 'Start setup', 'elementor' ), $config['primaryCtaLabel'] );
	}

	public function test_get_editor_config_applies_cdn_copy_and_visibility(): void {
		add_filter(
			'elementor/onboarding/account_screen_assets',
			static function (): array {
				return [
					'is_active' => true,
					'headline_line1' => 'Custom headline',
					'headline_line2' => 'Custom subhead',
					'description' => 'Custom description',
					'show_description' => false,
					'benefit_1' => 'Benefit A',
					'show_benefit_1' => true,
					'benefit_2' => 'Benefit B',
					'show_benefit_2' => false,
					'benefit_3' => 'Benefit C',
					'show_benefit_3' => true,
					'show_illustration' => false,
					'primary_cta_label' => 'Go',
					'show_existing_account' => false,
					'skip_cta_label' => 'Skip for now',
				];
			}
		);

		$config = Account_Screen_Assets::get_editor_config();

		$this->assertSame( 'Custom headline', $config['headlineLine1'] );
		$this->assertSame( 'Custom subhead', $config['headlineLine2'] );
		$this->assertSame( 'Custom description', $config['description'] );
		$this->assertFalse( $config['showDescription'] );
		$this->assertSame( [ true, false, true ], $config['showBenefits'] );
		$this->assertFalse( $config['showIllustration'] );
		$this->assertSame( 'Go', $config['primaryCtaLabel'] );
		$this->assertFalse( $config['showExistingAccount'] );
		$this->assertSame( 'Skip for now', $config['skipCtaLabel'] );
	}

	public function test_get_editor_config_rejects_disallowed_illustration_url(): void {
		add_filter(
			'elementor/onboarding/account_screen_assets',
			static function (): array {
				return [
					'is_active' => true,
					'illustration_url' => 'https://evil.example/illustration.svg',
				];
			}
		);

		$config = Account_Screen_Assets::get_editor_config();

		$this->assertSame( '', $config['illustrationUrl'] );
	}

	public function test_get_editor_config_accepts_allowed_illustration_url(): void {
		$url = 'https://assets.elementor.com/onboarding/v1/images/custom.svg';

		add_filter(
			'elementor/onboarding/account_screen_assets',
			static function () use ( $url ): array {
				return [
					'is_active' => true,
					'illustration_url' => $url,
				];
			}
		);

		$config = Account_Screen_Assets::get_editor_config();

		$this->assertSame( $url, $config['illustrationUrl'] );
	}

	public function test_get_editor_config_falls_back_empty_benefit_strings(): void {
		add_filter(
			'elementor/onboarding/account_screen_assets',
			static function (): array {
				return [
					'is_active' => true,
					'benefit_1' => '   ',
				];
			}
		);

		$config = Account_Screen_Assets::get_editor_config();

		$this->assertSame(
			__( 'Access dozens of professionally designed templates', 'elementor' ),
			$config['benefits'][0]
		);
	}
}
