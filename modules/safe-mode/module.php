<?php
namespace Elementor\Modules\SafeMode;

use Elementor\Tools;
use Elementor\Core\Common\Modules\Ajax\Module as Ajax;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends \Elementor\Core\Base\Module {

	public function get_name() {
		return 'safe-mode';
	}

	public function register_ajax_actions( Ajax $ajax ) {
		$ajax->register_ajax_action( 'enable_safe_mode', [ $this, 'ajax_enable_safe_mode' ] );
		$ajax->register_ajax_action( 'disable_safe_mode', [ $this, 'disable_safe_mode' ] );
	}

	/**
	 * @param Tools $tools_page
	 */
	public function add_admin_button( $tools_page ) {
		$tools_page->add_tab( 'safe_mode', [
			'label' => __( 'Safe mode', 'elementor' ),
			'sections' => [
				'safe_mode' => [
					'fields' => [
						'safe_mode' => [
							'label' => __( 'Enable Safe Mode', 'elementor' ),
							'field_args' => [
								'type' => 'checkbox',
								'value' => 'yes',
								'sub_desc' => __( 'Enable Safe mode. <a href="#">Learn More</a>.', 'elementor' ),
							],
						],
					],
				],
			],
		] );
	}

	public function update_safe_mode( $option, $value ) {
		if ( 'yes' === $value ) {
			$this->enable_safe_mode();
		} else {
			$this->disable_safe_mode();
		}
	}

	public function ajax_enable_safe_mode() {
		// It will run `$this->>update_safe_mode`.
		update_option( 'elementor_safe_mode', 'yes' );
	}

	public function enable_safe_mode() {
		WP_Filesystem();

		$allowed_plugins = [
			'elementor' => ELEMENTOR_PLUGIN_BASE,
		];

		if ( defined( 'ELEMENTOR_PRO_PLUGIN_BASE' ) ) {
			$allowed_plugins['elementor_pro'] = ELEMENTOR_PRO_PLUGIN_BASE;
		}

		add_option( 'elementor_safe_mode_allowed_plugins', $allowed_plugins );

		if ( ! is_dir( WPMU_PLUGIN_DIR ) ) {
			wp_mkdir_p( WPMU_PLUGIN_DIR );
			add_option( 'elementor_safe_mode_created_mu_dir', true );
		}

		if ( ! is_dir( WPMU_PLUGIN_DIR ) ) {
			wp_die( __( 'Cannot enable Safe Mode', 'elementor' ) );
		}

		copy_dir( __DIR__ . '/mu-plugin/', WPMU_PLUGIN_DIR );
	}

	public function disable_safe_mode() {
		$file_path = WP_CONTENT_DIR . '/mu-plugins/elementor-safe-mode.php';
		if ( file_exists( $file_path ) ) {
			unlink( $file_path );
		}

		if ( get_option( 'elementor_safe_mode_created_mu_dir' ) ) {
			// It will be removed only if it's empty and don't have other mu-plugins.
			@rmdir( WPMU_PLUGIN_DIR );
		}

		delete_option( 'elementor_safe_mode' );
		delete_option( 'elementor_safe_mode_allowed_plugins' );
		delete_option( 'theme_mods_elementor-safe' );
		delete_option( 'elementor_safe_mode_created_mu_dir' );
	}

	public function filter_preview_url( $url ) {
		return add_query_arg( 'elementor-mode', 'safe', $url );
	}

	public function filter_template() {
		return ELEMENTOR_PATH . '/modules/page-templates/templates/canvas.php';
	}

	public function print_footer() {
		// A fallback URL if the Js doesn't work.
		$tools_url = add_query_arg(
			[
				'page' => 'elementor-tools#tab-safe_mode',
			],
			admin_url( 'admin.php' )
		);
		?>
		<style>
			#elementor-safe-mode-message {
				position: absolute;
				z-index: 3;
				bottom: 0;
				min-width: 200px;
				height: 30px;
				line-height: 30px;
				background: yellow;
				right: 0;
				text-align: center;
			}

			#elementor-safe-mode-message a{
				color: black;
			}
		</style>
		<div id="elementor-safe-mode-message">
			<a target="_blank" href="<?php echo $tools_url; ?>">
				<?php echo __( 'Exit Safe mode', 'elementor' ); ?>
			</a>
		</div>

		<script>
			jQuery( '#elementor-safe-mode-message' ).on( 'click', function( e ) {
				e.preventDefault();

				elementorCommon.ajax.addRequest(
					'disable_safe_mode', {
						success: function() {
							location.href = location.href.replace( '&elementor-mode=safe', '' );
						},
						error: function() {
							alert( 'An error occurred' );
						},
					},
					true
				);
			} );
		</script>
		<?php
	}

	public function run_safe_mode() {
		add_filter( 'template_include', [ $this, 'filter_template' ], 999 );
		add_filter( 'elementor/document/urls/preview', [ $this, 'filter_preview_url' ] );
		add_action( 'elementor/editor/footer', [ $this, 'print_footer' ] );
	}

	public function __construct() {
		add_action( 'elementor/admin/after_create_settings/elementor-tools', [ $this, 'add_admin_button' ] );
		add_action( 'elementor/ajax/register_actions', [ $this, 'register_ajax_actions' ] );
		add_action( 'add_option_elementor_safe_mode', [ $this, 'update_safe_mode' ], 10, 2 );
		add_action( 'update_option_elementor_safe_mode', [ $this, 'update_safe_mode' ], 10, 2 );
	}
}
