<?php
namespace Elementor;

use Elementor\TemplateLibrary\Source_Local;

class Under_Construction {

	const OPTION_PREFIX = 'elementor_under_construction_';

	const MODE_MAINTENANCE = 'maintenance';
	const MODE_COMING_SOON = 'coming_soon';

	public static function get( $option, $default = false ) {
		return get_option( self::OPTION_PREFIX . $option, $default );
	}

	public static function set( $option, $value ) {
		return update_option( self::OPTION_PREFIX . $option, $value );
	}

	public function template_redirect() {
		if ( Plugin::$instance->preview->is_preview_mode() ) {
			return;
		}

		// Setup global post for Elementor\frontend so `_has_elementor_in_page = true`
		$GLOBALS['post'] = get_post( self::get( 'template_id' ) );

		add_filter( 'template_include', [ $this, 'template_include' ], 1 );
	}

	public function template_include( $template ) {
		// Set the template as `$wp_query->current_object` for `wp_title` and etc.
		query_posts( [
			'p' => self::get( 'template_id' ),
			'post_type' => Source_Local::CPT,
		] );

		if ( 'maintenance' === self::get( 'mode' ) ) {
			$protocol = wp_get_server_protocol();
			header( "$protocol 503 Service Unavailable", true, 503 );
			header( 'Content-Type: text/html; charset=utf-8' );
			header( 'Retry-After: 600' );
		}

		return $template;
	}

	public function register_settings_fields() {
		$controls_class_name = __NAMESPACE__ . '\Settings_Controls';
		$validations_class_name = __NAMESPACE__ . '\Settings_Validations';

		$under_construction_section = 'elementor_under_construction_section';

		add_settings_section(
			$under_construction_section,
			__( 'Maintenance Mode', 'elementor' ),
			function () {
				echo '<div id="elementor-maintenance-mode"></div>';
			},
			Tools::PAGE_ID
		);

		$field_id = 'elementor_under_construction_mode';

		add_settings_field(
			$field_id,
			__( 'Choose Mode', 'elementor' ),
			[ $controls_class_name, 'render' ],
			Tools::PAGE_ID,
			$under_construction_section,
			[
				'id' => $field_id,
				'class' => $field_id,
				'type' => 'select',
				'options' => [
					'' => __( 'Disabled', 'elementor' ),
					'under_construction' => __( 'Under Construction', 'elementor' ),
					'maintenance' => __( 'Maintenance', 'elementor' ),
				],
				'desc' => __( 'Under Construction mode sends HTTP 200, Maintenance mode sends HTTP 503', 'elementor' ),
			]
		);

		register_setting( Tools::PAGE_ID, $field_id );

		$field_id = 'elementor_under_construction_exclude_mode';

		add_settings_field(
			$field_id,
			__( 'Who Can Access', 'elementor' ),
			[ $controls_class_name, 'render' ],
			Tools::PAGE_ID,
			$under_construction_section,
			[
				'id' => $field_id,
				'class' => $field_id . ' elementor-default-hide',
				'type' => 'select',
				'std' => 'logged_in',
				'options' => [
					'logged_in' => __( 'Logged In', 'elementor' ),
					'custom' => __( 'Custom', 'elementor' ),
				],
			]
		);

		register_setting( Tools::PAGE_ID, $field_id );

		$field_id = 'elementor_under_construction_exclude_roles';

		add_settings_field(
			$field_id,
			__( 'Roles', 'elementor' ),
			[ $controls_class_name, 'render' ],
			Tools::PAGE_ID,
			$under_construction_section,
			[
				'id' => $field_id,
				'class' => $field_id . ' elementor-default-hide',
				'type' => 'checkbox_list_roles',
			]
		);

		register_setting( Tools::PAGE_ID, $field_id, [ $validations_class_name, 'checkbox_list' ] );

		$field_id = 'elementor_under_construction_template_id';

		$source = Plugin::$instance->templates_manager->get_source( 'local' );

		$templates = array_filter( $source->get_items(), function( $template ) {
			return 'local' === $template['source'] && 'page' === $template['type'];
		} );

		$options = [];

		foreach ( $templates as $template ) {
			$options[ $template['template_id'] ] = $template['title'];
		}

		$template_description = __( 'To enable maintenance mode you have to set a template for the maintenance mode page.', 'elementor' ) .
			sprintf( ' <a target="_blank" class="elementor-edit-template" style="display: none" href="%s">%s</a>', Utils::get_edit_link( self::get( 'template_id' ) ), __( 'Edit Template', 'elementor' ) );

		if ( empty( $templates ) ) {
			$template_description .= '<br><span class="elementor-under-construction-error">' . sprintf( __( 'You don\'t have any templates yet. Go ahead and <a target="_blank" href="%s">create one</a> now.', 'elementor' ), admin_url( 'post-new.php?post_type=' . Source_Local::CPT ) ) . '</span>';
		}

		add_settings_field(
			$field_id,
			__( 'Choose Template', 'elementor' ),
			[ $controls_class_name, 'render' ],
			Tools::PAGE_ID,
			$under_construction_section,
			[
				'id'  => $field_id,
				'class' => $field_id . ' elementor-default-hide',
				'type' => 'select',
				'show_select' => true,
				'options' => $options,
				'desc' => $template_description,
			]
		);

		register_setting( Tools::PAGE_ID, $field_id );
	}

	public function add_menu_in_admin_bar( \WP_Admin_Bar $wp_admin_bar ) {
		$wp_admin_bar->add_node( [
			'id' => 'elementor-maintenance-on',
			'title' => __( 'Your site is locked', 'elementor' ),
			'href' => Tools::get_url() . '#elementor-maintenance-mode',
		] );

		$wp_admin_bar->add_node( [
			'id' => 'elementor-maintenance-edit',
			'parent' => 'elementor-maintenance-on',
			'title' => __( 'Edit Template', 'elementor' ),
			'href' => Utils::get_edit_link( self::get( 'template_id' ) ),
		] );
	}

	public function __construct() {
		$is_enabled = (bool) self::get( 'mode' );

		if ( is_admin() ) {
			add_action( 'admin_init', [ $this, 'register_settings_fields' ], 30 ); /* 30 = after other tools */
		}

		if ( ! $is_enabled ) {
			return;
		}

		add_action( 'admin_bar_menu', [ $this, 'add_menu_in_admin_bar' ], 300 );

		$user = wp_get_current_user();

		$exclude_mode = self::get( 'exclude_mode', [] );

		if ( 'logged_in' === $exclude_mode &&  is_user_logged_in() ) {
			return;
		}

		if ( 'custom' === $exclude_mode ) {
			$exclude_roles = self::get( 'exclude_roles', [] );

			$compare_roles = array_intersect( $user->roles, $exclude_roles );

			if ( ! empty( $compare_roles ) ) {
				return;
			}
		}

		add_action( 'template_redirect', [ $this, 'template_redirect' ], 1 );
	}
}
