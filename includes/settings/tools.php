<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Tools {

	const PAGE_ID = 'elementor-tools';

	public static function get_url() {
		return admin_url( 'admin.php?page=' . self::PAGE_ID );
	}

	public function register_admin_menu() {
		add_submenu_page(
			Settings::PAGE_ID,
			__( 'Elementor Tools', 'elementor' ),
			__( 'Tools', 'elementor' ),
			'manage_options',
			self::PAGE_ID,
			[ $this, 'display_settings_page' ]
		);
	}

	public function display_settings_page() {
		?>
		<div class="wrap">
			<h2><?php _e( 'Elementor Tools', 'elementor' ); ?></h2>
			<form method="post" action="">
				<h3>
					<?php _e( 'Clear Cache', 'elementor' ); ?>
				</h3>
				<p>
					<?php _e( 'Regenerate CSS files', 'elementor' ); ?>
				</p>

				<input type="hidden" name="tool_name" value="clear_cache" />

				<?php
				settings_fields( self::PAGE_ID );
				submit_button( __( 'Clear Cache', 'elementor' ) );
				?>
			</form>
		</div><!-- /.wrap -->
		<?php
	}

	public function process_form() {
		if ( empty( $_POST['option_page'] ) || self::PAGE_ID !== $_POST['option_page'] ) {
			return;
		}

		switch ( $_POST['tool_name'] ) {
			case 'clear_cache':
				$errors = Plugin::instance()->posts_css_manager->clear_cache();

				add_action( 'admin_notices', function() use ( $errors ) {
					if ( empty( $errors ) ) {
						echo '<div class="notice notice-success"><p>' . __( 'Cache has been cleared', 'elementor' ) . '</p></div>';
					} else {
						echo '<div class="notice notice-error"><p>' . implode( '<br>', $errors ) . '</p></div>';
					}
				} );
				break;
		}
	}

	public function __construct() {
		add_action( 'admin_menu', [ $this, 'register_admin_menu' ], 20 );

		if ( ! empty( $_POST ) ) {
			add_action( 'admin_init', [ $this, 'process_form' ], 10 );
		}
	}
}
