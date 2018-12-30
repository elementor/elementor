<?php
namespace Elementor\Modules\SafeMode;

use Elementor\Tools;
use Elementor\Core\Common\Modules\Ajax\Module as Ajax;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends \Elementor\Core\Base\Module {

	const OPTION_ENABLED = 'elementor_safe_mode';

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
								'value' => 'global',
								'sub_desc' => __( 'Enable Safe mode. <a href="#">Learn More</a>.', 'elementor' ),
							],
						],
					],
				],
			],
		] );
	}

	public function update_safe_mode( $option, $value ) {
		if ( 'yes' === $value || 'global' === $value ) {
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
		return ELEMENTOR_PATH . 'modules/page-templates/templates/header-footer.php';
	}

	public function print_safe_mode_css() { ?>
		<style>
			.elementor-safe-mode-toast {
				position: absolute;
				z-index: 3;
				bottom: 50px;
				right: 100px;
				width: 400px;
				line-height: 30px;
				background: white;
				padding: 25px;
				box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
				border-radius: 5px;
				font-family: Roboto, Arial, Helvetica, Verdana, sans-serif;
			}

			#elementor-try-safe-mode {
				display: none;
			}

			.elementor-safe-mode-toast .elementor-toast-content {
				font-size: 15px;
				line-height: 22px;
				color: #6D7882;
			}

			.elementor-safe-mode-toast .elementor-toast-content a {
				color: #138FFF;
			}

			.elementor-safe-mode-toast .elementor-toast-content hr {
				margin: 15px auto;
				border: 0 none;
				border-top: 1px solid #F1F3F5;
			}

			.elementor-safe-mode-toast header {
				display: flex;
				align-items: center;
				margin-bottom: 15px;
			}

			.elementor-safe-mode-toast .elementor-safe-mode-button {
				display: inline-block;
				font-weight: 500;
				font-size: 12.5px;
				text-transform: uppercase;
				color: white;
				line-height: 33px;
				background: #A4AFB7;
				border-radius: 3px;
				padding: 0 15px;
			}

			#elementor-try-safe-mode .elementor-safe-mode-button {
				background: #39B54A;
			}

			body:not(.rtl) .elementor-safe-mode-toast .elementor-safe-mode-button {
				margin-left: auto;
			}

			body.rtl .elementor-safe-mode-toast .elementor-safe-mode-button {
				margin-right: auto;
			}

			.elementor-safe-mode-toast header i {
				font-size: 25px;
				color: #A4AFB7;
			}

			body:not(.rtl) .elementor-safe-mode-toast header i {
				margin-right: 5px;
			}

			body.rtl .elementor-safe-mode-toast header i {
				margin-left: 5px;
			}

			.elementor-safe-mode-toast header h2 {
				font-size: 18px;
				color: #495157;
			}
		</style>
<?php	}

	public function print_safe_mode_notice() {
		// A fallback URL if the Js doesn't work.
		$tools_url = add_query_arg(
			[
				'page' => 'elementor-tools#tab-safe_mode',
			],
			admin_url( 'admin.php' )
		);

		$helped_url = 'https://docs.elementor.com/category/413-troubleshooting';
		$didnt_help_url = 'https://docs.elementor.com/category/413-troubleshooting';
		echo $this->print_safe_mode_css();
		?>
		<div class="elementor-safe-mode-toast" id="elementor-safe-mode-message">
			<header>
				<i class="eicon-warning"></i>
				<h2><?php echo __( 'Safe Mode ON', 'elementor' ); ?></h2>
				<a class="elementor-safe-mode-button elementor-disable-safe-mode" target="_blank" href="<?php echo $tools_url; ?>">
					<?php echo __( 'Disable Safe Mode', 'elementor' ); ?>
				</a>
			</header>

			<div class="elementor-toast-content">
				<p><?php printf( __( 'if \'Safe Mode\' helped, the problem was caused by one of your plugins or theme. To resolve this issue please <a href="%s" target="_blank">click here</a>', 'elementor' ), $helped_url ); ?></p>
				<hr>
				<p><?php printf( __( 'if Safe Mode didn\'t help, click here to <a href="%s" target="_blank">Troubleshoot</a>', 'elementor' ), $didnt_help_url ); ?></p>
			</div>
		</div>

		<script>
			var ElementorSafeMode = function() {
				var attachEvents = function() {
					jQuery( '.elementor-disable-safe-mode' ).on( 'click', function( e ) {
						if ( ! elementorCommon || ! elementorCommon.ajax ) {
							return;
						}

						e.preventDefault();

						elementorCommon.ajax.addRequest(
							'disable_safe_mode', {
								success: function() {
									location.replace( location.href.replace( '&elementor-mode=safe', '' ) );
								},
								error: function() {
									alert( 'An error occurred' );
								},
							},
							true
						);
					} );
				};

				var init = function() {
					attachEvents();
				};

				init();
			};

			new ElementorSafeMode();
		</script>
		<?php
	}

	public function print_try_safe_mode() {
		// A fallback URL if the Js doesn't work.
		$tools_url = add_query_arg(
			[
				'page' => 'elementor-tools#tab-safe_mode',
			],
			admin_url( 'admin.php' )
		);
		echo $this->print_safe_mode_css();
		?>
		<div class="elementor-safe-mode-toast" id="elementor-try-safe-mode">
			<header>
				<i class="eicon-warning"></i>
				<h2><?php echo __( 'Can\'t Edit?', 'elementor' ); ?></h2>
				<a class="elementor-safe-mode-button" target="_blank" href="<?php echo $tools_url; ?>">
					<?php echo __( 'Enable Safe Mode', 'elementor' ); ?>
				</a>
			</header>
			<div class="elementor-toast-content">
				<?php echo __( 'Try loading Elementor in \'Safe Mode\' (don\'t worry, it won\'t affect the websites)', '' ); ?>
			</div>
		</div>

		<script>
			var ElementorTrySafeMode = function() {
				var attachEvents = function() {
					jQuery( '.elementor-enable-safe-mode' ).on( 'click', function( e ) {
						if ( ! elementorCommon || ! elementorCommon.ajax ) {
							return;
						}

						e.preventDefault();

						elementorCommon.ajax.addRequest(
							'enable_safe_mode', {
								success: function() {
									location.replace( location.href + '&elementor-mode=safe' );
								},
								error: function() {
									alert( 'An error occurred' );
								},
							},
							true
						);
					} );
				};

				var isElementorLoaded = function() {
					return false;
					if ( ! elementor ) {
						return false;
					}

					var previewWindow = elementor.$preview[ 0 ].contentWindow;

					if ( ! previewWindow.elementorFrontend ) {
						return false;
					}

					if ( ! elementor.$previewElementorEl.length ) {
						return false;
					}

					return true;
				};

				var showTrySafeModeNotice = function() {
					if ( ! isElementorLoaded() ) {
						jQuery( '#elementor-try-safe-mode' ).show();
					}
				};

				var init = function() {
					setTimeout( showTrySafeModeNotice, 7000 );

					attachEvents();
				};

				init();
			};

			new ElementorTrySafeMode();
		</script>
		<?php
	}

	public function run_safe_mode() {
		add_filter( 'template_include', [ $this, 'filter_template' ], 999 );
		add_filter( 'elementor/document/urls/preview', [ $this, 'filter_preview_url' ] );
		add_action( 'elementor/editor/footer', [ $this, 'print_safe_mode_notice' ] );
	}

	private function is_enabled() {
		return get_option( self::OPTION_ENABLED );
	}

	public function __construct() {
		add_action( 'elementor/admin/after_create_settings/elementor-tools', [ $this, 'add_admin_button' ] );
		add_action( 'elementor/ajax/register_actions', [ $this, 'register_ajax_actions' ] );
		add_action( 'add_option_elementor_safe_mode', [ $this, 'update_safe_mode' ], 10, 2 );
		add_action( 'update_option_elementor_safe_mode', [ $this, 'update_safe_mode' ], 10, 2 );

		if ( ! $this->is_enabled() ) {
			add_action( 'elementor/editor/footer', [ $this, 'print_try_safe_mode' ] );
		}
	}
}
