<?php
namespace Elementor\Core\Common\Modules\Connect\Apps;

use Elementor\Core\Common\Modules\Connect\Admin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Base_App {

	const OPTION_NAME_PREFIX = 'elementor_connect_';

	const SITE_URL = 'https://my.elementor.com/connect/v1';

	const API_URL = 'https://my.elementor.com/api/connect/v1';

	protected $data = [];

	/**
	 * @since 2.3.0
	 * @access public
	 * @abstract
	 */
	abstract public function render_admin_widget();

	/**
	 * @since 2.3.0
	 * @access protected
	 * @abstract
	 */
	abstract protected function get_slug();

	/**
	 * @since 2.3.0
	 * @access protected
	 * @abstract
	 */
	abstract protected function update_settings();

	/**
	 * @since 2.3.0
	 * @access public
	 * @static
	 */
	public static function get_class_name() {
		return get_called_class();
	}

	/**
	 * @since 2.3.0
	 * @access protected
	 */
	protected function get_option_name() {
		return static::OPTION_NAME_PREFIX . $this->get_slug();
	}

	/**
	 * @since 2.3.0
	 * @access public
	 */
	public function admin_notice() {
		$notices = $this->get( 'notices' );

		if ( ! $notices ) {
			return;
		}
		echo '<div id="message" class="updated notice is-dismissible"><p>';

		foreach ( $notices as $notice ) {
			echo wp_kses_post( sprintf( '<div class="%s"><p>%s</p></div>', $notice['type'], wpautop( $notice['content'] ) ) );
		}

		echo '</p><button type="button" class="notice-dismiss"><span class="screen-reader-text">' .
			__( 'Dismiss', 'elementor' ) .
			'</span></button></div>';

		$this->delete( 'notices' );
	}

	/**
	 * @since 2.3.0
	 * @access public
	 */
	public function action_authorize() {
		if ( $this->is_connected() ) {
			$this->redirect_to_admin_page();
			return;
		}

		$this->set_client_id();
		$this->set_request_state();

		wp_redirect( $this->get_remote_authorize_url() );
		die;
	}

	/**
	 * @since 2.3.0
	 * @access public
	 */
	public function action_get_token() {
		if ( $this->is_connected() ) {
			$this->redirect_to_admin_page();
		}

		if ( $_REQUEST['state'] !== $this->get( 'state' ) ) {
			$this->add_notice( 'Get Token: Invalid Request.', 'error' );
			$this->redirect_to_admin_page();
		}

		$response = $this->request( 'get_token', [
			'grant_type' => 'authorization_code',
			'code' => $_REQUEST['code'],
			'redirect_uri' => rawurlencode( $this->get_admin_url( 'get_token' ) ),
			'client_id' => $this->get( 'client_id' ),
		] );

		if ( is_wp_error( $response ) ) {
			$notice = 'Cannot Get Token:' . $response->get_error_message();
			$this->add_notice( $notice, 'error' );
			$this->redirect_to_admin_page();
		}

		$this->delete( 'state' );
		$this->set( (array) $response );

		$this->after_connect();

		// Add the notice *after* the method `after_connect`, so an app can redirect without the notice.
		$this->add_notice( __( 'Connected Successfully.', 'elementor' ) );

		$this->redirect_to_admin_page();
	}

	/**
	 * @since 2.3.0
	 * @access public
	 */
	public function action_disconnect() {
		if ( $this->is_connected() ) {
			$this->disconnect();
			$this->add_notice( __( 'Disconnected Successfully.', 'elementor' ) );
		}

		$this->redirect_to_admin_page();
	}

	/**
	 * @since 2.3.0
	 * @access public
	 */
	public function get_admin_url( $action, $params = [] ) {
		$params = [
			'app' => $this->get_slug(),
			'action' => $action,
			'nonce' => wp_create_nonce( $this->get_slug() . $action ),
		] + $params;

		return add_query_arg( $params, Admin::$url );
	}

	/**
	 * @since 2.3.0
	 * @access public
	 */
	public function is_connected() {
		return (bool) $this->get( 'access_token' );
	}

	/**
	 * @since 2.3.0
	 * @access protected
	 */
	protected function init() {}

	/**
	 * @since 2.3.0
	 * @access protected
	 */
	protected function init_data() {}

	/**
	 * @since 2.3.0
	 * @access protected
	 */
	protected function after_connect() {}

	/**
	 * @since 2.3.0
	 * @access public
	 */
	public function get( $key, $default = null ) {
		$this->init_data();

		return isset( $this->data[ $key ] ) ? $this->data[ $key ] : $default;
	}

	/**
	 * @since 2.3.0
	 * @access protected
	 */
	protected function set( $key, $value = null ) {
		$this->init_data();

		if ( is_array( $key ) ) {
			$this->data = array_replace_recursive( $this->data, $key );
		} else {
			$this->data[ $key ] = $value;
		}

		$this->update_settings();
	}

	/**
	 * @since 2.3.0
	 * @access protected
	 */
	protected function delete( $key = null ) {
		$this->init_data();

		if ( $key ) {
			unset( $this->data[ $key ] );
		} else {
			$this->data = [];
		}

		$this->update_settings();
	}

	/**
	 * @since 2.3.0
	 * @access protected
	 */
	protected function add( $key, $value, $default = '' ) {
		$new_value = $this->get( $key, $default );

		if ( is_array( $new_value ) ) {
			$new_value[] = $value;
		} elseif ( is_string( $new_value ) ) {
			$new_value .= $value;
		} elseif ( is_numeric( $new_value ) ) {
			$new_value += $value;
		}

		$this->set( $key, $new_value );
	}

	/**
	 * @since 2.3.0
	 * @access protected
	 */
	protected function add_notice( $content, $type = 'success' ) {
		$this->add( 'notices', compact( 'content', 'type' ), [] );
	}

	/**
	 * @since 2.3.0
	 * @access protected
	 */
	protected function request( $action, $request_body = [] ) {
		$request_body = [
			'app' => $this->get_slug(),
			'access_token' => $this->get( 'access_token' ),
			'client_id' => $this->get( 'client_id' ),
			'local_id' => get_current_user_id(),
			'site_key' => $this->get_site_key(),
			'home_url' => trailingslashit( home_url() ),
		] + $request_body;

		$headers = [];

		if ( $this->is_connected() ) {
			$headers['X-Elementor-Signature'] = hash_hmac( 'sha256', wp_json_encode( $request_body, JSON_NUMERIC_CHECK ), $this->get( 'access_token_secret' ) );
		}

		$response = wp_remote_post( $this->get_api_url() . '/' . $action, [
			'body' => $request_body,
			'headers' => $headers,
			'timeout' => 25,
		] );

		if ( is_wp_error( $response ) ) {
			wp_die( $response, [
				'back_link' => true,
			] );
		}

		$body = wp_remote_retrieve_body( $response );
		$response_code = (int) wp_remote_retrieve_response_code( $response );

		if ( ! $response_code ) {
			return new \WP_Error( 500, 'No Response' );

		}

		// Server sent a success message without content.
		if ( 'null' === $body ) {
			$body = true;
		}

		$body = json_decode( $body );

		if ( false === $body ) {
			return new \WP_Error( 422, 'Wrong Server Response' );
		}

		if ( 200 !== $response_code ) {
			$message = $body->message ? $body->message : wp_remote_retrieve_response_message( $response );
			$code = $body->code ? $body->code : $response_code;

			if ( 401 === $code ) {
				$this->delete();
				$this->action_authorize();
			}

			return new \WP_Error( $code, $message );
		}

		return $body;
	}

	/**
	 * @since 2.3.0
	 * @access protected
	 */
	protected function get_api_url() {
		return static::API_URL . '/' . $this->get_slug();
	}

	/**
	 * @since 2.3.0
	 * @access protected
	 */
	protected function get_remote_site_url() {
		return static::SITE_URL . '/' . $this->get_slug();
	}

	/**
	 * @since 2.3.0
	 * @access protected
	 */
	protected function get_remote_authorize_url() {
		$redirect_uri = $this->get_admin_url( 'get_token' );
		if ( ! empty( $_REQUEST['mode'] ) && 'popup' === $_REQUEST['mode'] ) {
			$redirect_uri = add_query_arg( 'mode', 'popup', $redirect_uri );
		}

		$url = add_query_arg( [
			'action' => 'authorize',
			'response_type' => 'code',
			'client_id' => $this->get( 'client_id' ),
			'auth_secret' => $this->get( 'auth_secret' ),
			'state' => $this->get( 'state' ),
			'redirect_uri' => rawurlencode( $redirect_uri ),
		], $this->get_remote_site_url() );

		return $url;
	}

	/**
	 * @since 2.3.0
	 * @access protected
	 */
	protected function redirect_to_admin_page( $url = '' ) {
		if ( ! $url ) {
			$url = Admin::$url;
		}

		if ( ! empty( $_REQUEST['mode'] ) && 'popup' === $_REQUEST['mode'] ) {
			$this->print_popup_close_script( $url );
		} else {
			wp_safe_redirect( $url );
			die;
		}
	}

	/**
	 * @since 2.3.0
	 * @access protected
	 */
	protected function set_client_id() {
		if ( $this->get( 'client_id' ) ) {
			return;
		}

		$response = $this->request( 'get_client_id' );

		if ( is_wp_error( $response ) ) {
			wp_die( $response, $response->get_error_message() );
		}

		$this->set( 'client_id', $response->client_id );
		$this->set( 'auth_secret', $response->auth_secret );
	}

	/**
	 * @since 2.3.0
	 * @access protected
	 */
	protected function set_request_state() {
		$this->set( 'state', wp_generate_password( 12, false ) );
	}

	/**
	 * @since 2.3.0
	 * @access protected
	 */
	protected function print_popup_close_script( $url ) {
		?>
		<script>
			if ( opener && opener !== window ) {
				opener.jQuery( 'body' ).trigger( 'elementorConnected' );
				window.close();
				opener.focus();
			} else {
				location = '<?php echo $url; ?>';
			}
		</script>
		<?php
		die;
	}

	/**
	 * @since 2.3.0
	 * @access protected
	 */
	protected function disconnect() {
		if ( $this->is_connected() ) {
			// Try update the server, but not needed to handle errors.
			$this->request( 'disconnect' );
		}

		$this->delete();
	}

	/**
	 * @since 2.3.0
	 * @access protected
	 */
	protected function get_site_key() {
		$site_key = get_option( 'elementor_connect_site_key' );

		if ( ! $site_key ) {
			$site_key = md5( uniqid( wp_generate_password() ) );
			update_option( 'elementor_connect_site_key', $site_key );
		}

		return $site_key;
	}

	/**
	 * @since 2.3.0
	 * @access public
	 */
	public function __construct() {
		add_action( 'admin_notices', [ $this, 'admin_notice' ] );

		/**
		 * Allow extended apps to customize the __construct without call parent::__construct.
		 */
		$this->init();
	}
}
