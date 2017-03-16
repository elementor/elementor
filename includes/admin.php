<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Admin {

	/**
	 * Enqueue admin scripts.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function enqueue_scripts() {
		$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		wp_register_script(
			'elementor-dialog',
			ELEMENTOR_ASSETS_URL . 'lib/dialog/dialog' . $suffix . '.js',
			[
				'jquery-ui-position',
			],
			'3.0.2',
			true
		);

		wp_register_script(
			'elementor-admin-app',
			ELEMENTOR_ASSETS_URL . 'js/admin' . $suffix . '.js',
			[
				'jquery',
			],
			ELEMENTOR_VERSION,
			true
		);

		wp_localize_script(
			'elementor-admin-app',
			'ElementorAdminConfig',
			[
				'home_url' => home_url(),
			]
		);

		wp_enqueue_script( 'elementor-admin-app' );

		if ( in_array( get_current_screen()->id, [ 'plugins', 'plugins-network' ] ) ) {
			add_action( 'admin_footer', [ $this, 'print_deactivate_feedback_dialog' ] );

			$this->enqueue_feedback_dialog_scripts();
		}

		if ( 'elementor_page_elementor-tools' === get_current_screen()->id ) {
			wp_enqueue_script( 'elementor-dialog' );
		}
	}

	/**
	 * Enqueue admin styles.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function enqueue_styles() {
		$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		$direction_suffix = is_rtl() ? '-rtl' : '';

		wp_register_style(
			'elementor-icons',
			ELEMENTOR_ASSETS_URL . 'lib/eicons/css/elementor-icons' . $suffix . '.css',
			[],
			ELEMENTOR_VERSION
		);

		wp_register_style(
			'elementor-admin-app',
			ELEMENTOR_ASSETS_URL . 'css/admin' . $direction_suffix . $suffix . '.css',
			[
				'elementor-icons',
			],
			ELEMENTOR_VERSION
		);

		wp_enqueue_style( 'elementor-admin-app' );

		// It's for upgrade notice
		// TODO: enqueue this just if needed
		add_thickbox();
	}

	/**
	 * Print switch button in edit post (which has cpt support).
	 *
	 * @since 1.0.0
	 * @param $post
	 *
	 * @return void
	 */
	public function print_switch_mode_button( $post ) {
		if ( ! User::is_current_user_can_edit( $post->ID ) ) {
			return;
		}

		$current_mode = Plugin::$instance->db->get_edit_mode( $post->ID );
		if ( 'builder' !== $current_mode ) {
			$current_mode = 'editor';
		}

		wp_nonce_field( basename( __FILE__ ), '_elementor_edit_mode_nonce' );
		?>
		<div id="elementor-switch-mode">
			<input id="elementor-switch-mode-input" type="hidden" name="_elementor_post_mode" value="<?php echo $current_mode; ?>" />
			<button id="elementor-switch-mode-button" class="elementor-button button button-primary button-hero">
				<span class="elementor-switch-mode-on"><?php _e( '&#8592; Back to WordPress Editor', 'elementor' ); ?></span>
				<span class="elementor-switch-mode-off">
					<i class="eicon-elementor"></i>
					<?php _e( 'Edit with Elementor', 'elementor' ); ?>
				</span>
			</button>
		</div>
		<div id="elementor-editor">
	        <a id="elementor-go-to-edit-page-link" href="<?php echo Utils::get_edit_link( $post->ID ); ?>">
		        <div id="elementor-editor-button" class="elementor-button button button-primary button-hero">
			        <i class="eicon-elementor"></i>
					<?php _e( 'Edit with Elementor', 'elementor' ); ?>
		        </div>
		        <div class="elementor-loader-wrapper">
			        <div class="elementor-loader">
				        <div class="elementor-loader-box"></div>
				        <div class="elementor-loader-box"></div>
				        <div class="elementor-loader-box"></div>
				        <div class="elementor-loader-box"></div>
			        </div>
			        <div class="elementor-loading-title"><?php _e( 'Loading', 'elementor' ); ?></div>
		        </div>
	        </a>
		</div>
		<?php
	}

	/**
	 * Fired when the save the post, and flag the post mode.
	 *
	 * @since 1.0.0
	 * @param $post_id
	 *
	 * @return void
	 */
	public function save_post( $post_id ) {
		if ( ! isset( $_POST['_elementor_edit_mode_nonce'] ) || ! wp_verify_nonce( $_POST['_elementor_edit_mode_nonce'], basename( __FILE__ ) ) ) {
			return;
		}

		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		// Exit when you don't have $_POST array.
		if ( empty( $_POST ) ) {
			return;
		}

		if ( ! isset( $_POST['_elementor_post_mode'] ) )
			$_POST['_elementor_post_mode'] = '';

		Plugin::$instance->db->set_edit_mode( $post_id, $_POST['_elementor_post_mode'] );
	}

	/**
	 * Add edit link in outside edit post.
	 *
	 * @since 1.0.0
	 * @param $actions
	 * @param $post
	 *
	 * @return array
	 */
	public function add_edit_in_dashboard( $actions, $post ) {
		if ( User::is_current_user_can_edit( $post->ID ) && 'builder' === Plugin::$instance->db->get_edit_mode( $post->ID ) ) {
			$actions['edit_with_elementor'] = sprintf(
				'<a href="%s">%s</a>',
				Utils::get_edit_link( $post->ID ),
				__( 'Edit with Elementor', 'elementor' )
			);
		}

		return $actions;
	}

	public function body_status_classes( $classes ) {
		global $pagenow;

		if ( in_array( $pagenow, [ 'post.php', 'post-new.php' ] ) && Utils::is_post_type_support() ) {
			$post = get_post();
			$current_mode = Plugin::$instance->db->get_edit_mode( $post->ID );

			$mode_class = 'builder' === $current_mode ? 'elementor-editor-active' : 'elementor-editor-inactive';

			$classes .= ' ' . $mode_class;
		}

		return $classes;
	}

	public function plugin_action_links( $links ) {
		$settings_link = sprintf( '<a href="%s">%s</a>', admin_url( 'admin.php?page=' . Settings::PAGE_ID ), __( 'Settings', 'elementor' ) );

		array_unshift( $links, $settings_link );

		$links['go_pro'] = sprintf( '<a href="%s" target="_blank" class="elementor-plugins-gopro">%s</a>', 'https://go.elementor.com/pro-admin-plugins/', __( 'Go Pro', 'elementor' ) );

		return $links;
	}

	public function plugin_row_meta( $plugin_meta, $plugin_file ) {
		if ( ELEMENTOR_PLUGIN_BASE === $plugin_file ) {
			$row_meta = [
				'docs' => '<a href="https://go.elementor.com/docs-admin-plugins/" title="' . esc_attr( __( 'View Elementor Documentation', 'elementor' ) ) . '" target="_blank">' . __( 'Docs & FAQs', 'elementor' ) . '</a>',
				'ideo' => '<a href="https://go.elementor.com/yt-admin-plugins/" title="' . esc_attr( __( 'View Elementor Video Tutorials', 'elementor' ) ) . '" target="_blank">' . __( 'Video Tutorials', 'elementor' ) . '</a>',
			];

			$plugin_meta = array_merge( $plugin_meta, $row_meta );
		}

		return $plugin_meta;
	}

	public function admin_notices() {
		$upgrade_notice = Api::get_upgrade_notice();
		if ( empty( $upgrade_notice ) )
			return;

		if ( ! current_user_can( 'update_plugins' ) )
			return;

		if ( ! in_array( get_current_screen()->id, [ 'toplevel_page_elementor', 'edit-elementor_library', 'elementor_page_elementor-system-info', 'dashboard' ] ) ) {
			return;
		}

		// Check if have any upgrades
		$update_plugins = get_site_transient( 'update_plugins' );
		if ( empty( $update_plugins ) || empty( $update_plugins->response[ ELEMENTOR_PLUGIN_BASE ] ) || empty( $update_plugins->response[ ELEMENTOR_PLUGIN_BASE ]->package ) ) {
			return;
		}
		$product = $update_plugins->response[ ELEMENTOR_PLUGIN_BASE ];

		// Check if have upgrade notices to show
		if ( version_compare( ELEMENTOR_VERSION, $upgrade_notice['version'], '>=' ) )
			return;

		$notice_id = 'upgrade_notice_' . $upgrade_notice['version'];
		if ( User::is_user_notice_viewed( $notice_id ) )
			return;

		$details_url = self_admin_url( 'plugin-install.php?tab=plugin-information&plugin=' . $product->slug . '&section=changelog&TB_iframe=true&width=600&height=800' );
		$upgrade_url = wp_nonce_url( self_admin_url( 'update.php?action=upgrade-plugin&plugin=' . ELEMENTOR_PLUGIN_BASE ), 'upgrade-plugin_' . ELEMENTOR_PLUGIN_BASE );
		?>
		<div class="notice updated is-dismissible elementor-message elementor-message-dismissed" data-notice_id="<?php echo esc_attr( $notice_id ); ?>">
			<div class="elementor-message-inner">
				<div class="elementor-message-icon">
					<i class="eicon-elementor-square"></i>
				</div>
				<div class="elementor-message-content">
					<h3><?php _e( 'New in Elementor', 'elementor' ); ?></h3>
					<p><?php
						printf(
							/* translators: 1: details URL, 2: accessibility text, 3: version number, 4: update URL, 5: accessibility text */
							__( 'There is a new version of Elementor Page Builder available. <a href="%1$s" class="thickbox open-plugin-details-modal" aria-label="%2$s">View version %3$s details</a> or <a href="%4$s" class="update-link" aria-label="%5$s">update now</a>.', 'elementor' ),
							esc_url( $details_url ),
							esc_attr(
								sprintf(
									/* translators: %s: version number */
									__( 'View Elementor version %s details', 'elementor' ),
									$product->new_version
								)
							),
							$product->new_version,
							esc_url( $upgrade_url ),
							esc_attr( __( 'Update Now', 'elementor' ) )
						);
						?></p>
				</div>
				<div class="elementor-update-now">
					<a class="button elementor-button" href="<?php echo $upgrade_url; ?>"><i class="dashicons dashicons-update"></i><?php _e( 'Update Now', 'elementor' ); ?></a>
				</div>
			</div>
		</div>
		<?php
	}

	public function admin_footer_text( $footer_text ) {
		$current_screen = get_current_screen();
		$is_elementor_screen = ( $current_screen && false !== strpos( $current_screen->base, 'elementor' ) );

		if ( $is_elementor_screen ) {
			$footer_text = sprintf(
				/* translators: %s: link to plugin review */
				__( 'Enjoyed <strong>Elementor</strong>? Please leave us a %s rating. We really appreciate your support!', 'elementor' ),
				'<a href="https://wordpress.org/support/plugin/elementor/reviews/?filter=5#new-post" target="_blank">&#9733;&#9733;&#9733;&#9733;&#9733;</a>'
			);
		}

		return $footer_text;
	}

	public function enqueue_feedback_dialog_scripts() {
		$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		wp_register_script(
			'elementor-admin-feedback',
			ELEMENTOR_ASSETS_URL . 'js/admin-feedback' . $suffix . '.js',
			[
				'jquery',
				'underscore',
				'elementor-dialog',
			],
			ELEMENTOR_VERSION,
			true
		);

		wp_enqueue_script( 'elementor-admin-feedback' );

		wp_localize_script(
			'elementor-admin-feedback',
			'ElementorAdminFeedbackArgs',
			[
				'is_tracker_opted_in' => Tracker::is_allow_track(),
				'i18n' => [
					'submit_n_deactivate' => __( 'Submit & Deactivate', 'elementor' ),
					'skip_n_deactivate' => __( 'Skip & Deactivate', 'elementor' ),
				],
			]
		);
	}

	public function print_deactivate_feedback_dialog() {
		$deactivate_reasons = [
			'no_longer_needed' => [
				'title' => __( 'I no longer need the plugin', 'elementor' ),
				'input_placeholder' => '',
			],
			'found_a_better_plugin' => [
				'title' => __( 'I found a better plugin', 'elementor' ),
				'input_placeholder' => __( 'Please share which plugin', 'elementor' ),
			],
			'couldnt_get_the_plugin_to_work' => [
				'title' => __( 'I couldn\'t get the plugin to work', 'elementor' ),
				'input_placeholder' => '',
			],
			'temporary_deactivation' => [
				'title' => __( 'It\'s a temporary deactivation', 'elementor' ),
				'input_placeholder' => '',
			],
			'other' => [
				'title' => __( 'Other', 'elementor' ),
				'input_placeholder' => __( 'Please share the reason', 'elementor' ),
			],
		];

		?>
		<div id="elementor-deactivate-feedback-dialog-wrapper">
			<div id="elementor-deactivate-feedback-dialog-header">
				<i class="eicon-elementor-square"></i>
				<span id="elementor-deactivate-feedback-dialog-header-title"><?php _e( 'Quick Feedback', 'elementor' ); ?></span>
			</div>
			<form id="elementor-deactivate-feedback-dialog-form" method="post">
				<?php
				wp_nonce_field( '_elementor_deactivate_feedback_nonce' );
				?>
				<input type="hidden" name="action" value="elementor_deactivate_feedback" />

				<div id="elementor-deactivate-feedback-dialog-form-caption"><?php _e( 'If you have a moment, please share why you are deactivating Elementor:', 'elementor' ); ?></div>
				<div id="elementor-deactivate-feedback-dialog-form-body">
					<?php foreach ( $deactivate_reasons as $reason_key => $reason ) : ?>
						<div class="elementor-deactivate-feedback-dialog-input-wrapper">
							<input id="elementor-deactivate-feedback-<?php echo esc_attr( $reason_key ); ?>" class="elementor-deactivate-feedback-dialog-input" type="radio" name="reason_key" value="<?php echo esc_attr( $reason_key ); ?>" />
							<label for="elementor-deactivate-feedback-<?php echo esc_attr( $reason_key ); ?>" class="elementor-deactivate-feedback-dialog-label"><?php echo $reason['title']; ?></label>
							<?php if ( ! empty( $reason['input_placeholder'] ) ) : ?>
								<input class="elementor-feedback-text" type="text" name="reason_<?php echo esc_attr( $reason_key ); ?>" placeholder="<?php echo esc_attr( $reason['input_placeholder'] ); ?>" />
							<?php endif; ?>
						</div>
					<?php endforeach; ?>
				</div>
			</form>
		</div>
		<?php
	}

	public function ajax_elementor_deactivate_feedback() {
		if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( $_POST['_wpnonce'], '_elementor_deactivate_feedback_nonce' ) ) {
			wp_send_json_error();
		}

		$reason_text = '';

		$reason_key = '';

		if ( ! empty( $_POST['reason_key'] ) )
			$reason_key = $_POST['reason_key'];

		if ( ! empty( $_POST[ "reason_{$reason_key}" ] ) )
			$reason_text = $_POST[ "reason_{$reason_key}" ];

		Api::send_feedback( $reason_key, $reason_text );

		wp_send_json_success();
	}

	/**
	 * Admin constructor.
	 */
	public function __construct() {
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_styles' ] );

		add_action( 'edit_form_after_title', [ $this, 'print_switch_mode_button' ] );
		add_action( 'save_post', [ $this, 'save_post' ] );

		add_filter( 'page_row_actions', [ $this, 'add_edit_in_dashboard' ], 10, 2 );
		add_filter( 'post_row_actions', [ $this, 'add_edit_in_dashboard' ], 10, 2 );

		add_filter( 'plugin_action_links_' . ELEMENTOR_PLUGIN_BASE, [ $this, 'plugin_action_links' ] );
		add_filter( 'plugin_row_meta', [ $this, 'plugin_row_meta' ], 10, 2 );

		add_action( 'admin_notices', [ $this, 'admin_notices' ] );
		add_filter( 'admin_body_class', [ $this, 'body_status_classes' ] );
		add_filter( 'admin_footer_text', [ $this, 'admin_footer_text' ] );

		// Ajax
		add_action( 'wp_ajax_elementor_deactivate_feedback', [ $this, 'ajax_elementor_deactivate_feedback' ] );
	}
}
