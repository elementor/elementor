<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\ProSetupPromotion;

use Elementor\Modules\ProSetupPromotion\Dismissal;
use Elementor\Modules\ProSetupPromotion\Setup_State;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Setup_State extends Elementor_Test_Base {

	private int $admin_id;

	public function setUp(): void {
		parent::setUp();

		$this->admin_id = self::factory()->user->create( [ 'role' => 'administrator' ] );
		wp_set_current_user( $this->admin_id );

		add_filter(
			'elementor/pro_setup_promotion/editor_assets',
			static function (): array {
				return [ 'is_active' => true ];
			}
		);
	}

	public function tearDown(): void {
		delete_user_meta( $this->admin_id, Dismissal::USER_META_KEY );
		remove_all_filters( 'elementor/pro_setup_promotion/editor_assets' );
		remove_all_filters( 'elementor/pro_setup_promotion/setup_state' );

		parent::tearDown();
	}

	public function test_get_editor_config_returns_null_when_state_is_hidden(): void {
		add_filter(
			'elementor/pro_setup_promotion/setup_state',
			static function (): string {
				return Setup_State::STATE_HIDDEN;
			}
		);

		$this->assertNull( Setup_State::get_editor_config() );
	}

	public function test_get_editor_config_includes_state_when_not_hidden(): void {
		add_filter(
			'elementor/pro_setup_promotion/setup_state',
			static function (): string {
				return Setup_State::STATE_INSTALL;
			}
		);

		$config = Setup_State::get_editor_config();

		$this->assertIsArray( $config );
		$this->assertSame( Setup_State::STATE_INSTALL, $config['state'] );
		$this->assertSame( Dismissal::DISMISS_ID, $config['dismissId'] );
		$this->assertArrayHasKey( 'banner', $config );
		$this->assertArrayHasKey( 'popover', $config );
	}

	public function test_resolve_returns_hidden_during_dismissal_cooldown(): void {
		Dismissal::record_dismissal();

		$this->assertSame( Setup_State::STATE_HIDDEN, Setup_State::resolve() );
	}

	public function test_resolve_returns_hidden_when_cdn_inactive(): void {
		remove_all_filters( 'elementor/pro_setup_promotion/editor_assets' );
		add_filter(
			'elementor/pro_setup_promotion/editor_assets',
			static function (): array {
				return [ 'is_active' => false ];
			}
		);

		$this->assertSame( Setup_State::STATE_HIDDEN, Setup_State::resolve() );
	}
}
