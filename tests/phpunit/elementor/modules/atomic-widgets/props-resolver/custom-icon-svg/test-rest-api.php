<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg;

use Elementor\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg\Rest_Api;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Rest_Api extends Elementor_Test_Base {
	public function test_get_svg__returns_truncated_flag_for_library_map() {
		add_filter( 'elementor/atomic-widgets/custom-icon-libraries/enabled', '__return_true' );

		$request = new \WP_REST_Request( 'GET', '/' . Rest_Api::API_NAMESPACE . '/' . Rest_Api::API_BASE );
		$request->set_param( 'library', 'missing-library' );

		$response = ( new Rest_Api() )->get_svg( $request );
		$data = $response->get_data();

		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( [], $data['data']['icons'] );
		$this->assertFalse( $data['data']['truncated'] );
		$this->assertSame( 0, $data['data']['total'] );
	}

	public function test_get_svg__requires_library() {
		$request = new \WP_REST_Request( 'GET', '/' . Rest_Api::API_NAMESPACE . '/' . Rest_Api::API_BASE );
		$request->set_param( 'library', '' );

		$response = ( new Rest_Api() )->get_svg( $request );

		$this->assertInstanceOf( \WP_Error::class, $response );
		$this->assertSame( 400, (int) $response->get_error_data()['status'] );
	}
}
