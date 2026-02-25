<?php
namespace Elementor\Modules\EditorOne\Classes;

use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Pointer {

	const CURRENT_POINTER_SLUG = 'e-editor-one-notice-pointer';

	public function __construct() {
		add_action( 'admin_print_footer_scripts', [ $this, 'admin_print_script' ] );
	}

	public function admin_print_script() {
		if ( ! $this->is_admin_user() || $this->is_dismissed() ) {
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

		$got_it_url = Menu_Config::get_elementor_home_url();
		$pointer_content .= sprintf(
			'<p><button class="button button-primary elementor-editor-one-pointer-got-it">%s</button></p>',
			esc_html__( 'Got it', 'elementor' )
		);

		$pointer_element_selector = '#toplevel_page_' . Menu_Config::ELEMENTOR_HOME_MENU_SLUG;

		?>
		<script>
			jQuery( document ).ready( function( $ ) {
				setTimeout( function () {
					function markIntroductionAsViewed( redirectUrl ) {
						elementorCommon.ajax.addRequest( 'introduction_viewed', {
							data: {
								introductionKey: '<?php echo esc_attr( self::CURRENT_POINTER_SLUG ); ?>',
							},
							success: function() {
								if ( redirectUrl ) {
									window.location.href = redirectUrl;
								}
							}
						} );
					}

					$( '<?php echo esc_js( $pointer_element_selector ); ?>' ).pointer( {
						content: <?php echo wp_json_encode( $pointer_content ); ?>,
						position: {
							edge: 'top',
							align: 'left',
							at: 'left+20 bottom',
							my: 'left top'
						},
						close: function() {
							markIntroductionAsViewed();
						}
					} ).pointer( 'open' );

					$( document ).on( 'click', '.elementor-editor-one-pointer-got-it', function( e ) {
						e.preventDefault();
						markIntroductionAsViewed( '<?php echo esc_url( $got_it_url ); ?>' );
					} );
				}, 10 );
			} );
		</script>
		<?php
	}

	private function is_dismissed() {
		return User::get_introduction_meta( self::CURRENT_POINTER_SLUG );
	}

	private function is_admin_user() {
		return current_user_can( 'manage_options' );
	}
}
