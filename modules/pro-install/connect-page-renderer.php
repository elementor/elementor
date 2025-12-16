<?php
namespace Elementor\Modules\ProInstall;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Connect_Page_Renderer {

	private Connect $connect;

	private string $page_url;

	private ?array $script_config;

	public function __construct( Connect $connect, string $page_url, ?array $script_config = null ) {
		$this->connect = $connect;
		$this->page_url = $page_url;
		$this->script_config = $script_config;
	}

	public function render() {
		if ( $this->script_config ) {
			wp_enqueue_script( ...$this->script_config );
		}
		?>
		<div class="wrap elementor-admin-page-license">
			<h2 class="wp-heading-inline"><?php echo esc_html__( 'Connect Settings', 'elementor' ); ?></h2>
			<?php
			if ( ! $this->connect->is_connected() ) {
				$this->render_connect_box();
			} else {
				$this->render_license_box();
			}
			?>
		</div>
		<?php
	}

	private function render_connect_box() {
		$connect_url = $this->connect->get_admin_url( 'authorize', [
			'utm_source' => 'license-page-connect-free',
			'utm_medium' => 'wp-dash',
			'utm_campaign' => 'connect-and-activate-license',
			'redirect_to' => $this->page_url,
		] );

		?>
		<div class="elementor-license-box">
			<h3><?php echo esc_html__( 'Connect your Elementor Account', 'elementor' ); ?></h3>

			<p>
				<?php echo esc_html__( 'Gain access to dozens of professionally designed templates, and connect your site to your My Elementor Dashboard.', 'elementor' ); ?>
			</p>

			<div class="elementor-box-action">
				<a id="elementor-connect-license" class="button button-primary" href="<?php echo esc_url( $connect_url ); ?>">
					<?php echo esc_html__( 'Connect to Elementor', 'elementor' ); ?>
				</a>
			</div>
		</div>
		<?php
	}

	private function render_license_box() {
		$disconnect_url = $this->connect->get_admin_url( 'disconnect', [
			'redirect_to' => $this->page_url,
		] );
		$download_link = $this->connect->get_download_link();

		?>
		<div class="elementor-license-box">
			<h3>
				<?php echo esc_html__( 'Status', 'elementor' ); ?>:
				<span style="color: #008000; font-style: italic;"><?php echo esc_html__( 'Connected', 'elementor' ); ?></span>
				<small>
					<a class="button" href="https://go.elementor.com/my-account/" target="_blank">
						<?php echo esc_html__( 'My Account', 'elementor' ); ?>
					</a>
				</small>
			</h3>

			<p class="e-row-stretch e-row-divider-bottom">
				<span>
				<?php
				$connected_user = $this->get_connected_account();

				if ( $connected_user ) :
					printf(
						/* translators: %s: Connected user. */
						esc_html__( 'You\'re connected as %s.', 'elementor' ),
						'<strong>' . esc_html( $connected_user ) . '</strong>'
					);
				endif;
				?>
				</span>
			</p>

			<p class="e-row-stretch">
				<span><?php echo esc_html__( 'Want to disconnect for any reason?', 'elementor' ); ?></span>
				<a class="button" href="<?php echo esc_url( $disconnect_url ); ?>">
					<?php echo esc_html__( 'Disconnect', 'elementor' ); ?>
				</a>
			</p>
		</div>
		<?php
		if ( empty( $download_link ) ) {
			$this->render_promotion_box();
		} else {
			$this->render_install_or_activate_box();
		}
	}

	private function get_connected_account() {
		$user = $this->connect->get( 'user' );

		$email = '';
		if ( $user ) {
			$email = $user->email;
		}

		return $email;
	}

	private function render_promotion_box() {
		?>
		<div class="elementor-license-box elementor-pro-connect-promotion">
			<div>
				<h2><?php echo esc_html__( 'Upgrade to Pro to unlock powerful design tools and advanced features.', 'elementor' ); ?></h2>
				<p><?php echo esc_html__( 'Build custom headers, footers, forms, popups, and WooCommerce stores.', 'elementor' ); ?></p>
				<div class="elementor-box-action">
					<a class="button button-upgrade" href="https://go.elementor.com/go-pro-connect-account-screen" target="_blank">
						<i class="eicon-upgrade-crown" aria-hidden="true"></i>
						<?php echo esc_html__( 'Upgrade Now', 'elementor' ); ?>
					</a>
				</div>
			</div>
			<img src="https://assets.elementor.com/free-to-pro-upsell/v1/images/connect-pro-upgrade.jpg" alt="<?php echo esc_attr__( 'Pro Upgrade', 'elementor' ); ?>" />
		</div>
		<?php
	}

	private function render_install_or_activate_box() {
		$cta_data = $this->get_cta_data();
		$cta_url = wp_nonce_url( admin_url( 'admin-post.php?action=elementor_do_pro_install' ), 'elementor_do_pro_install' );
		$cta_id = Utils::is_pro_installed_and_not_active() ? 'elementor-connect-activate-pro' : 'elementor-connect-install-pro';

		?>
		<div class="elementor-license-box">
			<h3><?php echo esc_html__( 'You\'ve got Elementor Pro', 'elementor' ); ?></h3>

			<p><?php echo esc_html( $cta_data['description'] ); ?></p>
			<p class="elementor-box-action">
				<a id="<?php echo esc_attr( $cta_id ); ?>" class="button button-primary" href="<?php echo esc_url( $cta_url ); ?>">
					<?php echo esc_html( $cta_data['button_text'] ); ?>
				</a>
			</p>
		</div>
		<?php
	}

	private function get_cta_data(): array {
		return [
			'description' => esc_html__( 'Enjoy full access to powerful design tools, advanced widgets, and everything you need to create next-level websites.', 'elementor' ),
			'button_text' => Utils::is_pro_installed_and_not_active() ? esc_html__( 'Activate Elementor Pro', 'elementor' ) : esc_html__( 'Install & Activate', 'elementor' ),
		];
	}
}

