<?php
namespace Elementor\Core\Common\Modules\Connect\Apps;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Pro_Installer extends Common_App {

	protected function get_slug() {
		return 'pro-installer';
	}

	public function action_activate_pro() {
		if ( ! file_exists( WP_PLUGIN_DIR . '/elementor-pro' ) || defined( 'ELEMENTOR_PRO_VERSION' ) ) {
			return;
		}

		activate_plugin( 'elementor-pro/elementor-pro.php' );

		$this->add_notice( __( 'Plugin has been activated.', 'elementor' ) );

		// Reload page, so the Pro plugin can activate license.
		wp_redirect( remove_query_arg( false ) );
		die;
	}

	public function render_admin_widget() {
		echo '<h2>' . __( 'Pro Installer', 'elementor' ) . '</h2>';

		echo '<div class="licence-container">';

		$this->render_license_widget();

		echo '</div>';
	}

	protected function render_license_widget() {
		if ( ! $this->is_connected() ) {
			return;
		}

		$license = $this->request( 'get_connected_license' );

		if ( empty( $license ) ) {
			printf( __( 'License not found', 'elementor' ) );
			return;
		}

		if ( is_wp_error( $license ) ) {
			printf( __( 'An Error occur while try to get licences: %s', 'elementor' ), $license->get_error_message() );

			return;
		}

		wp_enqueue_script( 'plugin-install' );
		wp_enqueue_script( 'updates' );

		if ( file_exists( WP_PLUGIN_DIR . '/elementor-pro' ) ) {
			$label = __( 'Activate Plugin & License', 'elementor' );
			$url = $this->get_admin_url( 'activate_pro' );
			$classes = 'activate-now';
		} elseif ( ! defined( 'ELEMENTOR_PRO_VERSION' ) ) {
			$label = __( 'Download & Activate', 'elementor' );
			$url = wp_nonce_url( self_admin_url( 'update.php?action=install-plugin&plugin=elementor-pro' ), 'install-plugin_elementor-pro' );
			$classes = 'install-now';
		} else {
			return;
		}

		?>
		<h3><?php echo __( 'Licenses', 'elementor' ) ?></h3>

		<script>
			jQuery( document ).on( 'click', '.install-now', function( e ) {
				e.preventDefault();
				wp.updates.installPlugin( {
					slug: 'elementor-pro',
					success: function ( response ) {
						wp.updates.installPluginSuccess( response );
						var $message = jQuery( '.plugin-card-' + response.slug ).find( '.install-now' );
						location.replace( $message.data( 'activate-url' ) );
					}
				} );
			} );
		</script>
		<style>
			.licence-container {
				margin: 10px 0;
			}
			.plugin-card {
				padding: 20px;
			}
		</style>
		<div class="plugin-card plugin-card-elementor-pro">
			<p>
				<br>
				<a class="button button-secondary button-hero <?php echo $classes; ?>" href="<?php echo $url; ?>" data-activate-url="<?php echo $this->get_admin_url( 'activate_pro' ) ?>">
					<?php echo esc_html( $label ); ?>
				</a>
			</p>
		</div>
		<?php
	}

	public function filter_plugins_api( $return_value, $action, $args ) {
		if ( 'plugin_information' === $action && 'elementor-pro' === $args->slug ) {

			$package_details = $this->request( 'get_connected_package' );

			/**
			 * TODO: Remove.
			 */
			$package_details->package_url = str_replace( 'https', 'http', $package_details->package_url );

			$return_value = (object) [
				'name' => 'Elementor Pro',
				'slug' => 'elementor-pro',
				'version' => $package_details->version,
				'download_link' => $package_details->package_url,
			];
		}

		return $return_value;
	}

	public function __construct() {
		parent::__construct();

		add_filter( 'plugins_api', [ $this, 'filter_plugins_api' ], 10, 3 );
	}
}
