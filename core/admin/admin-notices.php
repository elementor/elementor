<?php
namespace Elementor\Core\Admin;

use Elementor\Api;
use Elementor\Core\Admin\UI\Components\Button;
use Elementor\Core\Base\Module;
use Elementor\Core\Utils\Promotions\Filtered_Promotions_Manager;
use Elementor\Plugin;
use Elementor\Settings;
use Elementor\Tracker;
use Elementor\User;
use Elementor\Utils;
use Elementor\Core\Admin\Notices\Base_Notice;
use Elementor\Core\Admin\Notices\Elementor_Dev_Notice;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Admin_Notices extends Module {

	const DEFAULT_EXCLUDED_PAGES = [ 'plugins.php', 'plugin-install.php', 'plugin-editor.php' ];

	private $plain_notices = [
		'api_notice',
		'api_upgrade_plugin',
		'tracker',
		'rate_us_feedback',
		'role_manager_promote',
		'experiment_promotion',
		'design_not_appearing',
		'plugin_image_optimization',
	];

	private $elementor_pages_count = null;

	private $install_time = null;

	private $current_screen_id = null;

	private function get_notices() {
		$notices = [
			new Elementor_Dev_Notice(),
		];

		/**
		 * Admin notices.
		 *
		 * Filters Elementor admin notices.
		 *
		 * This hook can be used by external developers to manage existing
		 * admin notice or to add new notices for Elementor add-ons.
		 *
		 * @param array $notices A list of notice classes.
		 */
		$notices = apply_filters( 'elementor/core/admin/notices', $notices );

		return $notices;
	}

	private function get_install_time() {
		if ( null === $this->install_time ) {
			$this->install_time = Plugin::$instance->get_install_time();
		}

		return $this->install_time;
	}

	private function get_elementor_pages_count() {
		if ( null === $this->elementor_pages_count ) {
			$elementor_pages = new \WP_Query( [
				'no_found_rows' => true,
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

		// Check for upgrades.
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

		// Check if upgrade messages should be shown.
		if ( version_compare( ELEMENTOR_VERSION, $upgrade_notice['version'], '>=' ) ) {
			return false;
		}

		$notice_id = 'upgrade_notice_' . $upgrade_notice['version'];
		if ( User::is_user_notice_viewed( $notice_id ) ) {
			return false;
		}

		$message = sprintf(
			/* translators: 1: Details URL, 2: Accessibility text, 3: Version number, 4: Update URL, 5: Accessibility text. */
			__( 'There is a new version of Elementor Page Builder available. <a href="%1$s" class="thickbox open-plugin-details-modal" aria-label="%2$s">View version %3$s details</a> or <a href="%4$s" class="update-link" aria-label="%5$s">update now</a>.', 'elementor' ),
			esc_url( $details_url ),
			esc_attr( sprintf(
				/* translators: %s: Elementor version. */
				__( 'View Elementor version %s details', 'elementor' ),
				$new_version
			) ),
			$new_version,
			esc_url( $upgrade_url ),
			esc_attr( esc_html__( 'Update Now', 'elementor' ) )
		);

		$options = [
			'title' => esc_html__( 'Update Notification', 'elementor' ),
			'description' => $message,
			'button' => [
				'icon_classes' => 'dashicons dashicons-update',
				'text' => esc_html__( 'Update Now', 'elementor' ),
				'url' => $upgrade_url,
			],
			'id' => $notice_id,
		];

		$this->print_admin_notice( $options );

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

		$options = [
			'title' => esc_html__( 'Update Notification', 'elementor' ),
			'description' => $admin_notice['notice_text'],
			'id' => $notice_id,
		];

		$this->print_admin_notice( $options );

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

		$tracker_description_text = esc_html__( 'Become a super contributor by opting in to share non-sensitive plugin data and to receive periodic email updates from us.', 'elementor' );

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

		$message = esc_html( $tracker_description_text ) . ' <a href="https://go.elementor.com/usage-data-tracking/" target="_blank">' . esc_html__( 'Learn more.', 'elementor' ) . '</a>';

		$options = [
			'title' => esc_html__( 'Love using Elementor?', 'elementor' ),
			'description' => $message,
			'button' => [
				'text' => esc_html__( 'Sure! I\'d love to help', 'elementor' ),
				'url' => $optin_url,
				'type' => 'cta',
			],
			'button_secondary' => [
				'text' => esc_html__( 'No thanks', 'elementor' ),
				'url' => $optout_url,
				'variant' => 'outline',
				'type' => 'cta',
			],
		];

		$this->print_admin_notice( $options );

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

		$options = [
			'title' => esc_html__( 'Congrats!', 'elementor' ),
			'description' => esc_html__( 'You created over 10 pages with Elementor. Great job! If you can spare a minute, please help us by leaving a five star review on WordPress.org.', 'elementor' ),
			'id' => $notice_id,
			'button' => [
				'text' => esc_html__( 'Happy To Help', 'elementor' ),
				'url' => 'https://go.elementor.com/admin-review/',
				'new_tab' => true,
				'type' => 'cta',
			],
			'button_secondary' => [
				'text' => esc_html__( 'Hide Notification', 'elementor' ),
				'classes' => [ 'e-notice-dismiss' ],
				'url' => esc_url_raw( $dismiss_url ),
				'new_tab' => true,
				'type' => 'cta',
			],
		];

		$this->print_admin_notice( $options );

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

		$options = [
			'title' => esc_html__( 'Managing a multi-user site?', 'elementor' ),
			'description' => esc_html__( 'With Elementor Pro, you can control user access and make sure no one messes up your design.', 'elementor' ),
			'id' => $notice_id,

			'button' => [
				'text' => esc_html__( 'Learn More', 'elementor' ),
				'url' => 'https://go.elementor.com/plugin-promotion-role-manager/',
				'new_tab' => true,
				'type' => 'cta',
			],
		];

		$options = Filtered_Promotions_Manager::get_filtered_promotion_data( $options, 'core/admin/notice_role_manager_promote', 'button', 'url' );

		$this->print_admin_notice( $options );

		return true;
	}

	private function notice_experiment_promotion() {
		$notice_id = 'experiment_promotion';

		if ( ! current_user_can( 'manage_options' ) || User::is_user_notice_viewed( $notice_id ) ) {
			return false;
		}

		$experiments = Plugin::$instance->experiments;
		$is_all_performance_features_active = (
			$experiments->is_feature_active( 'e_element_cache' ) &&
			$experiments->is_feature_active( 'e_font_icon_svg' )
		);

		if ( $is_all_performance_features_active ) {
			return false;
		}

		$options = [
			'title' => esc_html__( 'Improve your site’s performance score.', 'elementor' ),
			'description' => esc_html__( 'With our experimental speed boosting features you can go faster than ever before. Look for the Performance label on our Experiments page and activate those experiments to improve your site loading speed.', 'elementor' ),
			'id' => $notice_id,
			'button' => [
				'text' => esc_html__( 'Try it out', 'elementor' ),
				'url' => Settings::get_settings_tab_url( 'experiments' ),
				'type' => 'cta',
			],
			'button_secondary' => [
				'text' => esc_html__( 'Learn more', 'elementor' ),
				'url' => 'https://go.elementor.com/wp-dash-experiment-promotion/',
				'new_tab' => true,
				'type' => 'cta',
			],
		];

		$this->print_admin_notice( $options );

		return true;
	}

	private function notice_design_not_appearing() {
		$installs_history = get_option( 'elementor_install_history', [] );
		$is_first_install = 1 === count( $installs_history );

		if ( $is_first_install || ! current_user_can( 'update_plugins' ) ) {
			return false;
		}

		$notice_id          = 'design_not_appearing';
		$notice             = User::get_user_notices()[ $notice_id ] ?? [];
		$notice_version     = $notice['meta']['version'] ?? null;
		$is_version_changed = $this->get_elementor_version() !== $notice_version;

		if ( $is_version_changed ) {
			User::set_user_notice( $notice_id, false, [ 'version' => $this->get_elementor_version() ] );
		}

		if ( ! in_array( $this->current_screen_id, [ 'toplevel_page_elementor', 'edit-elementor_library', 'elementor_page_elementor-system-info', 'dashboard', 'update-core', 'plugins' ], true ) ) {
			return false;
		}

		if ( User::is_user_notice_viewed( $notice_id ) ) {
			return false;
		}

		$options = [
			'title' => esc_html__( 'The version was updated successfully!', 'elementor' ),
			'description' => sprintf(
				esc_html__( 'Encountering issues after updating the version? Don’t worry - we’ve collected all the fixes for troubleshooting common issues. %1$sFind a solution%2$s', 'elementor' ),
				'<a href="https://go.elementor.com/wp-dash-changes-do-not-appear-online/" target="_blank">',
				'</a>'
			),
			'id' => $notice_id,
		];

		$excluded_pages = [];
		$this->print_admin_notice( $options, $excluded_pages );

		return true;
	}

	// For testing purposes
	public function get_elementor_version() {
		return ELEMENTOR_VERSION;
	}

	private function notice_plugin_image_optimization() {
		$notice_id = 'plugin_image_optimization';

		if ( 'upload' !== $this->current_screen_id ) {
			return false;
		}

		if ( ! current_user_can( 'manage_options' ) || User::is_user_notice_viewed( $notice_id ) ) {
			return false;
		}

		$attachments = new \WP_Query( [
			'post_type' => 'attachment',
			'post_status' => 'any',
			'fields' => 'ids',
		] );

		if ( 1 > $attachments->found_posts ) {
			return false;
		}

		$plugin_file_path = 'image-optimization/image-optimization.php';
		$plugin_slug = 'image-optimization';

		if ( is_plugin_active( $plugin_file_path ) ) {
			return false;
		}

		if ( $this->is_plugin_installed( $plugin_file_path ) ) {
			$url = wp_nonce_url( 'plugins.php?action=activate&amp;plugin=' . $plugin_file_path . '&amp;plugin_status=all&amp;paged=1&amp;s', 'activate-plugin_' . $plugin_file_path );
			$cta_text = esc_html__( 'Activate Plugin', 'elementor' );
		} else {
			$url = wp_nonce_url( self_admin_url( 'update.php?action=install-plugin&plugin=' . $plugin_slug ), 'install-plugin_' . $plugin_slug );
			$cta_text = esc_html__( 'Install Plugin', 'elementor' );
		}

		$options = [
			'title' => esc_html__( 'Speed up your website with Image Optimizer by Elementor', 'elementor' ),
			'description' => esc_html__( 'Automatically compress and optimize images, resize larger files, or convert to WebP. Optimize images individually, in bulk, or on upload.', 'elementor' ),
			'id' => $notice_id,
			'type' => 'cta',
			'button_secondary' => [
				'text' => $cta_text,
				'url' => $url,
				'type' => 'cta',
			],
		];

		$this->print_admin_notice( $options );

		return true;
	}

	private function is_plugin_installed( $file_path ): bool {
		$installed_plugins = get_plugins();

		return isset( $installed_plugins[ $file_path ] );
	}

	public function print_admin_notice( array $options, $exclude_pages = self::DEFAULT_EXCLUDED_PAGES ) {
		global $pagenow;

		if ( in_array( $pagenow, $exclude_pages, true ) ) {
			return;
		}

		$default_options = [
			'id' => null,
			'title' => '',
			'description' => '',
			'classes' => [ 'notice', 'e-notice' ], // We include WP's default notice class so it will be properly handled by WP's js handler
			'type' => '',
			'dismissible' => true,
			'icon' => 'eicon-elementor',
			'button' => [],
			'button_secondary' => [],
		];

		$options = array_replace_recursive( $default_options, $options );

		$notice_classes = $options['classes'];
		$dismiss_button = '';
		$icon = '';

		if ( $options['type'] ) {
			$notice_classes[] = 'e-notice--' . $options['type'];
		}

		if ( $options['dismissible'] ) {
			$label = esc_html__( 'Dismiss this notice.', 'elementor' );
			$notice_classes[] = 'e-notice--dismissible';
			$dismiss_button = '<i class="e-notice__dismiss" role="button" aria-label="' . $label . '" tabindex="0"></i>';
		}

		if ( $options['icon'] ) {
			$notice_classes[] = 'e-notice--extended';
			$icon = '<div class="e-notice__icon-wrapper"><i class="' . esc_attr( $options['icon'] ) . '" aria-hidden="true"></i></div>';
		}

		$wrapper_attributes = [
			'class' => $notice_classes,
		];

		if ( $options['id'] ) {
			$wrapper_attributes['data-notice_id'] = $options['id'];
		}
		?>
		<div <?php Utils::print_html_attributes( $wrapper_attributes ); ?>>
			<?php echo $dismiss_button; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<div class="e-notice__aside">
				<?php echo $icon; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>
			<div class="e-notice__content">
				<?php if ( $options['title'] ) { ?>
					<h3><?php echo wp_kses_post( $options['title'] ); ?></h3>
				<?php } ?>

				<?php if ( $options['description'] ) { ?>
					<p><?php echo wp_kses_post( $options['description'] ); ?></p>
				<?php } ?>

				<?php if ( ! empty( $options['button']['text'] ) || ! empty( $options['button_secondary']['text'] ) ) { ?>
					<div class="e-notice__actions">
						<?php
						foreach ( [ $options['button'], $options['button_secondary'] ] as $index => $button_settings ) {
							if ( empty( $button_settings['variant'] ) && $index ) {
								$button_settings['variant'] = 'outline';
							}

							if ( empty( $button_settings['text'] ) ) {
								continue;
							}

							$button = new Button( $button_settings );
							$button->print_button();
						} ?>
					</div>
				<?php } ?>
			</div>
		</div>
	<?php }

	public function admin_notices() {
		$this->install_time = Plugin::$instance->get_install_time();
		$this->current_screen_id = get_current_screen()->id;

		foreach ( $this->plain_notices as $notice ) {
			$method_callback = "notice_{$notice}";
			if ( $this->$method_callback() ) {
				return;
			}
		}

		/** @var Base_Notice $notice_instance */
		foreach ( $this->get_notices() as $notice_instance ) {
			if ( ! $notice_instance->should_print() ) {
				continue;
			}

			$this->print_admin_notice( $notice_instance->get_config() );

			// It exits the method to make sure it prints only one notice.
			return;
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
