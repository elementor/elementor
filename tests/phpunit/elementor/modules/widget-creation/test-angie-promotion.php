<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WidgetCreation;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Upgrade\Manager as Upgrade_Manager;
use Elementor\Modules\ElementorCounter\Module as Elementor_Counter;
use Elementor\Modules\WidgetCreation\AngiePromotion;
use Elementor\Plugin;
use Elementor\User;
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
		delete_user_meta( get_current_user_id(), User::INTRODUCTION_KEY );
	}

	public function tear_down() {
		parent::tear_down();

		remove_all_filters( 'elementor/editor/localize_settings' );
		delete_option( AngiePromotion::ANGIE_GUIDE_AUTO_SHOWN_OPTION );
		delete_option( Experiments_Manager::OPTION_PREFIX . 'container' );
		delete_option( Experiments_Manager::OPTION_PREFIX . 'e_atomic_elements' );
		delete_user_meta( get_current_user_id(), User::INTRODUCTION_KEY );
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

	public function test_existing_site_container_inactive__auto_shows() {
		// Arrange — container inactive: Angie auto-shows immediately for existing sites
		$this->set_existing_installation();

		// Act
		AngiePromotion::init();
		$settings = apply_filters( 'elementor/editor/localize_settings', [] );

		// Assert
		$this->assertTrue( $settings['angie']['autoShow'] );
	}

	public function test_existing_site_container_inactive__option_is_marked_as_shown() {
		// Arrange
		$this->set_existing_installation();

		// Act
		AngiePromotion::init();
		apply_filters( 'elementor/editor/localize_settings', [] );

		// Assert
		$this->assertSame( 'yes', get_option( AngiePromotion::ANGIE_GUIDE_AUTO_SHOWN_OPTION ) );
	}

	public function test_existing_site_container_active_atomic_inactive_promo_not_dismissed__does_not_auto_show() {
		// Arrange — waits until user has seen or dismissed the atomic opt-in promo
		$this->set_existing_installation();
		$this->set_experiment( 'container' );
		$this->set_experiment( 'e_atomic_elements', Experiments_Manager::STATE_INACTIVE );

		// Act
		AngiePromotion::init();
		$settings = apply_filters( 'elementor/editor/localize_settings', [] );

		// Assert
		$this->assertArrayNotHasKey( 'autoShow', $settings['angie'] ?? [] );
	}

	public function test_existing_site_container_active_atomic_active__auto_shows() {
		// Arrange — atomic already opted in, no need to wait for the promo
		$this->set_existing_installation();
		$this->set_experiment( 'container' );
		$this->set_experiment( 'e_atomic_elements' );

		// Act
		AngiePromotion::init();
		$settings = apply_filters( 'elementor/editor/localize_settings', [] );

		// Assert
		$this->assertTrue( $settings['angie']['autoShow'] );
	}

	public function test_existing_site_container_active_atomic_inactive_promo_dismissed__auto_shows() {
		// Arrange — user dismissed the atomic promo, safe to show Angie
		$this->set_existing_installation();
		$this->set_experiment( 'container' );
		User::set_introduction_viewed( [ 'introductionKey' => 'atomic_elements_promo' ] );

		// Act
		AngiePromotion::init();
		$settings = apply_filters( 'elementor/editor/localize_settings', [] );

		// Assert
		$this->assertTrue( $settings['angie']['autoShow'] );
	}

	public function test_existing_site_already_shown__does_not_auto_show_again() {
		// Arrange
		$this->set_existing_installation();
		update_option( AngiePromotion::ANGIE_GUIDE_AUTO_SHOWN_OPTION, 'yes' );

		// Act
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

	private function set_experiment( string $name, string $state = Experiments_Manager::STATE_ACTIVE ): void {
		Plugin::$instance->experiments->set_feature_default_state( $name, $state );
	}
}
