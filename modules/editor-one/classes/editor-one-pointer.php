<?php
namespace Elementor\Modules\EditorOne\Classes;

use Elementor\Core\Upgrade\Manager as Upgrade_Manager;
use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Pointer {

	const CURRENT_POINTER_SLUG = 'e-editor-one-new-home';

	public function __construct() {
		add_action( 'admin_print_footer_scripts-index.php', [ $this, 'admin_print_script' ] );
	}

	public function admin_print_script() {
		if ( ! $this->is_admin_user() || $this->is_dismissed() || $this->is_new_installation() ) {
			return;
		}

		wp_enqueue_script( 'wp-pointer' );
		wp_enqueue_style( 'wp-pointer' );

		$pointer_content = '<h3>' . esc_html__( 'The Editor has a new home', 'elementor' ) . '</h3>';
		$pointer_content .= '<p>' . esc_html__( 'Editor tools are now grouped together for quick access. Build and grow your site with everything you need in one place.', 'elementor' ) . '</p>';

		$got_it_url = admin_url( 'admin.php?page=elementor' );
		$pointer_content .= sprintf(
			'<p><a class="button button-primary" href="%s" onclick="jQuery(this).closest(\'.wp-pointer\').pointer(\'close\'); setTimeout(function(){window.location.href=\'%s\';}, 100); return false;">%s</a> <button class="button" onclick="jQuery(this).closest(\'.wp-pointer\').pointer(\'close\');">%s</button></p>',
			esc_url( $got_it_url ),
			esc_js( $got_it_url ),
			esc_html__( 'Got it', 'elementor' ),
			esc_html__( 'Dismiss', 'elementor' )
		);

		?>
		<script>
			jQuery( document ).ready( function( $ ) {
				setTimeout( function () {
					$( '#toplevel_page_elementor' ).pointer( {
						content: '<?php echo $pointer_content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>',
						position: {
							edge: <?php echo is_rtl() ? "'right'" : "'left'"; ?>,
							align: 'center'
						},
						pointerWidth: 360,
						close: function () {
							elementorCommon.ajax.addRequest( 'introduction_viewed', {
								data: {
									introductionKey: '<?php echo esc_attr( self::CURRENT_POINTER_SLUG ); ?>',
								},
							} );
						}
					} ).pointer( 'open' );
				}, 10 );
			} );
		</script>
		<?php
	}

	private function is_dismissed() {
		return User::get_introduction_meta( self::CURRENT_POINTER_SLUG );
	}

	private function is_new_installation() {
		return Upgrade_Manager::is_new_installation();
	}

	private function is_admin_user() {
		return current_user_can( 'manage_options' );
	}
}
