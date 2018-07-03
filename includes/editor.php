<?php
namespace Elementor;

use Elementor\Core\Responsive\Responsive;
use Elementor\Core\Settings\Manager as SettingsManager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor editor.
 *
 * Elementor editor handler class is responsible for initializing Elementor
 * editor and register all the actions needed to display the editor.
 *
 * @since 1.0.0
 */
class Editor {

	/**
	 * The nonce key for Elementor editor.
	 */
	const EDITING_NONCE_KEY = 'elementor-editing';

	/**
	 * User capability required to access Elementor editor.
	 */
	const EDITING_CAPABILITY = 'edit_posts';

	/**
	 * Post ID.
	 *
	 * Holds the ID of the current post being edited.
	 *
	 * @since 1.0.0
	 * @access private
	 *
	 * @var int Post ID.
	 */
	private $_post_id;

	/**
	 * Whether the edit mode is active.
	 *
	 * Used to determine whether we are in edit mode.
	 *
	 * @since 1.0.0
	 * @access private
	 *
	 * @var bool Whether the edit mode is active.
	 */
	private $_is_edit_mode;

	/**
	 * Editor templates.
	 *
	 * Holds the editor templates used by Marionette.js.
	 *
	 * @since 1.0.0
	 * @access private
	 *
	 * @var array Editor templates.
	 */
	private $_editor_templates = [];

	/**
	 * Init.
	 *
	 * Initialize Elementor editor. Registers all needed actions to run Elementor,
	 * removes conflicting actions etc.
	 *
	 * Fired by `admin_action_elementor` action.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param bool $die Optional. Whether to die at the end. Default is `true`.
	 */
	public function init( $die = true ) {
		if ( empty( $_REQUEST['post'] ) ) { // WPCS: CSRF ok.
			return;
		}

		$this->_post_id = absint( $_REQUEST['post'] );

		if ( ! $this->is_edit_mode( $this->_post_id ) ) {
			return;
		}

		// Send MIME Type header like WP admin-header.
		@header( 'Content-Type: ' . get_option( 'html_type' ) . '; charset=' . get_option( 'blog_charset' ) );

		// Use requested id and not the global in order to avoid conflicts with plugins that changes the global post.
		query_posts( [
			'p' => $this->_post_id,
			'post_type' => get_post_type( $this->_post_id ),
		] );

		Plugin::$instance->db->switch_to_post( $this->_post_id );

		add_filter( 'show_admin_bar', '__return_false' );

		// Remove all WordPress actions
		remove_all_actions( 'wp_head' );
		remove_all_actions( 'wp_print_styles' );
		remove_all_actions( 'wp_print_head_scripts' );
		remove_all_actions( 'wp_footer' );

		// Handle `wp_head`
		add_action( 'wp_head', 'wp_enqueue_scripts', 1 );
		add_action( 'wp_head', 'wp_print_styles', 8 );
		add_action( 'wp_head', 'wp_print_head_scripts', 9 );
		add_action( 'wp_head', 'wp_site_icon' );
		add_action( 'wp_head', [ $this, 'editor_head_trigger' ], 30 );

		// Handle `wp_footer`
		add_action( 'wp_footer', 'wp_print_footer_scripts', 20 );
		add_action( 'wp_footer', 'wp_auth_check_html', 30 );
		add_action( 'wp_footer', [ $this, 'wp_footer' ] );

		// Handle `wp_enqueue_scripts`
		remove_all_actions( 'wp_enqueue_scripts' );

		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ], 999999 );
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_styles' ], 999999 );

		// Change mode to Builder
		Plugin::$instance->db->set_is_elementor_page( $this->_post_id );

		// Post Lock
		if ( ! $this->get_locked_user( $this->_post_id ) ) {
			$this->lock_post( $this->_post_id );
		}

		// Setup default heartbeat options
		add_filter( 'heartbeat_settings', function( $settings ) {
			$settings['interval'] = 15;
			return $settings;
		} );

		// Tell to WP Cache plugins do not cache this request.
		Utils::do_not_cache();

		// Print the panel
		$this->print_panel_html();

		// From the action it's an empty string, from tests its `false`
		if ( false !== $die ) {
			die;
		}
	}

	/**
	 * Retrieve post ID.
	 *
	 * Get the ID of the current post.
	 *
	 * @since 1.8.0
	 * @access public
	 *
	 * @return int Post ID.
	 */
	public function get_post_id() {
		return $this->_post_id;
	}

	/**
	 * Redirect to new URL.
	 *
	 * Used as a fallback function for the old URL structure of Elementor page
	 * edit URL.
	 *
	 * Fired by `template_redirect` action.
	 *
	 * @since 1.6.0
	 * @access public
	 */
	public function redirect_to_new_url() {
		if ( ! isset( $_GET['elementor'] ) ) {
			return;
		}

		$post_id = get_the_ID();

		if ( ! User::is_current_user_can_edit( $post_id ) || ! Plugin::$instance->db->is_built_with_elementor( $post_id ) ) {
			return;
		}

		wp_redirect( Utils::get_edit_link( $post_id ) );
		die;
	}

	/**
	 * Whether the edit mode is active.
	 *
	 * Used to determine whether we are in the edit mode.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param int $post_id Optional. Post ID. Default is `null`, the current
	 *                     post ID.
	 *
	 * @return bool Whether the edit mode is active.
	 */
	public function is_edit_mode( $post_id = null ) {
		if ( null !== $this->_is_edit_mode ) {
			return $this->_is_edit_mode;
		}

		if ( empty( $post_id ) ) {
			$post_id = $this->_post_id;
		}

		if ( ! User::is_current_user_can_edit( $post_id ) ) {
			return false;
		}

		// Ajax request as Editor mode
		$actions = [
			'elementor',

			// Templates
			'elementor_get_templates',
			'elementor_save_template',
			'elementor_get_template',
			'elementor_delete_template',
			'elementor_export_template',
			'elementor_import_template',
		];

		if ( isset( $_REQUEST['action'] ) && in_array( $_REQUEST['action'], $actions ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Lock post.
	 *
	 * Mark the post as currently being edited by the current user.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param int $post_id The ID of the post being edited.
	 */
	public function lock_post( $post_id ) {
		if ( ! function_exists( 'wp_set_post_lock' ) ) {
			require_once( ABSPATH . 'wp-admin/includes/post.php' );
		}

		wp_set_post_lock( $post_id );
	}

	/**
	 * Get locked user.
	 *
	 * Check what user is currently editing the post.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param int $post_id The ID of the post being edited.
	 *
	 * @return \WP_User|false User information or false if the post is not locked.
	 */
	public function get_locked_user( $post_id ) {
		if ( ! function_exists( 'wp_check_post_lock' ) ) {
			require_once( ABSPATH . 'wp-admin/includes/post.php' );
		}

		$locked_user = wp_check_post_lock( $post_id );
		if ( ! $locked_user ) {
			return false;
		}

		return get_user_by( 'id', $locked_user );
	}

	/**
	 * Print panel HTML.
	 *
	 * Include the wrapper template of the editor.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function print_panel_html() {
		include( 'editor-templates/editor-wrapper.php' );
	}

	/**
	 * Enqueue scripts.
	 *
	 * Registers all the editor scripts and enqueues them.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function enqueue_scripts() {
		remove_action( 'wp_enqueue_scripts', [ $this, __FUNCTION__ ], 999999 );

		// Set the global data like $post, $authordata and etc
		setup_postdata( $this->_post_id );

		global $wp_styles, $wp_scripts;

		$plugin = Plugin::$instance;

		// Reset global variable
		$wp_styles = new \WP_Styles(); // WPCS: override ok.
		$wp_scripts = new \WP_Scripts(); // WPCS: override ok.

		$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG || defined( 'ELEMENTOR_TESTS' ) && ELEMENTOR_TESTS ) ? '' : '.min';

		// Hack for waypoint with editor mode.
		wp_register_script(
			'elementor-waypoints',
			ELEMENTOR_ASSETS_URL . 'lib/waypoints/waypoints-for-editor.js',
			[
				'jquery',
			],
			'4.0.2',
			true
		);

		wp_register_script(
			'backbone-marionette',
			ELEMENTOR_ASSETS_URL . 'lib/backbone/backbone.marionette' . $suffix . '.js',
			[
				'backbone',
			],
			'2.4.5',
			true
		);

		wp_register_script(
			'backbone-radio',
			ELEMENTOR_ASSETS_URL . 'lib/backbone/backbone.radio' . $suffix . '.js',
			[
				'backbone',
			],
			'1.0.4',
			true
		);

		wp_register_script(
			'perfect-scrollbar',
			ELEMENTOR_ASSETS_URL . 'lib/perfect-scrollbar/perfect-scrollbar.jquery' . $suffix . '.js',
			[
				'jquery',
			],
			'0.6.12',
			true
		);

		wp_register_script(
			'jquery-easing',
			ELEMENTOR_ASSETS_URL . 'lib/jquery-easing/jquery-easing' . $suffix . '.js',
			[
				'jquery',
			],
			'1.3.2',
			true
		);

		wp_register_script(
			'nprogress',
			ELEMENTOR_ASSETS_URL . 'lib/nprogress/nprogress' . $suffix . '.js',
			[],
			'0.2.0',
			true
		);

		wp_register_script(
			'tipsy',
			ELEMENTOR_ASSETS_URL . 'lib/tipsy/tipsy' . $suffix . '.js',
			[
				'jquery',
			],
			'1.0.0',
			true
		);

		wp_register_script(
			'jquery-elementor-select2',
			ELEMENTOR_ASSETS_URL . 'lib/e-select2/js/e-select2.full' . $suffix . '.js',
			[
				'jquery',
			],
			'4.0.6-rc.1',
			true
		);

		wp_register_script(
			'flatpickr',
			ELEMENTOR_ASSETS_URL . 'lib/flatpickr/flatpickr' . $suffix . '.js',
			[
				'jquery',
			],
			'1.12.0',
			true
		);

		wp_register_script(
			'ace',
			'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.5/ace.js',
			[],
			'1.2.5',
			true
		);

		wp_register_script(
			'ace-language-tools',
			'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.5/ext-language_tools.js',
			[
				'ace',
			],
			'1.2.5',
			true
		);

		wp_register_script(
			'elementor-dialog',
			ELEMENTOR_ASSETS_URL . 'lib/dialog/dialog' . $suffix . '.js',
			[
				'jquery-ui-position',
			],
			'4.4.1',
			true
		);

		wp_register_script(
			'elementor-editor',
			ELEMENTOR_ASSETS_URL . 'js/editor' . $suffix . '.js',
			[
				'wp-auth-check',
				'jquery-ui-sortable',
				'jquery-ui-resizable',
				'backbone-marionette',
				'backbone-radio',
				'perfect-scrollbar',
				'nprogress',
				'tipsy',
				'imagesloaded',
				'heartbeat',
				'jquery-elementor-select2',
				'flatpickr',
				'elementor-dialog',
				'ace',
				'ace-language-tools',
			],
			ELEMENTOR_VERSION,
			true
		);

		/**
		 * Before editor enqueue scripts.
		 *
		 * Fires before Elementor editor scripts are enqueued.
		 *
		 * @since 1.0.0
		 */
		do_action( 'elementor/editor/before_enqueue_scripts' );

		$document = Plugin::$instance->documents->get_doc_or_auto_save( $this->_post_id );

		// Get document data *after* the scripts hook - so plugins can run compatibility before get data, but *before* enqueue the editor script - so elements can enqueue their own scripts that depended in editor script.
		$editor_data = $document->get_elements_raw_data( null, true );

		wp_enqueue_script( 'elementor-editor' );

		// Tweak for WP Admin menu icons
		wp_print_styles( 'editor-buttons' );

		$locked_user = $this->get_locked_user( $this->_post_id );

		if ( $locked_user ) {
			$locked_user = $locked_user->display_name;
		}

		$page_title_selector = get_option( 'elementor_page_title_selector' );

		if ( empty( $page_title_selector ) ) {
			$page_title_selector = 'h1.entry-title';
		}

		$post_type_object = get_post_type_object( $document->get_main_post()->post_type );
		$current_user_can_publish = current_user_can( $post_type_object->cap->publish_posts );

		$config = [
			'version' => ELEMENTOR_VERSION,
			'ajaxurl' => admin_url( 'admin-ajax.php' ),
			'home_url' => home_url(),
			'nonce' => $this->create_nonce( get_post_type() ),
			'data' => $editor_data,
			// @TODO: `post_id` is bc since 2.0.0
			'post_id' => $this->_post_id,
			'document' => $document->get_config(),
			'autosave_interval' => AUTOSAVE_INTERVAL,
			'current_user_can_publish' => $current_user_can_publish,
			'controls' => $plugin->controls_manager->get_controls_data(),
			'elements' => $plugin->elements_manager->get_element_types_config(),
			'widgets' => $plugin->widgets_manager->get_widget_types_config(),
			'schemes' => [
				'items' => $plugin->schemes_manager->get_registered_schemes_data(),
				'enabled_schemes' => Schemes_Manager::get_enabled_schemes(),
			],
			'default_schemes' => $plugin->schemes_manager->get_schemes_defaults(),
			'settings' => SettingsManager::get_settings_managers_config(),
			'system_schemes' => $plugin->schemes_manager->get_system_schemes(),
			'wp_editor' => $this->get_wp_editor_config(),
			'settings_page_link' => Settings::get_url(),
			'elementor_site' => 'https://go.elementor.com/about-elementor/',
			'docs_elementor_site' => 'https://go.elementor.com/docs/',
			'help_the_content_url' => 'https://go.elementor.com/the-content-missing/',
			'help_preview_error_url' => 'https://go.elementor.com/preview-not-loaded/',
			'help_right_click_url' => 'https://go.elementor.com/meet-right-click/',
			'assets_url' => ELEMENTOR_ASSETS_URL,
			'locked_user' => $locked_user,
			'user' => [
				'restrictions' => $plugin->role_manager->get_user_restrictions_array(),
				'is_administrator' => current_user_can( 'manage_options' ),
				'introduction' => User::is_should_view_introduction()
			],
			'is_rtl' => is_rtl(),
			'locale' => get_locale(),
			'rich_editing_enabled' => filter_var( get_user_meta( get_current_user_id(), 'rich_editing', true ), FILTER_VALIDATE_BOOLEAN ),
			'page_title_selector' => $page_title_selector,
			'tinymceHasCustomConfig' => class_exists( 'Tinymce_Advanced' ),
			'inlineEditing' => Plugin::$instance->widgets_manager->get_inline_editing_config(),
			'dynamicTags' => Plugin::$instance->dynamic_tags->get_config(),
			'i18n' => [
				'elementor' => __( 'Elementor', 'elementor' ),
				'delete' => __( 'Delete', 'elementor' ),
				'cancel' => __( 'Cancel', 'elementor' ),
				/* translators: %s: Element name. */
				'edit_element' => __( 'Edit %s', 'elementor' ),

				// Menu.
				'about_elementor' => __( 'About Elementor', 'elementor' ),
				'color_picker' => __( 'Color Picker', 'elementor' ),
				'elementor_settings' => __( 'Dashboard Settings', 'elementor' ),
				'global_colors' => __( 'Default Colors', 'elementor' ),
				'global_fonts' => __( 'Default Fonts', 'elementor' ),
				'global_style' => __( 'Style', 'elementor' ),
				'settings' => __( 'Settings', 'elementor' ),

				// Elements.
				'inner_section' => __( 'Columns', 'elementor' ),

				// Control Order.
				'asc' => __( 'Ascending order', 'elementor' ),
				'desc' => __( 'Descending order', 'elementor' ),

				// Clear Page.
				'clear_page' => __( 'Delete All Content', 'elementor' ),
				'dialog_confirm_clear_page' => __( 'Attention: We are going to DELETE ALL CONTENT from this page. Are you sure you want to do that?', 'elementor' ),

				// Panel Preview Mode.
				'back_to_editor' => __( 'Show Panel', 'elementor' ),
				'preview' => __( 'Hide Panel', 'elementor' ),

				// Inline Editing.
				'type_here' => __( 'Type Here', 'elementor' ),

				// Library.
				'an_error_occurred' => __( 'An error occurred', 'elementor' ),
				'category' => __( 'Category', 'elementor' ),
				'delete_template' => __( 'Delete Template', 'elementor' ),
				'delete_template_confirm' => __( 'Are you sure you want to delete this template?', 'elementor' ),
				'import_template_dialog_header' => __( 'Import Document Settings', 'elementor' ),
				'import_template_dialog_message' => __( 'Do you want to also import the document settings of the template?', 'elementor' ),
				'import_template_dialog_message_attention' => __( 'Attention: Importing may override previous settings.', 'elementor' ),
				'library' => __( 'Library', 'elementor' ),
				'no' => __( 'No', 'elementor' ),
				'page' => __( 'Page', 'elementor' ),
				/* translators: %s: Template type. */
				'save_your_template' => __( 'Save Your %s to Library', 'elementor' ),
				'save_your_template_description' => __( 'Your designs will be available for export and reuse on any page or website', 'elementor' ),
				'section' => __( 'Section', 'elementor' ),
				'templates_empty_message' => __( 'This is where your templates should be. Design it. Save it. Reuse it.', 'elementor' ),
				'templates_empty_title' => __( 'Haven’t Saved Templates Yet?', 'elementor' ),
				'templates_no_favorites_message' => __( 'You can mark any pre-designed template as a favorite.', 'elementor' ),
				'templates_no_favorites_title' => __( 'No Favorite Templates', 'elementor' ),
				'templates_no_results_message' => __( 'Please make sure your search is spelled correctly or try a different words.', 'elementor' ),
				'templates_no_results_title' => __( 'No Results Found', 'elementor' ),
				'templates_request_error' => __( 'The following error(s) occurred while processing the request:', 'elementor' ),
				'yes' => __( 'Yes', 'elementor' ),

				// Incompatible Device.
				'device_incompatible_header' => __( 'Your browser isn\'t compatible', 'elementor' ),
				'device_incompatible_message' => __( 'Your browser isn\'t compatible with all of Elementor\'s editing features. We recommend you switch to another browser like Chrome or Firefox.', 'elementor' ),
				'proceed_anyway' => __( 'Proceed Anyway', 'elementor' ),

				// Preview not loaded.
				'learn_more' => __( 'Learn More', 'elementor' ),
				'preview_el_not_found_header' => __( 'Sorry, the content area was not found in your page.', 'elementor' ),
				'preview_el_not_found_message' => __( 'You must call \'the_content\' function in the current template, in order for Elementor to work on this page.', 'elementor' ),
				'preview_not_loading_header' => __( 'The preview could not be loaded', 'elementor' ),
				'preview_not_loading_message' => __( 'We\'re sorry, but something went wrong. Click on \'Learn more\' and follow each of the steps to quickly solve it.', 'elementor' ),

				// Gallery.
				'delete_gallery' => __( 'Reset Gallery', 'elementor' ),
				'dialog_confirm_gallery_delete' => __( 'Are you sure you want to reset this gallery?', 'elementor' ),
				/* translators: %s: The number of images. */
				'gallery_images_selected' => __( '%s Images Selected', 'elementor' ),
				'gallery_no_images_selected' => __( 'No Images Selected', 'elementor' ),
				'insert_media' => __( 'Insert Media', 'elementor' ),

				// Take Over.
				/* translators: %s: User name. */
				'dialog_user_taken_over' => __( '%s has taken over and is currently editing. Do you want to take over this page editing?', 'elementor' ),
				'go_back' => __( 'Go Back', 'elementor' ),
				'take_over' => __( 'Take Over', 'elementor' ),

				// Revisions.
				/* translators: %s: Element type. */
				'delete_element' => __( 'Delete %s', 'elementor' ),
				/* translators: %s: Template type. */
				'dialog_confirm_delete' => __( 'Are you sure you want to remove this %s?', 'elementor' ),

				// Saver.
				'before_unload_alert' => __( 'Please note: All unsaved changes will be lost.', 'elementor' ),
				'published' => __( 'Published', 'elementor' ),
				'publish' => __( 'Publish', 'elementor' ),
				'save' => __( 'Save', 'elementor' ),
				'saved' => __( 'Saved', 'elementor' ),
				'update' => __( 'Update', 'elementor' ),
				'submit' => __( 'Submit', 'elementor' ),
				'working_on_draft_notification' => __( 'This is just a draft. Play around and when you\'re done - click update.', 'elementor' ),
				'keep_editing' => __( 'Keep Editing', 'elementor' ),
				'have_a_look' => __( 'Have a look', 'elementor' ),
				'view_all_revisions' => __( 'View All Revisions', 'elementor' ),
				'dismiss' => __( 'Dismiss', 'elementor' ),
				'saving_disabled' => __( 'Saving has been disabled until you’re reconnected.', 'elementor' ),

				// Ajax
				'server_error' => __( 'Server Error', 'elementor' ),
				'server_connection_lost' => __( 'Connection Lost', 'elementor' ),
				'unknown_error' => __( 'Unknown Error', 'elementor' ),

				// Context Menu
				'duplicate' => __( 'Duplicate', 'elementor' ),
				'copy' => __( 'Copy', 'elementor' ),
				'paste' => __( 'Paste', 'elementor' ),
				'copy_style' => __( 'Copy Style', 'elementor' ),
				'paste_style' => __( 'Paste Style', 'elementor' ),
				'reset_style' => __( 'Reset Style', 'elementor' ),
				'save_as_global' => __( 'Save as a Global', 'elementor' ),
				'save_as_block' => __( 'Save as Template', 'elementor' ),
				'new_column' => __( 'Add New Column', 'elementor' ),
				'copy_all_content' => __( 'Copy All Content', 'elementor' ),
				'delete_all_content' => __( 'Delete All Content', 'elementor' ),

				// Right Click Introduction
				'meet_right_click_header' => __( 'Meet Right Click', 'elementor' ),
				'meet_right_click_message' => __( 'Now you can access all editing actions using right click.', 'elementor' ),
				'got_it' => __( 'Got It', 'elementor' ),

				// TODO: Remove.
				'autosave' => __( 'Autosave', 'elementor' ),
				'elementor_docs' => __( 'Documentation', 'elementor' ),
				'reload_page' => __( 'Reload Page', 'elementor' ),
				'session_expired_header' => __( 'Timeout', 'elementor' ),
				'session_expired_message' => __( 'Your session has expired. Please reload the page to continue editing.', 'elementor' ),
				'soon' => __( 'Soon', 'elementor' ),
				'unknown_value' => __( 'Unknown Value', 'elementor' ),
			],
		];

		$localized_settings = [];

		/**
		 * Localize editor settings.
		 *
		 * Filters the editor localized settings.
		 *
		 * @since 1.0.0
		 *
		 * @param array $localized_settings Localized settings.
		 * @param int   $post_id            The ID of the current post being edited.
		 */
		$localized_settings = apply_filters( 'elementor/editor/localize_settings', $localized_settings, $this->_post_id );

		if ( ! empty( $localized_settings ) ) {
			$config = array_replace_recursive( $config, $localized_settings );
		}

		echo '<script>' . PHP_EOL;
		echo '/* <![CDATA[ */' . PHP_EOL;
		$config_json = wp_json_encode( $config );
		unset( $config );

		if ( get_option( 'elementor_editor_break_lines' ) ) {
			// Add new lines to avoid memory limits in some hosting servers that handles the buffer output according to new line characters
			$config_json = str_replace( '}},"', '}},' . PHP_EOL . '"', $config_json );
		}

		echo 'var ElementorConfig = ' . $config_json . ';' . PHP_EOL;
		echo '/* ]]> */' . PHP_EOL;
		echo '</script>';

		$plugin->controls_manager->enqueue_control_scripts();

		/**
		 * After editor enqueue scripts.
		 *
		 * Fires after Elementor editor scripts are enqueued.
		 *
		 * @since 1.0.0
		 */
		do_action( 'elementor/editor/after_enqueue_scripts' );
	}

	/**
	 * Enqueue styles.
	 *
	 * Registers all the editor styles and enqueues them.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function enqueue_styles() {
		/**
		 * Before editor enqueue styles.
		 *
		 * Fires before Elementor editor styles are enqueued.
		 *
		 * @since 1.0.0
		 */
		do_action( 'elementor/editor/before_enqueue_styles' );

		$suffix = Utils::is_script_debug() ? '' : '.min';

		$direction_suffix = is_rtl() ? '-rtl' : '';

		wp_register_style(
			'font-awesome',
			ELEMENTOR_ASSETS_URL . 'lib/font-awesome/css/font-awesome' . $suffix . '.css',
			[],
			'4.7.0'
		);

		wp_register_style(
			'elementor-select2',
			ELEMENTOR_ASSETS_URL . 'lib/e-select2/css/e-select2' . $suffix . '.css',
			[],
			'4.0.6-rc.1'
		);

		wp_register_style(
			'elementor-icons',
			ELEMENTOR_ASSETS_URL . 'lib/eicons/css/elementor-icons' . $suffix . '.css',
			[],
			'3.6.0'
		);

		wp_register_style(
			'google-font-roboto',
			'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
			[],
			ELEMENTOR_VERSION
		);

		wp_register_style(
			'flatpickr',
			ELEMENTOR_ASSETS_URL . 'lib/flatpickr/flatpickr' . $suffix . '.css',
			[],
			'1.12.0'
		);

		wp_register_style(
			'elementor-editor',
			ELEMENTOR_ASSETS_URL . 'css/editor' . $direction_suffix . $suffix . '.css',
			[
				'font-awesome',
				'elementor-select2',
				'elementor-icons',
				'wp-auth-check',
				'google-font-roboto',
				'flatpickr',
			],
			ELEMENTOR_VERSION
		);

		wp_enqueue_style( 'elementor-editor' );

		if ( Responsive::has_custom_breakpoints() ) {
			$breakpoints = Responsive::get_breakpoints();

			wp_add_inline_style( 'elementor-editor', '.elementor-device-tablet #elementor-preview-responsive-wrapper { width: ' . $breakpoints['md'] . 'px; }' );
		}

		/**
		 * After editor enqueue styles.
		 *
		 * Fires after Elementor editor styles are enqueued.
		 *
		 * @since 1.0.0
		 */
		do_action( 'elementor/editor/after_enqueue_styles' );
	}

	/**
	 * Get WordPress editor config.
	 *
	 * Config the default WordPress editor with custom settings for Elementor use.
	 *
	 * @since 1.9.0
	 * @access private
	 */
	private function get_wp_editor_config() {
		// Remove all TinyMCE plugins.
		remove_all_filters( 'mce_buttons', 10 );
		remove_all_filters( 'mce_external_plugins', 10 );

		if ( ! class_exists( '\_WP_Editors', false ) ) {
			require( ABSPATH . WPINC . '/class-wp-editor.php' );
		}

		// WordPress 4.8 and higher
		if ( method_exists( '\_WP_Editors', 'print_tinymce_scripts' ) ) {
			\_WP_Editors::print_default_editor_scripts();
			\_WP_Editors::print_tinymce_scripts();
		}
		ob_start();

		wp_editor(
			'%%EDITORCONTENT%%',
			'elementorwpeditor',
			[
				'editor_class' => 'elementor-wp-editor',
				'editor_height' => 250,
				'drag_drop_upload' => true,
			]
		);

		$config = ob_get_clean();

		// Don't call \_WP_Editors methods again
		remove_action( 'admin_print_footer_scripts', [ '_WP_Editors', 'editor_js' ], 50 );
		remove_action( 'admin_print_footer_scripts', [ '_WP_Editors', 'print_default_editor_scripts' ], 45 );

		\_WP_Editors::editor_js();

		return $config;
	}

	/**
	 * Editor head trigger.
	 *
	 * Fires the 'elementor/editor/wp_head' action in the head tag in Elementor
	 * editor.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function editor_head_trigger() {
		/**
		 * Elementor editor head.
		 *
		 * Fires on Elementor editor head tag.
		 *
		 * Used to prints scripts or any other data in the head tag.
		 *
		 * @since 1.0.0
		 */
		do_action( 'elementor/editor/wp_head' );
	}

	/**
	 * Add editor template.
	 *
	 * Registers new editor templates.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param string $template Can be either a link to template file or template
	 *                         HTML content.
	 * @param string $type     Optional. Whether to handle the template as path
	 *                         or text. Default is `path`.
	 */
	public function add_editor_template( $template, $type = 'path' ) {
		if ( 'path' === $type ) {
			ob_start();

			include $template;

			$template = ob_get_clean();
		}

		$this->_editor_templates[] = $template;
	}

	/**
	 * WP footer.
	 *
	 * Prints Elementor editor with all the editor templates, and render controls,
	 * widgets and content elements.
	 *
	 * Fired by `wp_footer` action.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function wp_footer() {
		$plugin = Plugin::$instance;

		$plugin->controls_manager->render_controls();
		$plugin->widgets_manager->render_widgets_content();
		$plugin->elements_manager->render_elements_content();

		$plugin->schemes_manager->print_schemes_templates();

		$plugin->dynamic_tags->print_templates();

		$this->init_editor_templates();

		foreach ( $this->_editor_templates as $editor_template ) {
			echo $editor_template;
		}

		/**
		 * Elementor editor footer.
		 *
		 * Fires on Elementor editor before closing the body tag.
		 *
		 * Used to prints scripts or any other HTML before closing the body tag.
		 *
		 * @since 1.0.0
		 */
		do_action( 'elementor/editor/footer' );
	}

	/**
	 * Set edit mode.
	 *
	 * Used to update the edit mode.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param bool $edit_mode Whether the edit mode is active.
	 */
	public function set_edit_mode( $edit_mode ) {
		$this->_is_edit_mode = $edit_mode;
	}

	/**
	 * Editor constructor.
	 *
	 * Initializing Elementor editor and redirect from old URL structure of
	 * Elementor editor.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function __construct() {
		add_action( 'admin_action_elementor', [ $this, 'init' ] );
		add_action( 'template_redirect', [ $this, 'redirect_to_new_url' ] );
	}

	/**
	 * Create nonce.
	 *
	 * If the user has edit capabilities, it creates a cryptographic token to
	 * give him access to Elementor editor.
	 *
	 * @since 1.8.1
	 * @since 1.8.7 The `$post_type` parameter was introduces.
	 * @access public
	 *
	 * @param string $post_type The post type to check capabilities.
	 *
	 * @return null|string The nonce token, or `null` if the user has no edit
	 *                     capabilities.
	 */
	public function create_nonce( $post_type ) {
		$post_type_object = get_post_type_object( $post_type );
		$capability = $post_type_object->cap->{self::EDITING_CAPABILITY};

		if ( ! current_user_can( $capability ) ) {
			return null;
		}

		return wp_create_nonce( self::EDITING_NONCE_KEY );
	}

	/**
	 * Verify nonce.
	 *
	 * The user is given an amount of time to use the token, so therefore, since
	 * the user ID and `$action` remain the same, the independent variable is
	 * the time.
	 *
	 * @since 1.8.1
	 * @access public
	 *
	 * @param string $nonce Nonce that was used in the form to verify.
	 *
	 * @return false|int If the nonce is invalid it returns `false`. If the
	 *                   nonce is valid and generated between 0-12 hours ago it
	 *                   returns `1`. If the nonce is valid and generated
	 *                   between 12-24 hours ago it returns `2`.
	 */
	public function verify_nonce( $nonce ) {
		return wp_verify_nonce( $nonce, self::EDITING_NONCE_KEY );
	}

	/**
	 * Verify request nonce.
	 *
	 * Whether the request nonce verified or not.
	 *
	 * @since 1.8.1
	 * @access public
	 *
	 * @return bool True if request nonce verified, False otherwise.
	 */
	public function verify_request_nonce() {
		return ! empty( $_REQUEST['_nonce'] ) && $this->verify_nonce( $_REQUEST['_nonce'] );
	}

	/**
	 * Verify ajax nonce.
	 *
	 * Verify request nonce and send a JSON request, if not verified returns an
	 * error.
	 *
	 * @since 1.9.0
	 * @access public
	 */
	public function verify_ajax_nonce() {
		if ( ! $this->verify_request_nonce() ) {
			wp_send_json_error( new \WP_Error( 'token_expired', 'Nonce token expired.' ) );
		}
	}

	/**
	 * Init editor templates.
	 *
	 * Initialize default elementor templates used in the editor panel.
	 *
	 * @since 1.7.0
	 * @access private
	 */
	private function init_editor_templates() {
		$template_names = [
			'global',
			'panel',
			'panel-elements',
			'repeater',
			'templates',
		];

		foreach ( $template_names as $template_name ) {
			$this->add_editor_template( __DIR__ . "/editor-templates/$template_name.php" );
		}
	}
}
