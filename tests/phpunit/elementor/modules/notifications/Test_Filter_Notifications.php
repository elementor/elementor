<?php

namespace elementor\tests\phpunit\elementor\modules\notifications;

use Elementor\Modules\Notifications\API;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;
use ReflectionClass;

class Test_Filter_Notifications extends PHPUnit_TestCase {
	public function test_notifications_filter_called_once() {
		$mock = $this->getMockBuilder( \stdClass::class )
			->addMethods( [ 'callback' ] )
			->getMock();

		$mock->expects( $this->once() )
			->method( 'callback' )
			->willReturnArgument( 0 );

		add_filter( 'elementor/core/admin/notifications', [ $mock, 'callback' ], 10, 1 );

		$mock_api = new ReflectionClass( API::class );
		$method = $mock_api->getMethod( 'get_notifications' );
		$method->setAccessible( true );
		$method->invokeArgs( null, [ true ] );
	}
}
