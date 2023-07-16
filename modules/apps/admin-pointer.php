<?php
namespace Elementor\Modules\Apps;

use Elementor\Core\Upgrade\Manager as Upgrade_Manager;
use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Admin_Pointer {

	const RELEASE_VERSION = '3.14.0';

	const CURRENT_POINTER_SLUG = 'e-apps';

	public static function add_hooks() {
		add_action( 'admin_print_footer_scripts-index.php', [ __CLASS__, 'admin_print_script' ] );
	}

	public static function admin_print_script() {
		if ( static::is_dismissed() || static::is_new_installation() ) {
			return;
		}

		wp_enqueue_script( 'wp-pointer' );
		wp_enqueue_style( 'wp-pointer' );
		?>
		<script>
			jQuery( document ).ready( function( $ ) {
				$( '#toplevel_page_elementor' ).pointer( {
					content: '<h3><?php echo esc_html__( 'New! Popular Apps', 'elementor' ); ?></h3><p><?php echo esc_html__( 'Discover our collection of plugins and add-ons carefully selected to to enhance your Elementor website and unleash your creativity.', 'elementor' ); ?></p>',
					position: {
						edge: 'left',
						align: 'center'
					},
					close: function() {
						elementorCommon.ajax.addRequest( 'introduction_viewed', {
							data: {
								introductionKey: '<?php echo esc_attr( static::CURRENT_POINTER_SLUG ); ?>',
							},
						} );
					}
				} ).pointer( 'open' );
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
}
