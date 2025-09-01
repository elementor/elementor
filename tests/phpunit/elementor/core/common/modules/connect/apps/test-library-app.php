<?php

use Elementor\Core\Common\Modules\Connect\Apps\Library;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;


class Test_Library_App extends Elementor_Test_Base {
	public function setUp(): void {
		parent::setUp();
	}

	public function test_localize_settings__user_id_is_present() {
		$test_user_id = '123456';

		$jwt_token = $this->createTestJwtToken( $test_user_id );

		$library_mock = $this->getMockBuilder( Library::class )
			->disableOriginalConstructor()
			->setMethods( [ 'get', 'is_connected' ] )
			->getMock();

		$library_mock->expects( $this->once() )
			->method( 'get' )
			->with( 'access_token' )
			->willReturn( $jwt_token );

		$library_mock->expects( $this->once() )
			->method('is_connected')
			->willReturn( true );

		Plugin::$instance->editor->set_edit_mode( false );

		$result = $library_mock->localize_settings( [] );

		$this->assertArrayHasKey( 'library_connect', $result );
		$this->assertTrue( $result[ 'library_connect' ][ 'is_connected' ] );
		$this->assertEquals ( $test_user_id, $result[ 'library_connect' ][ 'user_id' ] );
	}

	public function test_localize_settings__user_id_is_null() {
		$jwt_token = null;

		$library_mock = $this->getMockBuilder( Library::class )
			->disableOriginalConstructor()
			->setMethods( [ 'get', 'is_connected' ] )
			->getMock();

		$library_mock->expects( $this->once() )
			->method( 'get' )
			->with( 'access_token' )
			->willReturn( $jwt_token );

		$library_mock->expects( $this->once() )
			->method('is_connected')
			->willReturn( true );

		Plugin::$instance->editor->set_edit_mode( false );

		$result = $library_mock->localize_settings( [] );

		$this->assertArrayHasKey( 'library_connect', $result );
		$this->assertTrue( $result[ 'library_connect' ][ 'is_connected' ] );
		$this->assertEquals ( null, $result[ 'library_connect' ][ 'user_id' ] );
	}

	public function test_localize_settings__user_id_is_empty() {
		$jwt_token = '';

		$library_mock = $this->getMockBuilder( Library::class )
			->disableOriginalConstructor()
			->setMethods( [ 'get', 'is_connected' ] )
			->getMock();

		$library_mock->expects( $this->once() )
			->method( 'get' )
			->with( 'access_token' )
			->willReturn( $jwt_token );

		$library_mock->expects( $this->once() )
			->method('is_connected')
			->willReturn( true );

		Plugin::$instance->editor->set_edit_mode( false );

		$result = $library_mock->localize_settings( [] );

		$this->assertArrayHasKey( 'library_connect', $result );
		$this->assertTrue( $result[ 'library_connect' ][ 'is_connected' ] );
		$this->assertEquals ( null, $result[ 'library_connect' ][ 'user_id' ] );
	}

	private function createTestJwtToken( $user_id ) {
		$header = json_encode( [ 'alg' => 'HS256', 'typ' => 'JWT' ] );
		$payload = json_encode( [ 'sub' => $user_id, 'name' => 'Test User' ] );
		$header_encoded = str_replace( [ '+', '/', '=' ], [ '-', '_', '' ], base64_encode( $header ) );
		$payload_encoded = str_replace( [ '+', '/', '=' ], [ '-', '_', '' ], base64_encode( $payload ) );
		$signature = 'test_signature';

		return $header_encoded . '.' . $payload_encoded . '.' . $signature;
	}
}
