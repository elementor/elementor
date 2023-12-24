<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Admin;

use Elementor\Core\Admin\Admin_Notices;
use Elementor\Core\Admin\Notices\Base_Notice;
use Elementor\User;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Admin_Notices extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		remove_all_actions('admin_notices');
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

	public function test_design_notice_not_appearing_on_first_install_for_admin() {
		// Arrange
		$this->act_as_admin();

		$admin_notices_mock = $this->getMockBuilder( Admin_Notices::class )
			->setMethods( [ 'get_elementor_version' ] )
			->getMock();

		// Act
		update_option( 'elementor_install_history', [ '1.0.0' => time() ] );

		$admin_notices_mock->method('get_elementor_version')
			->willReturn('1.0.0');

		ob_start();
		do_action('admin_notices');
		$result = ob_get_clean();

		// Assert
		$this->assertEmpty( $result );
	}

	public function test_notice_not_appearing_on_second_install_for_author() {
		// Arrange
		$admin_notices_mock = $this->getMockBuilder( Admin_Notices::class )
			->setMethods( [ 'get_elementor_version' ] )
			->getMock();

		//Act
		update_option( 'elementor_install_history', [
			'1.0.0' => time(),
			'2.0.0' => time() + 1,
		] );

		$admin_notices_mock->method('get_elementor_version')
			->willReturn('2.0.0');

		ob_start();
		do_action('admin_notices');
		$result = ob_get_clean();

		//Assert
		$this->assertEmpty( $result );
	}

	public function test_notice_appearing_on_second_install_for_admin() {
		// Arrange
		$this->act_as_admin();

		$admin_notices_mock = $this->getMockBuilder( Admin_Notices::class )
			->setMethods( [ 'get_elementor_version' ] )
			->getMock();

		//Act
		update_option( 'elementor_install_history', [
			'1.0.0' => time(),
			'2.0.0' => time() + 1,
		] );

		$admin_notices_mock->method('get_elementor_version')
			->willReturn('2.0.0');

		ob_start();
		do_action('admin_notices');
		$result = ob_get_clean();

		//Assert
		$this->assertStringContainsString( 'The version was updated successfully!', $result );
	}

	public function test_notice_not_appearing_on_second_install_for_admin_if_viewed() {
		// Arrange
		$this->act_as_admin();

		$admin_notices_mock = $this->getMockBuilder( Admin_Notices::class )
			->setMethods( [ 'get_elementor_version' ] )
			->getMock();

		//Act
		update_option( 'elementor_install_history', [
			'1.0.0' => time(),
			'2.0.0' => time() + 1,
		] );

		$admin_notices_mock->method('get_elementor_version')
			->willReturn('2.0.0');

		ob_start();
		do_action('admin_notices');
		ob_get_clean();

		$notice_id = 'design_not_appearing';
		User::set_user_notice( $notice_id );

		ob_start();
		do_action('admin_notices');
		$result = ob_get_clean();

		//Assert
		$this->assertEmpty( $result );
	}

	public function test_notice_design_notice_appearing_on_third_install_for_admin_even_if_already_viewed() {
		// Arrange
		$this->act_as_admin();

		$admin_notices_mock = $this->getMockBuilder( Admin_Notices::class )
			->setMethods( [ 'get_elementor_version' ] )
			->getMock();

		//Act
		$notice_id = 'design_not_appearing';
		User::set_user_notice( $notice_id, true, [ 'version' => '2.0.0' ] );

		update_option( 'elementor_install_history', [
			'1.0.0' => time(),
			'2.0.0' => time() + 1,
			'3.0.0' => time() + 2,
		] );

		$admin_notices_mock->method('get_elementor_version')
			->willReturn('3.0.0');

		ob_start();
		do_action('admin_notices');
		$result = ob_get_clean();

		//Assert
		$this->assertStringContainsString( 'The version was updated successfully!', $result );
	}
}
