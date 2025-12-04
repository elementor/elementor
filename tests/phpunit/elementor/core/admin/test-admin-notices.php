<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Admin;

use Elementor\Core\Admin\Admin_Notices;
use Elementor\Core\Admin\Notices\Base_Notice;
use Elementor\Core\Upgrade\Manager;
use Elementor\User;
use ElementorEditorTesting\Elementor_Test_Base;
use ReflectionClass;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Admin_Notices extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		remove_all_actions('admin_notices');
	}

	public function tearDown(): void {
		delete_option( Manager::get_install_history_meta() );
		delete_option( 'elementor_local_google_fonts' );

		parent::tearDown();
	}

	public function test_admin_notices() {
		// Arrange
		$notice = $this->getMockBuilder( Base_Notice::class )
			->setMethods( [ 'should_print', 'get_config' ] )
			->getMock();

		$notice->method( 'should_print' )->willReturn( true );
		$notice->method( 'get_config' )->willReturn( [
			'id'          => 'test_id',
			'title'       => 'test title',
			'description' => 'test description',
		] );

		add_filter( 'elementor/core/admin/notices', function () use ( $notice ) {
			return [ $notice ];
		} );

		new Admin_Notices();

		// Act
		ob_start();

		do_action('admin_notices');

		$result = ob_get_clean();

		// Assert
		$this->assertMatchesRegularExpression( '/\<h3\>test title\<\/h3\>/', $result );
		$this->assertMatchesRegularExpression( '/\<p\>test description\<\/p\>/', $result );
		$this->assertMatchesRegularExpression( '/data-notice_id="test_id"/', $result );
	}

	public function test_admin_notices__should_not_print_if_should_print_returns_false() {
		// Arrange
		$notice = $this->getMockBuilder( Base_Notice::class )
			->setMethods( [ 'should_print', 'get_config' ] )
			->getMock();

		$notice->method( 'should_print' )->willReturn( false );

		$notice->method( 'get_config' )->willReturn( [ 'id' => 'test_id' ] );

		add_filter( 'elementor/core/admin/notices', function () use ( $notice ) {
			return [ $notice ];
		} );

		new Admin_Notices();

		// Act
		ob_start();

		do_action('admin_notices');

		$result = ob_get_clean();

		// Assert
		$this->assertEmpty( $result );
	}

	public function test_local_google_fonts_notice_prints_for_legacy_installs() {
		$admin_notices = $this->create_testable_admin_notices();
		$this->set_admin_environment( $admin_notices );

		update_option( Manager::get_install_history_meta(), [
			'3.30.0' => time(),
		] );
		update_option( 'elementor_local_google_fonts', '0' );
		delete_user_meta( get_current_user_id(), User::ADMIN_NOTICES_KEY );

		$result = $this->invoke_local_google_fonts_notice( $admin_notices );

		$this->assertTrue( $result );
		$this->assertNotEmpty( $admin_notices->printed_notices );
		$this->assertSame(
			Admin_Notices::LOCAL_GOOGLE_FONTS_DISABLED_NOTICE_ID,
			$admin_notices->printed_notices[0]['id']
		);
	}

	public function test_local_google_fonts_notice_skipped_for_recent_installs() {
		$admin_notices = $this->create_testable_admin_notices();
		$this->set_admin_environment( $admin_notices );

		update_option( Manager::get_install_history_meta(), [
			Admin_Notices::LOCAL_GOOGLE_FONTS_NOTICE_MIN_VERSION => time(),
		] );
		update_option( 'elementor_local_google_fonts', '0' );
		delete_user_meta( get_current_user_id(), User::ADMIN_NOTICES_KEY );

		$result = $this->invoke_local_google_fonts_notice( $admin_notices );

		$this->assertFalse( $result );
		$this->assertEmpty( $admin_notices->printed_notices );
	}

	private function create_testable_admin_notices(): Admin_Notices_Testable {
		return new Admin_Notices_Testable();
	}

	private function invoke_local_google_fonts_notice( Admin_Notices_Testable $admin_notices ): bool {
		$reflection = new ReflectionClass( Admin_Notices::class );
		$method = $reflection->getMethod( 'notice_local_google_fonts_disabled' );
		$method->setAccessible( true );

		return (bool) $method->invoke( $admin_notices );
	}

	private function set_admin_environment( Admin_Notices_Testable $admin_notices ): void {
		$user_id = self::factory()->user->create( [
			'role' => 'administrator',
		] );

		wp_set_current_user( $user_id );
		set_current_screen( 'toplevel_page_elementor' );

		$reflection = new ReflectionClass( Admin_Notices::class );
		$property = $reflection->getProperty( 'current_screen_id' );
		$property->setAccessible( true );
		$property->setValue( $admin_notices, 'toplevel_page_elementor' );
	}
}

class Admin_Notices_Testable extends Admin_Notices {
	public array $printed_notices = [];

	public function print_admin_notice( array $options, $exclude_pages = self::DEFAULT_EXCLUDED_PAGES ) {
		$this->printed_notices[] = $options;
	}
}
