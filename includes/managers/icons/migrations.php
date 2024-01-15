<?php
namespace Elementor\Icons_Manager;

use Elementor\Icons_Manager;
use Elementor\Utils;
use Elementor\Tools;
use Elementor\Plugin;

use Elementor\Core\Upgrade\Manager as Upgrade_Manager;
use Elementor\Core\Upgrade\Upgrade_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Migrations {

	const NEEDS_UPDATE_OPTION = 'icon_manager_needs_update';

	const LATEST_MIGRATION_OPTION = 'icon_manager_latest_migration';

	const LATEST_MIGRATION_REQUIRED_VERSION = '6.5.1';

	public static function get_needs_upgrade_option() {
		return get_option( 'elementor_' . self::NEEDS_UPDATE_OPTION, null );
	}

	/**
	 * Font Awesome icon values migration between versions
	 *
	 * used to convert string value of Icon control to array value of Icons control
	 * ex: 'fa fa-star' => [ 'value' => 'fas fa-star', 'library' => 'fa-solid' ]
	 *
	 * @param $value
	 *
	 * @return array
	 */
	public static function fa_icon_value_migration( $value ) {
		if ( is_string( $value ) && '' === $value ) {
			return [
				'value' => '',
				'library' => '',
			];
		}

		if ( is_string( $value ) ) {
			$value = [
				'value' => $value,
				'library' => '',
			];
		}

		foreach ( self::get_migration_dictionary() as $mapping_by_version ) {
			if ( isset( $mapping_by_version[ $value['value'] ] ) ) {
				$value = $mapping_by_version[ $value['value'] ];
			}
		}

		// Make sure there's no value in the old 'fa ' format, even if no replacement found.
		if ( '' === $value['library'] ) {
			$value = [
				'value'   => 'fas ' . str_replace( 'fa ', '', $value ),
				'library' => 'fa-solid',
			];
		}

		return $value;
	}

	/**
	 * Get the migration dictionary (mapping of the icon changes) by versions.
	 *
	 * @return array
	 */
	public static function get_migration_dictionary() {
		static $migration_dictionary = [];

		if ( ! empty( $migration_dictionary ) ) {
			return $migration_dictionary;
		}

		$current_version = Icons_Manager::get_current_fa_version();
		$oldest_legacy_version = 4;

		for ( $i = $oldest_legacy_version; $i <= $current_version; $i++ ) {
			$mapping_by_version = sprintf( 'mapping-v%s-to-v%s', $i, $i + 1 );
			$mapping_file = ELEMENTOR_ASSETS_PATH . "/lib/font-awesome/migration/$mapping_by_version.js";

			if ( file_exists( $mapping_file ) ) {
				$migration_dictionary[] = json_decode( Utils::file_get_contents( $mapping_file ), true );
			}
		}

		return $migration_dictionary;
	}

	/**
	 * On import, migrate the icon values.
	 *
	 * @param array $element        settings array
	 * @param string $old_control   old control id
	 * @param string $new_control   new control id
	 * @param bool $remove_old      boolean weather to remove old control or not
	 *
	 * @return array
	 */
	public static function on_import_migration( array $element, $old_control = '', $new_control = '', $remove_old = false ) {

		if ( ! isset( $element['settings'][ $old_control ] ) || isset( $element['settings'][ $new_control ] ) ) {
			return $element;
		}

		// Case when old value is saved as empty string
		$new_value = [
			'value' => '',
			'library' => '',
		];

		// Case when old value needs migration
		if ( ! empty( $element['settings'][ $old_control ] ) && self::is_migration_required() ) {
			$new_value = self::fa_icon_value_migration( $element['settings'][ $old_control ] );
		}

		$element['settings'][ $new_control ] = $new_value;

		//remove old value
		if ( $remove_old ) {
			unset( $element['settings'][ $old_control ] );
		}

		return $element;
	}

	/**
	 * Is an icon migration required in the site content?
	 *
	 * @since 3.19.0
	 * @return bool
	 */
	public static function is_migration_required() {
		static $migration_required = false;

		if ( false === $migration_required ) {
			if ( empty( key( Upgrade_Manager::get_installs_history() ) ) ) {
				// If `get_installs_history()` is empty, Elementor was never installed on this site.
				update_option( 'elementor_' . self::LATEST_MIGRATION_OPTION, self::LATEST_MIGRATION_REQUIRED_VERSION );
			} else {
				$needs_upgrade = self::get_needs_upgrade_option();
				$latest_migration_version = get_option( 'elementor_' . self::LATEST_MIGRATION_OPTION, null );

				// Check if migration is required based on get_needs_upgrade_option() or version comparison
				$is_migration_required = null === $latest_migration_version || version_compare(
					$latest_migration_version,
					self::LATEST_MIGRATION_REQUIRED_VERSION,
					'<'
				);

				$migration_required = 'yes' === $needs_upgrade || $is_migration_required;
			}

			/**
			 * Is icon migration required.
			 * @since 3.19.0
			 * @param bool $migration_required
			 */
			$migration_required = apply_filters( 'elementor/icons_manager/migration_required', $migration_required );
		}

		return $migration_required;
	}

	/**
	 * Create the FontAwesome Updater admin tools tab.
	 *
	 * @param Tools $settings
	 */
	public function register_admin_tools_settings( Tools $settings ) {
		$settings->add_tab( 'fontawesome_migration', [ 'label' => esc_html__( 'Font Awesome', 'elementor' ) ] );

		$settings->add_section( 'fontawesome_migration', 'fontawesome_migration', [
			'callback' => function() {
				echo '<h2>' . esc_html__( 'Font Awesome Upgrade', 'elementor' ) . '</h2>';
				echo '<p>' . // PHPCS - Plain Text
				/* translators: %s: Version number. */
				sprintf( esc_html__( 'Access 1,700+ amazing icons, faster performance, and design flexibility with Font Awesome v%s.', 'elementor' ), Icons_Manager::get_current_fa_version() ) . // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				'<br>' .
				esc_html__( 'We’ll automatically convert existing icons on your site to the new versions anytime you edit a page that already contains icons, so some may appear different.', 'elementor' ) . '<br>' .
				'</p><p><strong>' .
				esc_html__( 'Keep in mind:', 'elementor' ) .
				'</strong></p><ul class="ul-disc"><li>' .
				esc_html__( 'To ensure a smooth transition, create a backup of your site first.', 'elementor' ) .
				'</li><li>' .
				esc_html__( 'This update can’t be undone, even if you roll back your site to a previous version.', 'elementor' ) .
				'</li></ul>';
			},
			'fields' => [
				[
					/* translators: %s: Version number. */
					'label' => sprintf( esc_html__( 'Font Awesome v%s:', 'elementor' ), Icons_Manager::get_current_fa_version() ),
					'field_args' => [
						'type' => 'raw_html',
						'html' => sprintf( '<span data-action="%s" data-_nonce="%s" data-redirect-url="%s" class="button elementor-button-spinner" id="elementor_upgrade_fa_button">%s</span>',
							self::NEEDS_UPDATE_OPTION . '_upgrade',
							wp_create_nonce( self::NEEDS_UPDATE_OPTION ),
							esc_url( $this->get_upgrade_redirect_url() ),
							esc_html__( 'Update Now', 'elementor' )
						),
					],
				],
			],
		] );
	}

	/**
	 * Get redirect URL when upgrading font awesome.
	 *
	 * @return string
	 */
	public function get_upgrade_redirect_url() {

		if ( ! wp_verify_nonce( Utils::get_super_global_value( $_GET, '_wpnonce' ), 'tools-page-from-editor' ) ) {
			return '';
		}

		$document_id = ! empty( $_GET['redirect_to_document'] ) ? absint( $_GET['redirect_to_document'] ) : null;

		if ( ! $document_id ) {
			return '';
		}

		$document = Plugin::$instance->documents->get( $document_id );

		if ( ! $document ) {
			return '';
		}

		return $document->get_edit_url();
	}

	/**
	 * Ajax Upgrade to the current version of Font Awesome
	 */
	public function ajax_upgrade_to_current_version() {
		check_ajax_referer( self::NEEDS_UPDATE_OPTION, '_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( 'Permission denied' );
		}

		$this->run_migration();
		self::update_migration_required_flags();

		$success_title = sprintf(
			/* translators: %s: Version number. */
			esc_html__( 'You\'ve got Font Awesome %s!', 'elementor' ),
			Icons_Manager::get_current_fa_version()
		);

		wp_send_json_success( [
			'title' => $success_title,
			'message' => esc_html__( 'Elevate your designs with these new and updated icons.', 'elementor' ),
		] );
	}

	/**
	 * Run the migration process.
	 */
	private function run_migration() {
		$custom_tasks = Plugin::instance()->custom_tasks;

		$custom_tasks->add_tasks_requested_to_run( [ [ 'Elementor\Core\Upgrade\Custom_Tasks', 'migrate_fa_icon_values' ] ] );
		$updater = $custom_tasks->get_task_runner();

		$callbacks = $custom_tasks->get_tasks_requested_to_run();
		$did_tasks = false;

		if ( ! empty( $callbacks ) ) {
			$updater->handle_immediately( $callbacks );
			$did_tasks = true;
		}

		$custom_tasks->on_runner_complete( $did_tasks );
	}

	/**
	 * Remove the update flag and update the latest migration flag.
	 */
	public static function update_migration_required_flags() {
		delete_option( 'elementor_' . self::NEEDS_UPDATE_OPTION );
		update_option( 'elementor_' . self::LATEST_MIGRATION_OPTION, self::LATEST_MIGRATION_REQUIRED_VERSION );
	}

	/**
	 * Migrate the icon values.
	 * This function is called from the Custom_Tasks class.
	 *
	 * @param $updater
	 * @return void
	 */
	public static function migrate_icon_values( $updater ) {
		$changes = [ [ 'callback' => [ 'Elementor\Icons_Manager\Migrations', 'migrate_icon_value_names' ] ] ];

		$should_run_again = true;
		while ( $should_run_again ) {
			$should_run_again = Upgrade_Utils::_update_widget_settings( '*', $updater, $changes );
		}
	}

	/**
	 * Migrate the icon value names.
	 * Used during the iteration of the widgets in the full migration process.
	 *
	 * @param $element
	 * @param $args
	 *
	 * @return array|mixed
	 */
	public static function migrate_icon_value_names( $element, $args ) {
		if ( empty( $element['widgetType'] ) || ! in_array( $args['widget_id'], [ '*', $element['widgetType'] ] ) ) {
			return $element;
		}

		foreach ( $element['settings'] as $key => $value ) {
			if ( ! empty( $value['value'] ) && str_contains( $value['value'], ' fa-' ) ) {
				$substitute = self::fa_icon_value_migration( $value );
				if ( is_array( $value ) && empty( array_diff_assoc( $substitute, $value ) ) ) {
					continue;
				}

				$element['settings'][ $key ] = $substitute;
				$args['do_update'] = true;
			}
		}

		return $element;
	}

	/**
	 * Add Update Needed Flag
	 *
	 * @param array $settings
	 *
	 * @return array;
	 */
	public function add_settings( $settings ) {
		if ( ! ( defined( 'ELEMENTOR_TESTS' ) && ELEMENTOR_TESTS ) ) {
			$settings['icons_update_needed'] = true;
		}

		$settings['icons']['legacy_library'] = Icons_Manager::get_fa_asset_url( 'fontawesome' );

		return $settings;
	}

	/**
	 * Icons Migrations constructor
	 */
	public function __construct() {
		if ( self::is_migration_required() ) {
			add_filter( 'elementor/editor/localize_settings', [ $this, 'add_settings' ] );
			add_action( 'elementor/admin/after_create_settings/' . Tools::PAGE_ID, [ $this, 'register_admin_tools_settings' ], 100 );

			if ( ! empty( $_POST ) ) { // phpcs:ignore -- nonce validation done in callback
				add_action( 'wp_ajax_' . self::NEEDS_UPDATE_OPTION . '_upgrade', [ $this, 'ajax_upgrade_to_current_version' ] );
			}
		}
	}
}
