<?php
namespace Elementor\Core\Admin;

use Elementor\Api;
use Elementor\Core\Base\Module;
use Elementor\Plugin;
use Elementor\Tracker;
use Elementor\User;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Admin_Notices extends Module {

	private $notices = [
		'api_notice',
		'api_upgrade_plugin',
		'tracker',
		'rate_us_feedback',
		'woocommerce_promote',
		'cf7_promote',
		'mc4wp_promote',
		'popup_maker_promote',
		'role_manager_promote',
	];

	private $elementor_pages_count = null;

	private $install_time = null;

	private $current_screen_id = null;

	private function get_install_time() {
		if ( null === $this->install_time ) {
			$this->install_time = Plugin::$instance->get_install_time();
		}

		return $this->install_time;
	}

	private function get_elementor_pages_count() {
		if ( null === $this->elementor_pages_count ) {
			$elementor_pages = new \WP_Query( [
				'post_type' => 'any',
				'post_status' => 'publish',
				'fields' => 'ids',
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
				'meta_key' => '_elementor_edit_mode',
				'meta_value' => 'builder',
			] );

			$this->elementor_pages_count = $elementor_pages->post_count;
		}

		return $this->elementor_pages_count;
	}

	private function notice_api_upgrade_plugin() {
		$upgrade_notice = Api::get_upgrade_notice();
		if ( empty( $upgrade_notice ) ) {
			return false;
		}

		if ( ! current_user_can( 'update_plugins' ) ) {
			return false;
		}

		if ( ! in_array( $this->current_screen_id, [ 'toplevel_page_elementor', 'edit-elementor_library', 'elementor_page_elementor-system-info', 'dashboard' ], true ) ) {
			return false;
		}

		// Check if have any upgrades.
		$update_plugins = get_site_transient( 'update_plugins' );

		$has_remote_update_package = ! ( empty( $update_plugins ) || empty( $update_plugins->response[ ELEMENTOR_PLUGIN_BASE ] ) || empty( $update_plugins->response[ ELEMENTOR_PLUGIN_BASE ]->package ) );

		if ( ! $has_remote_update_package && empty( $upgrade_notice['update_link'] ) ) {
			return false;
		}

		if ( $has_remote_update_package ) {
			$product = $update_plugins->response[ ELEMENTOR_PLUGIN_BASE ];

			$details_url = self_admin_url( 'plugin-install.php?tab=plugin-information&plugin=' . $product->slug . '&section=changelog&TB_iframe=true&width=600&height=800' );
			$upgrade_url = wp_nonce_url( self_admin_url( 'update.php?action=upgrade-plugin&plugin=' . ELEMENTOR_PLUGIN_BASE ), 'upgrade-plugin_' . ELEMENTOR_PLUGIN_BASE );
			$new_version = $product->new_version;
		} else {
			$upgrade_url = $upgrade_notice['update_link'];
			$details_url = $upgrade_url;

			$new_version = $upgrade_notice['version'];
		}

		// Check if have upgrade notices to show.
		if ( version_compare( ELEMENTOR_VERSION, $upgrade_notice['version'], '>=' ) ) {
			return false;
		}

		$notice_id = 'upgrade_notice_' . $upgrade_notice['version'];
		if ( User::is_user_notice_viewed( $notice_id ) ) {
			return false;
		}
		?>
		<div class="notice updated is-dismissible elementor-message elementor-message-dismissed" data-notice_id="<?php echo esc_attr( $notice_id ); ?>">
			<div class="elementor-message-inner">
				<div class="elementor-message-icon">
					<div class="e-logo-wrapper">
						<i class="eicon-elementor" aria-hidden="true"></i>
					</div>
				</div>
				<div class="elementor-message-content">
					<strong><?php echo __( 'Update Notification', 'elementor' ); ?></strong>
					<p>
						<?php
						printf(
							/* translators: 1: Details URL, 2: Accessibility text, 3: Version number, 4: Update URL, 5: Accessibility text */
							__( 'There is a new version of Elementor Page Builder available. <a href="%1$s" class="thickbox open-plugin-details-modal" aria-label="%2$s">View version %3$s details</a> or <a href="%4$s" class="update-link" aria-label="%5$s">update now</a>.', 'elementor' ),
							esc_url( $details_url ),
							esc_attr( sprintf(
								/* translators: %s: Elementor version */
								__( 'View Elementor version %s details', 'elementor' ),
								$new_version
							) ),
							$new_version,
							esc_url( $upgrade_url ),
							esc_attr( __( 'Update Elementor Now', 'elementor' ) )
						);
						?>
					</p>
				</div>
				<div class="elementor-message-action">
					<a class="button elementor-button" href="<?php echo $upgrade_url; ?>">
						<i class="dashicons dashicons-update" aria-hidden="true"></i>
						<?php echo __( 'Update Now', 'elementor' ); ?>
					</a>
				</div>
			</div>
		</div>
		<?php

		return true;
	}

	private function notice_api_notice() {
		$admin_notice = Api::get_admin_notice();
		if ( empty( $admin_notice ) ) {
			return false;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return false;
		}

		if ( ! in_array( $this->current_screen_id, [ 'toplevel_page_elementor', 'edit-elementor_library', 'elementor_page_elementor-system-info', 'dashboard' ], true ) ) {
			return false;
		}

		$notice_id = 'admin_notice_api_' . $admin_notice['notice_id'];
		if ( User::is_user_notice_viewed( $notice_id ) ) {
			return false;
		}
		?>
		<div class="notice is-dismissible updated elementor-message-dismissed elementor-message-announcement" data-notice_id="<?php echo esc_attr( $notice_id ); ?>">
			<p><?php echo $admin_notice['notice_text']; ?></p>
		</div>
		<?php

		return true;
	}

	private function notice_tracker() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return false;
		}

		// Show tracker notice after 24 hours from installed time.
		if ( strtotime( '+24 hours', $this->get_install_time() ) > time() ) {
			return false;
		}

		if ( '1' === get_option( 'elementor_tracker_notice' ) ) {
			return false;
		}

		if ( Tracker::is_allow_track() ) {
			return false;
		}

		if ( 2 > $this->get_elementor_pages_count() ) {
			return false;
		}

		// TODO: Skip for development env.
		$optin_url = wp_nonce_url( add_query_arg( 'elementor_tracker', 'opt_into' ), 'opt_into' );
		$optout_url = wp_nonce_url( add_query_arg( 'elementor_tracker', 'opt_out' ), 'opt_out' );

		$tracker_description_text = __( 'Love using Elementor? Become a super contributor by opting in to share non-sensitive plugin data and to receive periodic email updates from us.', 'elementor' );

		/**
		 * Tracker admin description text.
		 *
		 * Filters the admin notice text for non-sensitive data collection.
		 *
		 * @since 1.0.0
		 *
		 * @param string $tracker_description_text Description text displayed in admin notice.
		 */
		$tracker_description_text = apply_filters( 'elementor/tracker/admin_description_text', $tracker_description_text );
		?>
		<div class="notice updated elementor-message">
			<div class="elementor-message-inner">
				<div class="elementor-message-icon">
					<div class="e-logo-wrapper">
						<i class="eicon-elementor" aria-hidden="true"></i>
					</div>
				</div>
				<div class="elementor-message-content">
					<p><?php echo esc_html( $tracker_description_text ); ?> <a href="https://go.elementor.com/usage-data-tracking/" target="_blank"><?php echo __( 'Learn more.', 'elementor' ); ?></a></p>
					<p class="elementor-message-actions">
						<a href="<?php echo $optin_url; ?>" class="button button-primary"><?php echo __( 'Sure! I\'d love to help', 'elementor' ); ?></a>&nbsp;<a href="<?php echo $optout_url; ?>" class="button-secondary"><?php echo __( 'No thanks', 'elementor' ); ?></a>
					</p>
				</div>
			</div>
		</div>
		<?php

		return true;
	}

	private function notice_rate_us_feedback() {
		$notice_id = 'rate_us_feedback';

		if ( ! current_user_can( 'manage_options' ) ) {
			return false;
		}

		if ( 'dashboard' !== $this->current_screen_id || User::is_user_notice_viewed( $notice_id ) ) {
			return false;
		}

		if ( 10 >= $this->get_elementor_pages_count() ) {
			return false;
		}

		$dismiss_url = add_query_arg( [
			'action' => 'elementor_set_admin_notice_viewed',
			'notice_id' => esc_attr( $notice_id ),
		], admin_url( 'admin-post.php' ) );

		?>
		<div class="notice updated is-dismissible elementor-message elementor-message-dismissed" data-notice_id="<?php echo esc_attr( $notice_id ); ?>">
			<div class="elementor-message-inner">
				<div class="elementor-message-icon">
					<div class="e-logo-wrapper">
						<i class="eicon-elementor" aria-hidden="true"></i>
					</div>
				</div>
				<div class="elementor-message-content">
					<p><strong><?php echo __( 'Congrats!', 'elementor' ); ?></strong> <?php _e( 'You created over 10 pages with Elementor. Great job! If you can spare a minute, please help us by leaving a five star review on WordPress.org.', 'elementor' ); ?></p>
					<p class="elementor-message-actions">
						<a href="https://go.elementor.com/admin-review/" target="_blank" class="button button-primary"><?php _e( 'Happy To Help', 'elementor' ); ?></a>
						<a href="<?php echo esc_url_raw( $dismiss_url ); ?>" class="button elementor-button-notice-dismiss"><?php _e( 'Hide Notification', 'elementor' ); ?></a>
					</p>
				</div>
			</div>
		</div>
		<?php

		return true;
	}

	private function notice_woocommerce_promote() {
		$notice_id = 'woocommerce_promote';

		if ( Utils::has_pro() || ! function_exists( 'WC' ) ) {
			return false;
		}

		if ( ! current_user_can( 'install_plugins' ) ) {
			return false;
		}

		if ( ! in_array( $this->current_screen_id, [ 'edit-product', 'woocommerce_page_wc-settings' ], true ) || User::is_user_notice_viewed( $notice_id ) ) {
			return false;
		}

		if ( strtotime( '2019-08-01' ) > $this->get_install_time() ) {
			return false;
		}

		if ( strtotime( '+24 hours', $this->get_install_time() ) > time() ) {
			return false;
		}

		?>
		<div class="notice updated is-dismissible elementor-message elementor-message-dismissed" data-notice_id="<?php echo esc_attr( $notice_id ); ?>">
			<div class="elementor-message-inner">
				<div class="elementor-message-icon">
					<div class="e-logo-wrapper">
						<i class="eicon-elementor" aria-hidden="true"></i>
					</div>
				</div>
				<div class="elementor-message-content">
					<p><?php _e( 'Using WooCommerce? With Elementor Pro’s WooCommerce Builder, you’ll be able to design your store without coding!', 'elementor' ); ?></p>
					<p class="elementor-message-actions">
						<a href="https://go.elementor.com/plugin-promotion-woocommerce/" target="_blank" class="button button-secondary"><?php _e( 'Learn More', 'elementor' ); ?></a>
					</p>
				</div>
			</div>
		</div>
		<?php

		return true;
	}

	private function notice_cf7_promote() {
		$notice_id = 'cf7_promote';

		if ( Utils::has_pro() || ! defined( 'WPCF7_VERSION' ) ) {
			return false;
		}

		if ( ! current_user_can( 'install_plugins' ) ) {
			return false;
		}

		if ( ! in_array( $this->current_screen_id, [ 'toplevel_page_wpcf7', 'contact_page_wpcf7-integration' ], true ) || User::is_user_notice_viewed( $notice_id ) ) {
			return false;
		}

		if ( strtotime( '2019-08-01' ) > $this->get_install_time() ) {
			return false;
		}

		if ( strtotime( '+24 hours', $this->get_install_time() ) > time() ) {
			return false;
		}

		?>
		<div class="notice updated is-dismissible elementor-message elementor-message-dismissed" data-notice_id="<?php echo esc_attr( $notice_id ); ?>">
			<div class="elementor-message-inner">
				<div class="elementor-message-icon">
					<div class="e-logo-wrapper">
						<i class="eicon-elementor" aria-hidden="true"></i>
					</div>
				</div>
				<div class="elementor-message-content">
					<p><?php _e( 'Using Elementor & Contact Form 7? Try out Elementor Pro and design your forms visually with one powerful tool.', 'elementor' ); ?></p>
					<p class="elementor-message-actions">
						<a href="https://go.elementor.com/plugin-promotion-contactform7/" target="_blank" class="button button-secondary"><?php _e( 'Learn More', 'elementor' ); ?></a>
					</p>
				</div>
			</div>
		</div>
		<?php

		return true;
	}

	private function notice_mc4wp_promote() {
		$notice_id = 'mc4wp_promote';

		if ( Utils::has_pro() || ! defined( 'MC4WP_VERSION' ) ) {
			return false;
		}

		if ( ! current_user_can( 'install_plugins' ) ) {
			return false;
		}

		if ( ! in_array( $this->current_screen_id, [ 'toplevel_page_mailchimp-for-wp', 'mc4wp_page_mailchimp-for-wp-forms', 'mc4wp_page_mailchimp-for-wp-integrations', 'mc4wp_page_mailchimp-for-wp-other', 'mc4wp_page_mailchimp-for-wp-extensions' ], true ) || User::is_user_notice_viewed( $notice_id ) ) {
			return false;
		}

		if ( strtotime( '2019-08-01' ) > $this->get_install_time() ) {
			return false;
		}

		if ( strtotime( '+24 hours', $this->get_install_time() ) > time() ) {
			return false;
		}

		?>
		<div class="notice updated is-dismissible elementor-message elementor-message-dismissed" data-notice_id="<?php echo esc_attr( $notice_id ); ?>">
			<div class="elementor-message-inner">
				<div class="elementor-message-icon">
					<div class="e-logo-wrapper">
						<i class="eicon-elementor" aria-hidden="true"></i>
					</div>
				</div>
				<div class="elementor-message-content">
					<p><?php _e( 'Want to design better MailChimp forms? Use Elementor Pro and enjoy unlimited integrations, visual design, templates and more.', 'elementor' ); ?></p>
					<p class="elementor-message-actions">
						<a href="https://go.elementor.com/plugin-promotion-mc4wp/" target="_blank" class="button button-secondary"><?php _e( 'Learn More', 'elementor' ); ?></a>
					</p>
				</div>
			</div>
		</div>
		<?php

		return true;
	}

	private function notice_popup_maker_promote() {
		$notice_id = 'popup_maker_promote';

		if ( Utils::has_pro() || ! class_exists( 'Popup_Maker' ) ) {
			return false;
		}

		if ( ! current_user_can( 'install_plugins' ) ) {
			return false;
		}

		if ( ! in_array( $this->current_screen_id, [ 'edit-popup', 'popup_page_pum-settings' ], true ) || User::is_user_notice_viewed( $notice_id ) ) {
			return false;
		}

		if ( strtotime( '2019-08-01' ) > $this->get_install_time() ) {
			return false;
		}

		if ( strtotime( '+24 hours', $this->get_install_time() ) > time() ) {
			return false;
		}

		?>
		<div class="notice updated is-dismissible elementor-message elementor-message-dismissed" data-notice_id="<?php echo esc_attr( $notice_id ); ?>">
			<div class="elementor-message-inner">
				<div class="elementor-message-icon">
					<div class="e-logo-wrapper">
						<i class="eicon-elementor" aria-hidden="true"></i>
					</div>
				</div>
				<div class="elementor-message-content">
					<p><?php _e( 'Using popups on your site? Build outstanding popups using Elementor Pro and get more leads, sales and subscribers.', 'elementor' ); ?></p>
					<p class="elementor-message-actions">
						<a href="https://go.elementor.com/plugin-promotion-popupmaker/" target="_blank" class="button button-secondary"><?php _e( 'Learn More', 'elementor' ); ?></a>
					</p>
				</div>
			</div>
		</div>
		<?php

		return true;
	}

	private function notice_role_manager_promote() {
		$notice_id = 'role_manager_promote';

		if ( Utils::has_pro() ) {
			return false;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return false;
		}

		if ( 'elementor_page_elementor-role-manager' !== $this->current_screen_id || User::is_user_notice_viewed( $notice_id ) ) {
			return false;
		}

		$users = new \WP_User_Query( [
			'fields' => 'ID',
			'number' => 10,
		] );

		if ( 5 > $users->get_total() ) {
			return false;
		}

		?>
		<div class="notice updated is-dismissible elementor-message elementor-message-dismissed" data-notice_id="<?php echo esc_attr( $notice_id ); ?>">
			<div class="elementor-message-inner">
				<div class="elementor-message-icon">
					<div class="e-logo-wrapper">
						<i class="eicon-elementor" aria-hidden="true"></i>
					</div>
				</div>
				<div class="elementor-message-content">
					<p><?php _e( 'Managing a multi-user site? With Elementor Pro, you can control user access and make sure no one messes up your design.', 'elementor' ); ?></p>
					<p class="elementor-message-actions">
						<a href="https://go.elementor.com/promotion-role-manager/" target="_blank" class="button button-secondary"><?php _e( 'Learn More', 'elementor' ); ?></a>
					</p>
				</div>
			</div>
		</div>
		<?php

		return true;
	}

	/*
	 * @TODO: Rewrite this method markup and use it for every admin notice
	 */
	public function print_admin_notice( array $options ) {
		$default_options = [
			'title' => '',
			'description' => '',
			'button' => [
				'text' => '',
				'url' => '',
				'class' => 'elementor-button',
			],
		];

		$options = array_replace_recursive( $default_options, $options );
		?>
		<div class="notice elementor-message">
			<div class="elementor-message-inner">
				<div class="elementor-message-icon">
					<div class="e-logo-wrapper">
						<i class="eicon-elementor" aria-hidden="true"></i>
					</div>
				</div>
				<div class="elementor-message-content">
					<?php if ( $options['title'] ) { ?>
						<strong><?php echo $options['title']; ?></strong>
					<?php } ?>
					<?php if ( $options['description'] ) { ?>
						<p><?php echo $options['description']; ?></p>
					<?php } ?>
				</div>
				<?php if ( $options['button']['text'] ) { ?>
					<div class="elementor-message-action">
						<a class="<?php echo $options['button']['class']; ?>" href="<?php echo esc_url( $options['button']['url'] ); ?>"><?php echo $options['button']['text']; ?></a>
					</div>
				<?php } ?>
			</div>
		</div>
		<?php
	}

	public function admin_notices() {
		$this->install_time = Plugin::$instance->get_install_time();
		$this->current_screen_id = get_current_screen()->id;

		foreach ( $this->notices as $notice ) {
			$method_callback = "notice_{$notice}";
			if ( $this->$method_callback() ) {
				return;
			}
		}
	}

	/**
	 * @since 2.9.0
	 * @access public
	 */
	public function __construct() {
		add_action( 'admin_notices', [ $this, 'admin_notices' ], 20 );
	}

	/**
	 * Get module name.
	 *
	 * Retrieve the module name.
	 *
	 * @since  2.9.0
	 * @access public
	 *
	 * @return string Module name.
	 */
	public function get_name() {
		return 'admin-notices';
	}
}
