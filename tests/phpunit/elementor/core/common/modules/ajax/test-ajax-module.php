<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Common\Modules\Ajax;

use ElementorEditorTesting\Elementor_Test_AJAX;
use ElementorEditorTesting\Traits\Auth_Helpers;
use Elementor\Core\Common\Modules\Ajax\Module;
use Elementor\Plugin;

class Test_Ajax_Module extends Elementor_Test_AJAX {

	use Auth_Helpers;

	public function fill_ajax_params( array $params ) {

		foreach ( $params as $key => $value ) {

			$_POST[ $key ] = $value;
			$_GET[ $key ]  = $value;
		}

		$_REQUEST = array_merge( $_POST, $_GET );
	}

	/**
	 * Trick:
	 *
	 * The Plugin::$instance->common->get_component get the latest instance
	 * BUT
	 *
	 * With the following trick, we can find all instances of the ajax Module class created during the test process.
	 *
	 * @return \Generator
	 */
	public function find_ajax_module_instances() {

		global $wp_filter;

		foreach ( $wp_filter['wp_ajax_elementor_ajax']->callbacks as $callbacks ) {

			foreach ( $callbacks as $callback ) {

				if ( isset( $callback['function'][0] ) && $callback['function'][0] instanceof Module ) {

					yield $callback['function'][0];
				}
			}
		}
	}

	/***
	 * @param $tag
	 * @param $callable
	 *
	 * @return void
	 */
	public function register_ajax_action( $tag, $callable = null ) {

		if ( ! $callable ) {

			$callable = static function () {

				return 'correct-response';
			};
		}

		$this->setExpectedIncorrectUsage( sprintf( '%s::register_ajax_action', Module::class ) );

		/**
		 * Trick!
		 *
		 * Find all instances and bind the new action to them to prevent 'Action not found' Error.
		 */
		foreach ( $this->find_ajax_module_instances() as $instance ) {

			$instance->register_ajax_action( $tag, $callable );
		}
	}


	public function elementor_ajax_request( $elementor_action ) {

		// Make the request.
		try {

			$elementor_actions = [ $elementor_action => [ 'action' => $elementor_action ] ];
			$elementor_actions = json_encode( $elementor_actions );

			$this->fill_ajax_params( [
				'actions' => $elementor_actions,
				'_nonce'  => wp_create_nonce( Module::NONCE_KEY ),
			] );

			$this->_handleAjax( 'elementor_ajax' );

		} catch ( \WPAjaxDieContinueException $error ) {

			unset( $error );
		} catch ( \WPAjaxDieStopException $error ) {
			unset( $error );
		}

		$response_all = json_decode( $this->_last_response, true );

		return $response_all['data']['responses'][ $elementor_action ] ?? $response_all;
	}

	/**
	 * If the ajax request does not include the 'data' parameter, the php undefined index error should not occur.
	 *
	 * @covers Module::handle_ajax_request()
	 */
	public function test_should_handle_undefined_data() {

		$this->act_as_admin();
		$this->register_ajax_action( 'sample_action' );

		$response = $this->elementor_ajax_request( 'sample_action' );
		$data     = $response['data'] ?? null;

		$this->assertEquals( 'correct-response', $data, 'Something wrong in ajax request: ' . $data );
	}
}
