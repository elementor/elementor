<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Admin;

use Elementor\Core\Admin\Admin_Notices;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Core\Admin\Notices\Base_Notice;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Admin_Notices extends Elementor_Test_Base {
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

		do_action( 'admin_notices' );

		$result = ob_get_clean();

		// Assert
		$this->assertRegExp( '/\<h3\>test title\<\/h3\>/', $result );
		$this->assertRegExp( '/\<p\>test description\<\/p\>/', $result );
		$this->assertRegExp( '/data-notice_id="test_id"/', $result );
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

		do_action( 'admin_notices' );

		$result = ob_get_clean();

		// Assert
		$this->assertEmpty( $result );
	}
}
