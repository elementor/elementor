<?php
namespace Elementor\Modules\ProInstall;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	public function get_name() {
		return 'pro-install';
	}

	public function __construct() {
		parent::__construct();

		add_action( 'admin_menu', [ $this, 'register_menu' ], 60 );
		add_action( 'admin_post_elementor_do_pro_install', [ $this, 'admin_post_elementor_do_pro_install' ] );
	}

	public function register_menu() {
		add_submenu_page(
			Settings::PAGE_ID,
			__( 'Pro Install', 'elementor-pro' ),
			__( 'Pro Install', 'elementor-pro' ),
			'manage_options',
			'elementor-pro-install',
			[ $this, 'render' ]
		);
	}

	public function render() {
		$app = new Connect_App();
		$pro_subscriptions = $app->get_pro_subscriptions();
		?>
		<div class="wrap">
			<h2><?php _e( 'Pro Install', 'elementor-pro' ); ?></h2>
			<p><?php _e( 'Install Elementor Pro and get access to additional features and premium support.', 'elementor-pro' ); ?></p>
			<p><?php _e( 'If you already have a license key, you can activate it from the Elementor > License page.', 'elementor-pro' ); ?></p>
			<p><?php _e( 'If you don\'t have a license key, you can purchase one from the Elementor website.', 'elementor-pro' ); ?></p>

			<?php if ( empty( $pro_subscriptions ) ) : ?>
				<p><?php _e( 'There are no available subscriptions at the moment.', 'elementor-pro' ); ?></p>
			<?php else : ?>
				<?php foreach ( $pro_subscriptions as $pro_subscription ) : ?>
				<div>
					<h3><?php echo $pro_subscription['plan']; ?></h3>
					<p><a href="<?php echo $pro_subscription['id']; ?>" class="button button-primary">Install Now</a></p>
				</div>
				<?php endforeach; ?>
			<?php endif; ?>
		</div>
		<?php
	}

	public function admin_post_elementor_do_pro_install() {
		if ( empty( $_GET['sub_id'] ) ) {
			wp_die( __( 'Invalid subscription ID.', 'elementor-pro' ) );
		}

		$sub_id = $_GET['sub_id'] ?? null;

		$app = new Connect_App();
		$plugin_data = $app->get_pro_package_url( $sub_id );

		if ( empty( $plugin_data['package_url'] ) ) {
			wp_die( __( 'Invalid subscription ID.', 'elementor-pro' ) );
		}

		$plugin_installer = new Plugin_Installer( $plugin_data['plugin_slug'], $plugin_data['package_url'] );
		$plugin_installer->install();

		var_dump(
			$plugin_installer
		);
		die;
	}
}
