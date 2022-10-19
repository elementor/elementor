<?php
namespace Elementor\App\Services\Account;

use Elementor\Plugin;
use Elementor\App\Services\Service_Interface;

class Account_Service implements Service_Interface {
	/**
	 * @var mixed|string
	 */
	public $app;
	public $connect_app;
	public $connect;
	public $name;

	public function register() {
		if ( ! Plugin::$instance->common ) {
			return false;
		}

		$this->connect_app = Plugin::$instance->common->get_component( 'connect' );
		return $this;
	}

	/**
	 * @param string $app
	 * @return object
	 */
	public function get_subscription_plans( string $app = '' ) {
		return $this->connect_app->get_subscription_plans( $app );
	}

	/**
	 * @return bool
	 */
	public function is_connected( $app = 'library' ) : bool {
		return $this->connect_app->get_app( $app )->is_connected( $app );
	}

	/**
	 * @param $app
	 * @param $action
	 * @param $params
	 * @return mixed
	 */
	public function get_admin_url( $app, $action, $params ) {
		return $this->connect_app->get_app( $app )->get_admin_url( $action, $params );
	}

	public function name( $name ) {
		return $name;
	}
}
