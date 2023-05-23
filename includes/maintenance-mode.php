<?php
namespace Elementor;

use Elementor\Modules\Maintenance_Mode\Config\Site_Maintenance_Mode_Exclude_Mode as Exclude_Mode;
use Elementor\Modules\Maintenance_Mode\Config\Site_Maintenance_Mode_Exclude_Roles as Exclude_Roles;
use Elementor\Modules\Maintenance_Mode\Config\Site_Maintenance_Mode_Mode as Mode;
use Elementor\Modules\Maintenance_Mode\Config\Site_Maintenance_Mode_Template_Id as Template_Id;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor maintenance mode.
 *
 * Elementor maintenance mode handler class is responsible for the Elementor
 * "Maintenance Mode" and the "Coming Soon" features.
 *
 * @since 1.4.0
 */
class Maintenance_Mode {

	/**
	 * The options prefix.
	 * @deprecated 3.14.0
	 */
	const OPTION_PREFIX = 'elementor_maintenance_mode_';

	/**
	 * The maintenance mode.
	 * @deprecated 3.14.0 Use Site_Maintenance_Mode_Mode::OPTION_MAINTENANCE instead.
	 */
	const MODE_MAINTENANCE = 'maintenance';

	/**
	 * The coming soon mode.
	 * @deprecated 3.14.0 Use Site_Maintenance_Mode_Mode::OPTION_COMING_SOON instead.
	 */
	const MODE_COMING_SOON = 'coming_soon';

	/**
	 * Get elementor option.
	 *
	 * Retrieve elementor option from the database.
	 *
	 * @since 1.4.0
	 * @access public
	 * @static
	 *
	 * @param string $option  Option name. Expected to not be SQL-escaped.
	 * @param mixed  $default Optional. Default value to return if the option
	 *                        does not exist. Default is false.
	 *
	 * @return bool False if value was not updated and true if value was updated.
	 */
	public static function get( $option, $default = false ) {
		return get_option( self::OPTION_PREFIX . $option, $default );
	}

	/**
	 * Set elementor option.
	 *
	 * Update elementor option in the database.
	 *
	 * @since 1.4.0
	 * @access public
	 * @static
	 *
	 * @param string $option Option name. Expected to not be SQL-escaped.
	 * @param mixed  $value  Option value. Must be serializable if non-scalar.
	 *                       Expected to not be SQL-escaped.
	 *
	 * @return bool False if value was not updated and true if value was updated.
	 */
	public static function set( $option, $value ) {
		return update_option( self::OPTION_PREFIX . $option, $value );
	}

	/**
	 * Body class.
	 *
	 * Add "Maintenance Mode" CSS classes to the body tag.
	 *
	 * Fired by `body_class` filter.
	 *
	 * @since 1.4.0
	 * @access public
	 *
	 * @param array $classes An array of body classes.
	 *
	 * @return array An array of body classes.
	 */
	public function body_class( $classes ) {
		$classes[] = 'elementor-maintenance-mode';

		return $classes;
	}

	/**
	 * Template redirect.
	 *
	 * Redirect to the "Maintenance Mode" template.
	 *
	 * Fired by `template_redirect` action.
	 *
	 * @since 1.4.0
	 * @access public
	 */
	public function template_redirect() {
		if ( Plugin::$instance->preview->is_preview_mode() ) {
			return;
		}

		$user = wp_get_current_user();

		$is_login_page = false;

		/**
		 * Is login page
		 *
		 * Filters whether the maintenance mode displaying the login page or a regular page.
		 *
		 * @since 1.0.4
		 *
		 * @param bool $is_login_page Whether its a login page.
		 */
		$is_login_page = apply_filters( 'elementor/maintenance_mode/is_login_page', $is_login_page );

		if ( $is_login_page ) {
			return;
		}

		if ( Exclude_Mode::is_logged_in() && is_user_logged_in() ) {
			return;
		}

		if ( Exclude_Mode::is_custom() ) {
			$exclude_roles = Exclude_Roles::get_value();
			$user_roles = $user->roles;

			if ( is_multisite() && is_super_admin() ) {
				$user_roles[] = 'super_admin';
			}

			$compare_roles = array_intersect( $user_roles, $exclude_roles );

			if ( ! empty( $compare_roles ) ) {
				return;
			}
		}

		add_filter( 'body_class', [ $this, 'body_class' ] );

		if ( Mode::is_maintenance() ) {
			$protocol = wp_get_server_protocol();
			header( "$protocol 503 Service Unavailable", true, 503 );
			header( 'Content-Type: text/html; charset=utf-8' );
			header( 'Retry-After: 600' );
		}

		// Setup global post for Elementor\frontend so `_has_elementor_in_page = true`.
		$GLOBALS['post'] = get_post( Template_Id::get_value() ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited

		// Set the template as `$wp_query->current_object` for `wp_title` and etc.
		query_posts( [
			'p' => Template_Id::get_value(),
			'post_type' => Source_Local::CPT,
		] );
	}

	/**
	 * Register settings fields.
	 *
	 * Adds new "Maintenance Mode" settings fields to Elementor admin page.
	 *
	 * The method need to receive the an instance of the Tools settings page
	 * to add the new maintenance mode functionality.
	 *
	 * Fired by `elementor/admin/after_create_settings/{$page_id}` action.
	 *
	 * @since 1.4.0
	 * @access public
	 *
	 * @param Tools $tools An instance of the Tools settings page.
	 */
	public function register_settings_fields( Tools $tools ) {
		ob_start();

		$this->print_template_description();

		$template_description = ob_get_clean();

		$tools->add_tab(
			'maintenance_mode', [
				'label' => esc_html__( 'Maintenance Mode', 'elementor' ),
				'sections' => [
					'maintenance_mode' => [
						'callback' => function() {
							echo '<h2>' . esc_html__( 'Maintenance Mode', 'elementor' ) . '</h2>';
							echo '<div>' . esc_html__( 'Set your entire website as MAINTENANCE MODE, meaning the site is offline temporarily for maintenance, or set it as COMING SOON mode, meaning the site is offline until it is ready to be launched.', 'elementor' ) . '</div>';
						},
						'fields' => [
							Mode::get_key() => [
								'label' => esc_html__( 'Choose Mode', 'elementor' ),
								'field_args' => [
									'type' => 'select',
									'std' => '',
									'options' => Mode::get_options(),
									'desc' => '<div class="elementor-maintenance-mode-description" data-value="" style="display: none">' .
												esc_html__( 'Choose between Coming Soon mode (returning HTTP 200 code) or Maintenance Mode (returning HTTP 503 code).', 'elementor' ) .
												'</div>' .
												'<div class="elementor-maintenance-mode-description" data-value="maintenance" style="display: none">' .
												esc_html__( 'Maintenance Mode returns HTTP 503 code, so search engines know to come back a short time later. It is not recommended to use this mode for more than a couple of days.', 'elementor' ) .
												'</div>' .
												'<div class="elementor-maintenance-mode-description" data-value="coming_soon" style="display: none">' .
												esc_html__( 'Coming Soon returns HTTP 200 code, meaning the site is ready to be indexed.', 'elementor' ) .
												'</div>',
								],
							],
							Exclude_Mode::get_key() => [
								'label' => esc_html__( 'Who Can Access', 'elementor' ),
								'field_args' => [
									'class' => 'elementor-default-hide',
									'type' => 'select',
									'std' => Exclude_Mode::get_default(),
									'options' => Exclude_Mode::get_options(),
								],
							],
							Exclude_Roles::get_key() => [
								'label' => esc_html__( 'Roles', 'elementor' ),
								'field_args' => [
									'class' => 'elementor-default-hide',
									'type' => 'checkbox_list_roles',
								],
								'setting_args' => [ __NAMESPACE__ . '\Settings_Validations', 'checkbox_list' ],
							],
							Template_Id::get_key() => [
								'label' => esc_html__( 'Choose Template', 'elementor' ),
								'field_args' => [
									'class' => 'elementor-default-hide',
									'type' => 'select',
									'std' => Template_Id::get_default(),
									'show_select' => true,
									'options' => Template_Id::get_options(),
									'desc' => $template_description,
								],
							],
						],
					],
				],
			]
		);
	}

	/**
	 * Add menu in admin bar.
	 *
	 * Adds "Maintenance Mode" items to the WordPress admin bar.
	 *
	 * Fired by `admin_bar_menu` filter.
	 *
	 * @since 1.4.0
	 * @access public
	 *
	 * @param \WP_Admin_Bar $wp_admin_bar WP_Admin_Bar instance, passed by reference.
	 */
	public function add_menu_in_admin_bar( \WP_Admin_Bar $wp_admin_bar ) {
		$wp_admin_bar->add_node( [
			'id' => 'elementor-maintenance-on',
			'title' => esc_html__( 'Maintenance Mode ON', 'elementor' ),
			'href' => Tools::get_url() . '#tab-maintenance_mode',
		] );

		$document = Plugin::$instance->documents->get( Template_Id::get_value() );

		$wp_admin_bar->add_node( [
			'id' => 'elementor-maintenance-edit',
			'parent' => 'elementor-maintenance-on',
			'title' => esc_html__( 'Edit Template', 'elementor' ),
			'href' => $document ? $document->get_edit_url() : '',
		] );
	}

	/**
	 * Print style.
	 *
	 * Adds custom CSS to the HEAD html tag. The CSS that emphasise the maintenance
	 * mode with red colors.
	 *
	 * Fired by `admin_head` and `wp_head` filters.
	 *
	 * @since 1.4.0
	 * @access public
	 */
	public function print_style() {
		?>
		<style>#wp-admin-bar-elementor-maintenance-on > a { background-color: #dc3232; }
			#wp-admin-bar-elementor-maintenance-on > .ab-item:before { content: "\f160"; top: 2px; }</style>
		<?php
	}

	/**
	 * @param $old_value
	 * @param $value
	 *
	 * @deprecated 3.14.0 Use `Site_Maintenance_Mode_Mode::on_wp_change()` instead.
	 * @return void
	 */
	public function on_update_mode( $old_value, $value ) {
		Mode::on_wp_change( $value, $old_value );
	}

	/**
	 * Maintenance mode constructor.
	 *
	 * Initializing Elementor maintenance mode.
	 *
	 * @since 1.4.0
	 * @access public
	 */
	public function __construct() {
		$is_enabled = ! Mode::is_disabled() && (bool) Template_Id::get_value();

		if ( is_admin() ) {
			$page_id = Tools::PAGE_ID;
			add_action( "elementor/admin/after_create_settings/{$page_id}", [ $this, 'register_settings_fields' ] );
		}

		if ( ! $is_enabled ) {
			return;
		}

		add_action( 'admin_bar_menu', [ $this, 'add_menu_in_admin_bar' ], 300 );
		add_action( 'admin_head', [ $this, 'print_style' ] );
		add_action( 'wp_head', [ $this, 'print_style' ] );

		// Priority = 11 that is *after* WP default filter `redirect_canonical` in order to avoid redirection loop.
		add_action( 'template_redirect', [ $this, 'template_redirect' ], 11 );
	}

	/**
	 * Print Template Description
	 *
	 * Prints the template description
	 *
	 * @since 2.2.0
	 * @access private
	 */
	private function print_template_description() {
		$template_id = Template_Id::get_value();

		$edit_url = '';

		if ( $template_id && get_post( $template_id ) ) {
			$edit_url = Plugin::$instance->documents->get( $template_id )->get_edit_url();
		}

		?>
		<a target="_blank" class="elementor-edit-template" style="display: none" href="<?php echo esc_url( $edit_url ); ?>"><?php echo esc_html__( 'Edit Template', 'elementor' ); ?></a>
		<div class="elementor-maintenance-mode-error"><?php echo esc_html__( 'To enable maintenance mode you have to set a template for the maintenance mode page.', 'elementor' ); ?></div>
		<div class="elementor-maintenance-mode-error">
			<?php
				printf(
					/* translators: %1$s Link open tag, %2$s: Link close tag. */
					esc_html__( 'Select one or go ahead and %1$screate one%2$s now.', 'elementor' ),
					'<a target="_blank" href="' . esc_url( admin_url( 'post-new.php?post_type=' . Source_Local::CPT ) ) . '">',
					'</a>'
				);
			?>
		</div>
		<?php
	}
}
