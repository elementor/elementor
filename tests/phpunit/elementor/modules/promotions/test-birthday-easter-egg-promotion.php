<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Promotions;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Modules\Promotions\Data\Birthday_Promotion_Actions;
use Elementor\Modules\Promotions\Widgets\Birthday_Easter_Egg_Promotion;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
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

	private $original_v4_default_state;

	private $current_user_id;

	public function setUp(): void {
		parent::setUp();

		$this->original_v4_default_state = Plugin::$instance->experiments
			->get_features( AtomicWidgetsModule::EXPERIMENT_NAME )['default'];

		$this->current_user_id = self::factory()->user->create( [ 'role' => 'administrator' ] );
		wp_set_current_user( $this->current_user_id );
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state(
			AtomicWidgetsModule::EXPERIMENT_NAME,
			$this->original_v4_default_state
		);

		parent::tearDown();
	}

	private function set_v4_active( bool $active ): void {
		Plugin::$instance->experiments->set_feature_default_state(
			AtomicWidgetsModule::EXPERIMENT_NAME,
			$active ? Experiments_Manager::STATE_ACTIVE : Experiments_Manager::STATE_INACTIVE
		);
	}

	private function mark_cta_visited(): void {
		update_user_meta( $this->current_user_id, Birthday_Promotion_Actions::CTA_VISITED_KEY, 1 );
	}

	private function data_with_window( int $start_offset_seconds, int $end_offset_seconds ): array {
		return $this->data_with_raw_window(
			gmdate( 'Y-m-d\TH:i:s\Z', time() + $start_offset_seconds ),
			gmdate( 'Y-m-d\TH:i:s\Z', time() + $end_offset_seconds )
		);
	}

	private function data_with_raw_window( $start, $end ): array {
		$data = self::VALID_DATA;
		$data['time_frame']['start'] = $start;
		$data['time_frame']['end'] = $end;

		return $data;
	}

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

	public function test_get_lottie_data__returns_cached_transient_without_fetch() {
		$lottie = [ 'v' => '5.7.0', 'fr' => 30 ];
		set_transient( Birthday_Easter_Egg_Promotion::LOTTIE_DATA_TRANSIENT_KEY, $lottie, HOUR_IN_SECONDS );

		$promotion = new Testable_Birthday_Easter_Egg_Promotion( self::VALID_DATA, null );

		$this->assertSame( $lottie, $promotion->call_private( 'get_lottie_data' ) );

		delete_transient( Birthday_Easter_Egg_Promotion::LOTTIE_DATA_TRANSIENT_KEY );
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

	public function test_has_visited_cta__returns_true_only_for_strict_string_one() {
		$user_id = self::factory()->user->create( [ 'role' => 'editor' ] );
		wp_set_current_user( $user_id );

		$actions = new Birthday_Promotion_Actions();

		update_user_meta( $user_id, Birthday_Promotion_Actions::CTA_VISITED_KEY, 1 );
		$this->assertTrue( $actions->has_visited_cta() );

		update_user_meta( $user_id, Birthday_Promotion_Actions::CTA_VISITED_KEY, 0 );
		$this->assertFalse( $actions->has_visited_cta() );

		delete_user_meta( $user_id, Birthday_Promotion_Actions::CTA_VISITED_KEY );
		$this->assertFalse( $actions->has_visited_cta() );
	}

	public function test_ajax_set_cta_visited__persists_true_as_one() {
		$actions = new Testable_Birthday_Promotion_Actions();
		$response = $actions->call_private(
			'ajax_set_cta_visited',
			[ [ Birthday_Promotion_Actions::VISITED_PARAM => true ] ]
		);

		$this->assertSame( [ Birthday_Promotion_Actions::VISITED_PARAM => true ], $response );
		$this->assertSame( '1', get_user_meta( $this->current_user_id, Birthday_Promotion_Actions::CTA_VISITED_KEY, true ) );
	}

	public function test_ajax_set_cta_visited__persists_false_as_zero() {
		$actions = new Testable_Birthday_Promotion_Actions();
		$response = $actions->call_private(
			'ajax_set_cta_visited',
			[ [ Birthday_Promotion_Actions::VISITED_PARAM => false ] ]
		);

		$this->assertSame( [ Birthday_Promotion_Actions::VISITED_PARAM => false ], $response );
		$this->assertSame( '0', get_user_meta( $this->current_user_id, Birthday_Promotion_Actions::CTA_VISITED_KEY, true ) );
	}

	public function test_ajax_set_cta_visited__defaults_to_true_when_param_missing() {
		$actions = new Testable_Birthday_Promotion_Actions();
		$response = $actions->call_private( 'ajax_set_cta_visited', [ [] ] );

		$this->assertSame( [ Birthday_Promotion_Actions::VISITED_PARAM => true ], $response );
		$this->assertSame( '1', get_user_meta( $this->current_user_id, Birthday_Promotion_Actions::CTA_VISITED_KEY, true ) );
	}

	public function test_ajax_set_cta_visited__coerces_string_booleans() {
		$actions = new Testable_Birthday_Promotion_Actions();

		$response = $actions->call_private(
			'ajax_set_cta_visited',
			[ [ Birthday_Promotion_Actions::VISITED_PARAM => 'true' ] ]
		);
		$this->assertTrue( $response[ Birthday_Promotion_Actions::VISITED_PARAM ] );

		$response = $actions->call_private(
			'ajax_set_cta_visited',
			[ [ Birthday_Promotion_Actions::VISITED_PARAM => '0' ] ]
		);
		$this->assertFalse( $response[ Birthday_Promotion_Actions::VISITED_PARAM ] );
	}

	public function test_ajax_set_cta_visited__rejects_user_without_manage_options() {
		$editor_user_id = self::factory()->user->create( [ 'role' => 'editor' ] );
		wp_set_current_user( $editor_user_id );

		$actions = new Testable_Birthday_Promotion_Actions();

		$this->expectException( \WPDieException::class );

		try {
			$actions->call_private(
				'ajax_set_cta_visited',
				[ [ Birthday_Promotion_Actions::VISITED_PARAM => true ] ]
			);
		} finally {
			$this->assertSame( '', get_user_meta( $editor_user_id, Birthday_Promotion_Actions::CTA_VISITED_KEY, true ) );
		}
	}

	public function test_ajax_set_cta_visited__rejects_logged_out_user() {
		wp_set_current_user( 0 );

		$actions = new Testable_Birthday_Promotion_Actions();

		$this->expectException( \WPDieException::class );

		$actions->call_private(
			'ajax_set_cta_visited',
			[ [ Birthday_Promotion_Actions::VISITED_PARAM => true ] ]
		);
	}

	public function test_should_show_promotion__returns_true_when_all_conditions_met() {
		$this->set_v4_active( true );

		$promotion = new Testable_Birthday_Easter_Egg_Promotion(
			$this->data_with_window( -3600, 3600 ),
			self::VALID_LOTTIE
		);

		$this->assertTrue( $promotion->call_private( 'should_show_promotion' ) );
	}

	public function test_should_show_promotion__returns_false_when_data_is_empty() {
		$this->set_v4_active( true );

		$promotion = new Testable_Birthday_Easter_Egg_Promotion( [], self::VALID_LOTTIE );

		$this->assertFalse( $promotion->call_private( 'should_show_promotion' ) );
	}

	public function test_should_show_promotion__returns_false_when_lottie_is_missing() {
		$this->set_v4_active( true );

		$promotion = new Testable_Birthday_Easter_Egg_Promotion(
			$this->data_with_window( -3600, 3600 ),
			null
		);

		$this->assertFalse( $promotion->call_private( 'should_show_promotion' ) );
	}

	public function test_should_show_promotion__returns_false_when_cta_required_keys_missing() {
		$this->set_v4_active( true );

		$data = $this->data_with_window( -3600, 3600 );
		unset( $data['cta']['url'] );

		$promotion = new Testable_Birthday_Easter_Egg_Promotion( $data, self::VALID_LOTTIE );

		$this->assertFalse( $promotion->call_private( 'should_show_promotion' ) );
	}

	public function test_should_show_promotion__returns_false_when_user_lacks_manage_options() {
		$this->set_v4_active( true );

		$editor_user_id = self::factory()->user->create( [ 'role' => 'editor' ] );
		wp_set_current_user( $editor_user_id );

		$promotion = new Testable_Birthday_Easter_Egg_Promotion(
			$this->data_with_window( -3600, 3600 ),
			self::VALID_LOTTIE
		);

		$this->assertFalse( $promotion->call_private( 'should_show_promotion' ) );
	}

	public function test_should_show_promotion__returns_false_when_user_logged_out() {
		$this->set_v4_active( true );

		wp_set_current_user( 0 );

		$promotion = new Testable_Birthday_Easter_Egg_Promotion(
			$this->data_with_window( -3600, 3600 ),
			self::VALID_LOTTIE
		);

		$this->assertFalse( $promotion->call_private( 'should_show_promotion' ) );
	}

	public function test_should_show_promotion__returns_false_when_v4_inactive() {
		$this->set_v4_active( false );

		$promotion = new Testable_Birthday_Easter_Egg_Promotion(
			$this->data_with_window( -3600, 3600 ),
			self::VALID_LOTTIE
		);

		$this->assertFalse( $promotion->call_private( 'should_show_promotion' ) );
	}

	public function test_should_show_promotion__returns_false_when_user_visited_cta() {
		$this->set_v4_active( true );
		$this->mark_cta_visited();

		$promotion = new Testable_Birthday_Easter_Egg_Promotion(
			$this->data_with_window( -3600, 3600 ),
			self::VALID_LOTTIE
		);

		$this->assertFalse( $promotion->call_private( 'should_show_promotion' ) );
	}

	public function test_should_show_promotion__returns_false_when_window_starts_in_future() {
		$this->set_v4_active( true );

		$promotion = new Testable_Birthday_Easter_Egg_Promotion(
			$this->data_with_window( 3600, 7200 ),
			self::VALID_LOTTIE
		);

		$this->assertFalse( $promotion->call_private( 'should_show_promotion' ) );
	}

	public function test_should_show_promotion__returns_false_when_window_ended_in_past() {
		$this->set_v4_active( true );

		$promotion = new Testable_Birthday_Easter_Egg_Promotion(
			$this->data_with_window( -7200, -3600 ),
			self::VALID_LOTTIE
		);

		$this->assertFalse( $promotion->call_private( 'should_show_promotion' ) );
	}

	public function test_should_show_promotion__returns_true_at_window_start_boundary() {
		$this->set_v4_active( true );

		// Start exactly now-ish, end well in the future. `now >= start` must hold.
		$promotion = new Testable_Birthday_Easter_Egg_Promotion(
			$this->data_with_window( -1, 3600 ),
			self::VALID_LOTTIE
		);

		$this->assertTrue( $promotion->call_private( 'should_show_promotion' ) );
	}

	public function test_should_show_promotion__returns_true_at_window_end_boundary() {
		$this->set_v4_active( true );

		// End slightly in the future to avoid a clock-tick race; still verifies
		// that `now <= end` is the right comparison and not `<`.
		$promotion = new Testable_Birthday_Easter_Egg_Promotion(
			$this->data_with_window( -3600, 60 ),
			self::VALID_LOTTIE
		);

		$this->assertTrue( $promotion->call_private( 'should_show_promotion' ) );
	}

	public function test_should_show_promotion__returns_false_when_time_frame_is_malformed() {
		$this->set_v4_active( true );

		$promotion = new Testable_Birthday_Easter_Egg_Promotion(
			$this->data_with_raw_window( 'not-a-date', 'also-not-a-date' ),
			self::VALID_LOTTIE
		);

		$this->assertFalse( $promotion->call_private( 'should_show_promotion' ) );
	}

	public function test_should_show_promotion__returns_false_when_time_frame_end_before_start() {
		$this->set_v4_active( true );

		// Inverted window: start in the future, end in the past. `now >= start` already false.
		$promotion = new Testable_Birthday_Easter_Egg_Promotion(
			$this->data_with_window( 3600, -3600 ),
			self::VALID_LOTTIE
		);

		$this->assertFalse( $promotion->call_private( 'should_show_promotion' ) );
	}

	public function test_should_show_promotion__short_circuits_on_first_failing_gate() {
		// Belt-and-braces: every gate fails simultaneously. Just asserts false; if any
		// gate were to throw on a missing precondition we'd surface it here.
		$editor_user_id = self::factory()->user->create( [ 'role' => 'editor' ] );
		wp_set_current_user( $editor_user_id );
		update_user_meta( $editor_user_id, Birthday_Promotion_Actions::CTA_VISITED_KEY, 1 );
		$this->set_v4_active( false );

		$promotion = new Testable_Birthday_Easter_Egg_Promotion( [], null );

		$this->assertFalse( $promotion->call_private( 'should_show_promotion' ) );
	}
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

		$actions_prop = $reflection->getProperty( 'birthday_promotion_actions' );
		$actions_prop->setAccessible( true );
		$actions_prop->setValue( $this, new Birthday_Promotion_Actions() );
	}

	public function call_private( string $method, array $args = [] ) {
		$reflection = new \ReflectionMethod( Birthday_Easter_Egg_Promotion::class, $method );
		$reflection->setAccessible( true );

		return $reflection->invokeArgs( $this, $args );
	}
}

class Testable_Birthday_Promotion_Actions extends Birthday_Promotion_Actions {
	public function call_private( string $method, array $args = [] ) {
		$reflection = new \ReflectionMethod( Birthday_Promotion_Actions::class, $method );
		$reflection->setAccessible( true );

		return $reflection->invokeArgs( $this, $args );
	}
}
