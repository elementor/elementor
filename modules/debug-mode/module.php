<?php
namespace Elementor\Modules\DebugMode;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends \Elementor\Core\Base\Module {

	public function get_name() {
		return 'debug-mode';
	}

	public function __construct() {
		parent::__construct();

		add_action( 'admin_action_elementor', [ $this, 'check_debug_mode' ], 0 );
		add_filter( 'template_include', [ $this, 'template_redirect' ], 0 );
	}

	public function template_redirect( $template ) {
		$settings = get_option( 'elementor_debug_mode', [] );

		if ( ! empty( $settings ) ) {
			$template = __DIR__ . '/views/template-debug.php';
		}

		return $template;
	}

	public function check_debug_mode() {
		$settings = get_option( 'elementor_debug_mode', [] );

		if ( empty( $settings ) ) {
			if ( isset( $_GET['debug_action'] ) && 'start' === $_GET['debug_action'] ) {
				$settings['active_plugins'] = get_option( 'active_plugins' );
				$new_active_plugins = [
					ELEMENTOR_PLUGIN_BASE,
					ELEMENTOR_PRO_PLUGIN_BASE,
				];

				update_option( 'active_plugins', $new_active_plugins );

				$settings['template'] = get_option( 'template' );
				$settings['stylesheet'] = get_option( 'stylesheet' );

				add_option( 'elementor_debug_mode', $settings );

				update_option( 'template', '' );
				update_option( 'stylesheet', '' );

				wp_redirect( remove_query_arg( 'debug_action' ) );
			} elseif ( isset( $_GET['mode'] ) && 'debug' === $_GET['mode'] ) {
				wp_die(
					sprintf( '<a href="%s">Enter Debug Mode?</a>', add_query_arg( 'debug_action', 'start' ) ),
					__( 'Elementor Debuge Mode', '' ),
					[
						'back_link' => true,
					]
				);
			}
		} else {
			if ( isset( $_GET['debug_action'] ) && 'end' === $_GET['debug_action'] ) {
				update_option( 'template', $settings['template'] );
				update_option( 'stylesheet', $settings['stylesheet'] );
				delete_option( 'elementor_debug_mode' );

				wp_redirect( remove_query_arg( [
					'mode',
					'debug_action',
				] ) );
			}

			add_action( 'elementor/editor/footer', [ $this, 'debug_mode_message' ] );
		}
	}

	public function debug_mode_message() {
		?>
		<div style="position: absolute;z-index: 3;bottom: 0;min-width: 200px;height: 30px;line-height: 30px;background: yellow;right: 0;text-align: center;">
			<a style="color: black;" href="<?php echo add_query_arg( [
				'mode' => 'debug',
				'debug_action' => 'end',
			] ); ?>">
			Exit Debug mode
			</a>
		</div>
		<?php
	}
}
