<?php
namespace Elementor\Modules\EditorOne;

use Elementor\Core\Admin\Admin;
use Elementor\Core\Upgrade\Manager as Upgrade_Manager;
use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Pointer {

	const RELEASE_VERSION = '3.26.0';

	const CURRENT_POINTER_SLUG = 'e-editor-one-new-home';

	public static function add_hooks() {
		add_action( 'admin_print_footer_scripts', [ __CLASS__, 'admin_print_script' ] );
	}

	public static function admin_print_script() {
		if ( static::is_dismissed() || static::is_new_installation() || ! static::should_show() ) {
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
									introductionKey: '<?php echo esc_attr( static::CURRENT_POINTER_SLUG ); ?>',
								},
							} );
						}
					} ).pointer( 'open' );
				}, 10 );
			} );
		</script>
		<?php
	}

	private static function is_dismissed() {
		return User::get_introduction_meta( static::CURRENT_POINTER_SLUG );
	}

	private static function is_new_installation() {
		return Upgrade_Manager::install_compare( static::RELEASE_VERSION, '>=' );
	}

	private static function should_show() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return false;
		}

		if ( ! Admin::is_elementor_admin_page() ) {
			return false;
		}

		return true;
	}
}
