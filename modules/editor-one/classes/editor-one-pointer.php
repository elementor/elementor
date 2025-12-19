<?php
namespace Elementor\Modules\EditorOne\Classes;

use Elementor\Core\Upgrade\Manager as Upgrade_Manager;
use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Pointer {

	const CURRENT_POINTER_SLUG = 'e-editor-one-notice-pointer';
	const MINIMUM_VERSION = '3.34.0';

	public function __construct() {
		add_action( 'admin_print_footer_scripts-index.php', [ $this, 'admin_print_script' ] );
	}

	public function admin_print_script() {
		if ( ! $this->is_admin_user() || $this->is_new_installation() || $this->is_dismissed() || ! $this->is_version_3_34_or_larger() ) {
			return;
		}

		wp_enqueue_script( 'wp-pointer' );
		wp_enqueue_style( 'wp-pointer' );

		$learn_more_url = 'https://go.elementor.com/wp-dash-editor-one-learn-more/';
		$pointer_content = '<h3>' . esc_html__( 'The Editor has a new home', 'elementor' ) . '</h3>';
		$pointer_content .= sprintf(
			'<p>%s <a href="%s" target="_blank">%s</a></p>',
			esc_html__( 'Editor tools are now grouped together for quick access. Build and grow your site with everything you need in one place.', 'elementor' ),
			esc_url( $learn_more_url ),
			esc_html__( 'Learn more', 'elementor' )
		);

		$got_it_url = admin_url( 'admin.php?page=elementor' );
		$pointer_content .= sprintf(
			'<p><a class="button button-primary" href="%s">%s</a></p>',
			esc_url( $got_it_url ),
			esc_html__( 'Got it', 'elementor' )
		);

		?>
		<script>
			jQuery( document ).ready( function( $ ) {
				setTimeout( function () {
					$( '#toplevel_page_elementor' ).pointer( {
						content: <?php echo wp_json_encode( $pointer_content ); ?>,
						position: {
							edge: <?php echo is_rtl() ? "'right'" : "'left'"; ?>,
							align: 'center'
						},
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

	private function is_version_3_34_or_larger() {
		return version_compare( ELEMENTOR_VERSION, self::MINIMUM_VERSION, '>=' );
	}
}
