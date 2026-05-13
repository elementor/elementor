<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WidgetCreation;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Upgrade\Manager as Upgrade_Manager;
use Elementor\Modules\ElementorCounter\Module as Elementor_Counter;
use Elementor\Modules\WidgetCreation\AngiePromotion;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Angie_Promotion extends Elementor_Test_Base {
	public function set_up() {
		parent::set_up();

		remove_all_filters( 'elementor/editor/localize_settings' );
		delete_option( AngiePromotion::ANGIE_GUIDE_AUTO_SHOWN_OPTION );
		Elementor_Counter::instance()->set_count( Elementor_Counter::EDITOR_COUNTER_KEY, 0 );
		delete_option( Upgrade_Manager::INSTALLS_HISTORY_META );
		delete_option( Experiments_Manager::OPTION_PREFIX . 'container' );
		delete_option( Experiments_Manager::OPTION_PREFIX . 'e_atomic_elements' );
	}

	public function tear_down() {
		parent::tear_down();

		remove_all_filters( 'elementor/editor/localize_settings' );
		delete_option( AngiePromotion::ANGIE_GUIDE_AUTO_SHOWN_OPTION );
		delete_option( Experiments_Manager::OPTION_PREFIX . 'container' );
		delete_option( Experiments_Manager::OPTION_PREFIX . 'e_atomic_elements' );
		delete_user_meta( get_current_user_id(), 'elementor_introduction' );
	}

	public function test_new_site_on_third_visit__sets_auto_show_true() {
		// Arrange
		$this->set_new_installation();
		Elementor_Counter::instance()->set_count( Elementor_Counter::EDITOR_COUNTER_KEY, 3 );

		// Act
		AngiePromotion::init();
		$settings = apply_filters( 'elementor/editor/localize_settings', [] );

		// Assert
		$this->assertTrue( $settings['angie']['autoShow'] );
	}

	public function test_new_site_on_third_visit__consumes_option_so_subsequent_load_does_not_auto_show() {
		// Arrange
		$this->set_new_installation();
		Elementor_Counter::instance()->set_count( Elementor_Counter::EDITOR_COUNTER_KEY, 3 );

		// Act — first load: triggers auto-show and marks option
		AngiePromotion::init();
		apply_filters( 'elementor/editor/localize_settings', [] );

		// Simulate next page load: remove and re-register filters
		remove_all_filters( 'elementor/editor/localize_settings' );
		AngiePromotion::init();
		$settings = apply_filters( 'elementor/editor/localize_settings', [] );

		// Assert
		$this->assertArrayNotHasKey( 'autoShow', $settings['angie'] ?? [] );
	}

	public function test_new_site_on_third_visit__option_is_marked_as_shown() {
		// Arrange
		$this->set_new_installation();
		Elementor_Counter::instance()->set_count( Elementor_Counter::EDITOR_COUNTER_KEY, 3 );

		// Act
		AngiePromotion::init();
		apply_filters( 'elementor/editor/localize_settings', [] );

		// Assert
		$this->assertSame( 'yes', get_option( AngiePromotion::ANGIE_GUIDE_AUTO_SHOWN_OPTION ) );
	}

	public function test_new_site_on_second_visit__does_not_auto_show() {
		// Arrange — visit #2 is when the checklist promo shows; Angie waits for the next session
		$this->set_new_installation();
		Elementor_Counter::instance()->set_count( Elementor_Counter::EDITOR_COUNTER_KEY, 2 );

		// Act
		AngiePromotion::init();
		$settings = apply_filters( 'elementor/editor/localize_settings', [] );

		// Assert
		$this->assertArrayNotHasKey( 'autoShow', $settings['angie'] ?? [] );
	}

	public function test_new_site_on_first_visit__does_not_auto_show() {
		// Arrange
		$this->set_new_installation();
		Elementor_Counter::instance()->set_count( Elementor_Counter::EDITOR_COUNTER_KEY, 1 );

		// Act
		AngiePromotion::init();
		$settings = apply_filters( 'elementor/editor/localize_settings', [] );

		// Assert
		$this->assertArrayNotHasKey( 'autoShow', $settings['angie'] ?? [] );
	}

	// — Case 2: existing site, V4 promo active —

	public function test_case2_v4_activated__sets_auto_show_true() {
		// Arrange — container active, atomic_elements active (user opted in to V4)
		$this->set_existing_installation();
		Elementor_Counter::instance()->set_count( Elementor_Counter::EDITOR_COUNTER_KEY, 5 );

		// Act
		AngiePromotion::init();
		$settings = apply_filters( 'elementor/editor/localize_settings', [] );

		// Assert
		$this->assertTrue( $settings['angie']['autoShow'] );
	}

	public function test_case2_v4_promo_dismissed__sets_auto_show_true() {
		// Arrange — container active, promo dismissed by user (not opted in, but dismissed)
		$this->set_existing_installation();
		$this->set_container_active();
		$this->set_promo_dismissed();

		// Act
		AngiePromotion::init();
		$settings = apply_filters( 'elementor/editor/localize_settings', [] );

		// Assert
		$this->assertTrue( $settings['angie']['autoShow'] );
	}

	public function test_case2_v4_promo_still_pending__does_not_auto_show() {
		// Arrange — container active but user has neither activated V4 nor dismissed the promo
		$this->set_existing_installation();
		$this->set_container_active();

		// Act
		AngiePromotion::init();
		$settings = apply_filters( 'elementor/editor/localize_settings', [] );

		// Assert
		$this->assertArrayNotHasKey( 'autoShow', $settings['angie'] ?? [] );
	}

	public function test_case2_v4_activated__consumes_option_so_subsequent_load_does_not_auto_show() {
		// Arrange
		$this->set_existing_installation();
		$this->set_container_active();
		$this->set_atomic_elements_active();

		// Act — first load triggers and marks the option
		AngiePromotion::init();
		apply_filters( 'elementor/editor/localize_settings', [] );

		// Simulate next page load
		remove_all_filters( 'elementor/editor/localize_settings' );
		AngiePromotion::init();
		$settings = apply_filters( 'elementor/editor/localize_settings', [] );

		// Assert
		$this->assertArrayNotHasKey( 'autoShow', $settings['angie'] ?? [] );
	}

	public function test_case2_v4_activated__option_is_marked_as_shown() {
		// Arrange
		$this->set_existing_installation();
		$this->set_container_active();
		$this->set_atomic_elements_active();

		// Act
		AngiePromotion::init();
		apply_filters( 'elementor/editor/localize_settings', [] );

		// Assert
		$this->assertSame( 'yes', get_option( AngiePromotion::ANGIE_GUIDE_AUTO_SHOWN_OPTION ) );
	}

	// — Case 3: existing site, V4 promo not in play —

	public function test_case3_no_container_experiment__sets_auto_show_true() {
		// Arrange — existing site, container never enabled (V4 promo was not relevant)
		$this->set_existing_installation();

		// Act
		AngiePromotion::init();
		$settings = apply_filters( 'elementor/editor/localize_settings', [] );

		// Assert
		$this->assertTrue( $settings['angie']['autoShow'] );
	}

	public function test_case3_no_container_experiment__consumes_option_so_subsequent_load_does_not_auto_show() {
		// Arrange
		$this->set_existing_installation();

		// Act — first load triggers and marks the option
		AngiePromotion::init();
		apply_filters( 'elementor/editor/localize_settings', [] );

		// Simulate next page load
		remove_all_filters( 'elementor/editor/localize_settings' );
		AngiePromotion::init();
		$settings = apply_filters( 'elementor/editor/localize_settings', [] );

		// Assert
		$this->assertArrayNotHasKey( 'autoShow', $settings['angie'] ?? [] );
	}

	public function test_already_shown__does_not_auto_show_again() {
		// Arrange
		$this->set_new_installation();
		Elementor_Counter::instance()->set_count( Elementor_Counter::EDITOR_COUNTER_KEY, 3 );
		update_option( AngiePromotion::ANGIE_GUIDE_AUTO_SHOWN_OPTION, 'yes' );

		// Act
		AngiePromotion::init();
		$settings = apply_filters( 'elementor/editor/localize_settings', [] );

		// Assert
		$this->assertArrayNotHasKey( 'autoShow', $settings['angie'] ?? [] );
	}

	public function test_existing_settings_are_preserved() {
		// Arrange
		$this->set_existing_installation();

		// Act
		AngiePromotion::init();
		$settings = apply_filters( 'elementor/editor/localize_settings', [ 'some_key' => 'some_value' ] );

		// Assert
		$this->assertSame( 'some_value', $settings['some_key'] );
	}

	// — helpers —

	private function set_new_installation(): void {
		delete_option( Upgrade_Manager::INSTALLS_HISTORY_META );
	}

	private function set_existing_installation(): void {
		update_option( Upgrade_Manager::INSTALLS_HISTORY_META, [ '3.0.0' => time() - 1000 ] );
	}

	private function set_container_active(): void {
		update_option( Experiments_Manager::OPTION_PREFIX . 'container', 'active' );
	}

	private function set_atomic_elements_active(): void {
		update_option( Experiments_Manager::OPTION_PREFIX . 'e_atomic_elements', 'active' );
	}

	private function set_promo_dismissed(): void {
		update_user_meta( get_current_user_id(), 'elementor_introduction', [ 'atomic_elements_promo' => true ] );
	}
}
