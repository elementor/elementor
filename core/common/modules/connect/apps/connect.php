<?php
namespace Elementor\Core\Common\Modules\Connect\Apps;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Connect extends Common_App {

	protected function get_slug() {
		return 'connect';
	}

	public function render_admin_widget() {
		if ( $this->is_connected() ) {
			$remote_user = $this->get( 'user' );
			$title = sprintf( __( 'Connected to Elementor as <strong>%s</strong>', 'elementor' ), $remote_user->email ) . get_avatar( $remote_user->email, 20, '' );
			$label = __( 'Disconnect', 'elementor' );
			$url = $this->get_admin_url( 'disconnect' );
			$attr = '';
		} else {
			$title = __( 'Connect to Elementor', 'elementor' );
			$label = __( 'Connect', 'elementor' );
			$url = $this->get_admin_url( 'authorize' );
			$attr = 'class="elementor-connect-button"';
		}

		echo '<h1>' . __( 'Connect', 'elementor' ) . '</h1>';

		echo sprintf( '%s <a %s href="%s">%s</a>', $title, $attr, esc_attr( $url ), esc_html( $label ) );
	}
}
