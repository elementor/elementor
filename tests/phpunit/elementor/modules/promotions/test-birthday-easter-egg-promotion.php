<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Promotions;

use Elementor\Modules\Promotions\Widgets\Birthday_Easter_Egg_Promotion;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Testable_Birthday_Easter_Egg_Promotion extends Birthday_Easter_Egg_Promotion {
	public function __construct( array $data = [], ?array $lottie_data = null ) {
		$this->set_test_state( $data, $lottie_data );
	}

	public function set_test_state( array $data, ?array $lottie_data ): void {
		$reflection = new \ReflectionClass( Birthday_Easter_Egg_Promotion::class );

		$data_prop = $reflection->getProperty( 'data' );
		$data_prop->setAccessible( true );
		$data_prop->setValue( $this, $data );

		$lottie_prop = $reflection->getProperty( 'lottie_data' );
		$lottie_prop->setAccessible( true );
		$lottie_prop->setValue( $this, $lottie_data );
	}

	public function call_private( string $method, array $args = [] ) {
		$reflection = new \ReflectionMethod( Birthday_Easter_Egg_Promotion::class, $method );
		$reflection->setAccessible( true );

		return $reflection->invokeArgs( $this, $args );
	}
}

class Test_Birthday_Easter_Egg_Promotion extends Elementor_Test_Base {
	private const VALID_DATA = [
		'header' => 'Happy Birthday',
		'content' => 'Celebrate with us',
		'hero' => 'https://example.test/hero.png',
		'cta' => [
			'label' => 'Learn more',
			'url' => 'https://example.test/cta',
		],
		'time_frame' => [
			'start' => '2026-06-15T00:00:00Z',
			'end' => '2026-06-17T23:59:59Z',
		],
		'lottie' => 'https://example.test/lottie.json',
	];

	private const VALID_LOTTIE = [ 'v' => '5.7.0', 'layers' => [] ];

	public function test_has_valid_assets__returns_true_with_full_payload_and_lottie() {
		$promotion = new Testable_Birthday_Easter_Egg_Promotion( self::VALID_DATA, self::VALID_LOTTIE );

		$this->assertTrue( $promotion->call_private( 'has_valid_assets' ) );
	}

	public function test_has_valid_assets__returns_false_when_data_is_empty() {
		$promotion = new Testable_Birthday_Easter_Egg_Promotion( [], self::VALID_LOTTIE );

		$this->assertFalse( $promotion->call_private( 'has_valid_assets' ) );
	}

	public function test_has_valid_assets__returns_false_when_lottie_data_is_null() {
		$promotion = new Testable_Birthday_Easter_Egg_Promotion( self::VALID_DATA, null );

		$this->assertFalse( $promotion->call_private( 'has_valid_assets' ) );
	}

	public function test_has_valid_assets__returns_false_when_nested_cta_keys_are_missing() {
		$data = self::VALID_DATA;
		unset( $data['cta']['url'] );

		$promotion = new Testable_Birthday_Easter_Egg_Promotion( $data, self::VALID_LOTTIE );

		$this->assertFalse( $promotion->call_private( 'has_valid_assets' ) );
	}

	public function test_has_valid_assets__returns_false_when_time_frame_end_is_missing() {
		$data = self::VALID_DATA;
		unset( $data['time_frame']['end'] );

		$promotion = new Testable_Birthday_Easter_Egg_Promotion( $data, self::VALID_LOTTIE );

		$this->assertFalse( $promotion->call_private( 'has_valid_assets' ) );
	}

	public function test_has_visited_cta__returns_true_only_for_strict_string_one() {
		$user_id = self::factory()->user->create( [ 'role' => 'editor' ] );
		wp_set_current_user( $user_id );

		$promotion = new Testable_Birthday_Easter_Egg_Promotion();

		update_user_meta( $user_id, Birthday_Easter_Egg_Promotion::CTA_VISITED_KEY, 1 );
		$this->assertTrue( $promotion->call_private( 'has_visited_cta' ) );

		update_user_meta( $user_id, Birthday_Easter_Egg_Promotion::CTA_VISITED_KEY, 0 );
		$this->assertFalse( $promotion->call_private( 'has_visited_cta' ) );

		delete_user_meta( $user_id, Birthday_Easter_Egg_Promotion::CTA_VISITED_KEY );
		$this->assertFalse( $promotion->call_private( 'has_visited_cta' ) );
	}

	public function test_ajax_set_cta_visited__persists_true_as_one() {
		$user_id = self::factory()->user->create( [ 'role' => 'editor' ] );
		wp_set_current_user( $user_id );

		$promotion = new Testable_Birthday_Easter_Egg_Promotion();
		$response = $promotion->call_private(
			'ajax_set_cta_visited',
			[ [ Birthday_Easter_Egg_Promotion::VISITED_PARAM => true ] ]
		);

		$this->assertSame( [ Birthday_Easter_Egg_Promotion::VISITED_PARAM => true ], $response );
		$this->assertSame( '1', get_user_meta( $user_id, Birthday_Easter_Egg_Promotion::CTA_VISITED_KEY, true ) );
	}

	public function test_ajax_set_cta_visited__persists_false_as_zero() {
		$user_id = self::factory()->user->create( [ 'role' => 'editor' ] );
		wp_set_current_user( $user_id );

		$promotion = new Testable_Birthday_Easter_Egg_Promotion();
		$response = $promotion->call_private(
			'ajax_set_cta_visited',
			[ [ Birthday_Easter_Egg_Promotion::VISITED_PARAM => false ] ]
		);

		$this->assertSame( [ Birthday_Easter_Egg_Promotion::VISITED_PARAM => false ], $response );
		$this->assertSame( '0', get_user_meta( $user_id, Birthday_Easter_Egg_Promotion::CTA_VISITED_KEY, true ) );
	}

	public function test_ajax_set_cta_visited__coerces_string_booleans() {
		$user_id = self::factory()->user->create( [ 'role' => 'editor' ] );
		wp_set_current_user( $user_id );

		$promotion = new Testable_Birthday_Easter_Egg_Promotion();

		$response = $promotion->call_private(
			'ajax_set_cta_visited',
			[ [ Birthday_Easter_Egg_Promotion::VISITED_PARAM => 'true' ] ]
		);
		$this->assertTrue( $response[ Birthday_Easter_Egg_Promotion::VISITED_PARAM ] );

		$response = $promotion->call_private(
			'ajax_set_cta_visited',
			[ [ Birthday_Easter_Egg_Promotion::VISITED_PARAM => '0' ] ]
		);
		$this->assertFalse( $response[ Birthday_Easter_Egg_Promotion::VISITED_PARAM ] );
	}

	public function test_get_modal_config__returns_empty_array_when_assets_invalid() {
		$promotion = new Testable_Birthday_Easter_Egg_Promotion( [], null );

		$this->assertSame( [], $promotion->call_private( 'get_modal_config' ) );
	}

	public function test_get_modal_config__returns_payload_when_assets_valid() {
		$promotion = new Testable_Birthday_Easter_Egg_Promotion( self::VALID_DATA, self::VALID_LOTTIE );

		$config = $promotion->call_private( 'get_modal_config' );

		$this->assertSame( self::VALID_DATA['header'], $config['header'] );
		$this->assertSame( self::VALID_DATA['content'], $config['content'] );
		$this->assertSame( self::VALID_DATA['hero'], $config['hero'] );
		$this->assertSame( self::VALID_DATA['cta'], $config['cta'] );
		$this->assertSame( self::VALID_LOTTIE, $config['lottie'] );
	}
}
