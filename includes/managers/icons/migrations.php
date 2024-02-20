<?php
namespace Elementor\Icons_Manager;

use Elementor\Icons_Manager;
use Elementor\Utils;
use Elementor\Plugin;

use Elementor\Core\Common\Modules\Ajax\Module as Ajax;

use Elementor\Core\Upgrade\Manager as Upgrade_Manager;
use Elementor\Core\Upgrade\Upgrade_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Migrations {

	const NEEDS_UPDATE_OPTION = 'icon_manager_needs_update';

	const FONTAWESOME_CURRENTLY_USED_VERSION_OPTION = 'fontawesome_current_version';

	/**
	 * The latest version that requires migration.
	 * This is needed as not every FA version update will require migration.
	 * Migration is required only when icons are removed or renamed in the newer version.
	 * If the version defined here is higher than the current FA version used on the website, migration will be required.
	 */
	const LATEST_MIGRATION_REQUIRED_VERSION = '6.5.1';

	const MIGRATION_REQUIRED_TRANSIENT = 'icons_migration_required';

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
		if ( '' === $value ) {
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
	private static function get_migration_dictionary() {
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
		if ( ! empty( $element['settings'][ $old_control ] ) ) {
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
	 * @since 3.20.0
	 * @return bool
	 */
	public static function is_migration_required() {
		$migration_required_transient = get_transient( 'elementor_' . self::MIGRATION_REQUIRED_TRANSIENT );

		if ( false !== $migration_required_transient ) {
			return unserialize( $migration_required_transient );
		}

		$is_new_plugin_installation = empty( key( Upgrade_Manager::get_installs_history() ) );

		if ( $is_new_plugin_installation ) {
			update_option( 'elementor_' . self::FONTAWESOME_CURRENTLY_USED_VERSION_OPTION, self::LATEST_MIGRATION_REQUIRED_VERSION );
		}

		$migration_required = $is_new_plugin_installation ? false : self::check_migration_required();
		$migration_required = apply_filters( 'elementor/icons_manager/migration_required', $migration_required );

		set_transient( 'elementor_' . self::MIGRATION_REQUIRED_TRANSIENT, serialize( $migration_required ), HOUR_IN_SECONDS );

		return $migration_required;
	}

	/**
	 * Checks if migration is required based on DB flags or version comparison.
	 *
	 * @return bool True if migration is required, false otherwise.
	 */
	private static function check_migration_required() {
		$needs_upgrade = self::get_needs_upgrade_option();

		if ( 'yes' === $needs_upgrade ) {
			return true;
		}

		$currently_used_version = get_option( 'elementor_' . self::FONTAWESOME_CURRENTLY_USED_VERSION_OPTION, null );

		if ( null === $currently_used_version ) {
			return true;
		}

		// Migration is required if the version currently used on the website is lower than the migration-required-version.
		return version_compare(
			$currently_used_version,
			self::LATEST_MIGRATION_REQUIRED_VERSION,
			'<'
		);
	}

	public function register_ajax_actions( Ajax $ajax ) {
		$ajax->register_ajax_action( 'icon_manager_migrate', [ $this, 'ajax_upgrade_to_current_version' ] );
	}

	/**
	 * Ajax Upgrade to the current version of Font Awesome
	 */
	public function ajax_upgrade_to_current_version() {
		if ( ! current_user_can( 'manage_options' ) ) {
			throw new \Exception( 'Permission denied.' );
		}

		$this->run_migration();
		self::update_migration_required_flags();
	}

	/**
	 * Run the migration process.
	 */
	private function run_migration() {
		$custom_tasks = Plugin::instance()->custom_tasks;

		$custom_tasks->add_tasks_requested_to_run( [
			[ 'Elementor\Core\Upgrade\Custom_Tasks', 'migrate_fa_icon_values' ],
		] );

		$updater = $custom_tasks->get_task_runner();
		$callbacks = $custom_tasks->get_tasks_requested_to_run();

		$updater->handle_immediately( $callbacks );

		$custom_tasks->on_runner_complete( true );
	}

	/**
	 * Remove the update flag and update the latest migration flag.
	 */
	public static function update_migration_required_flags() {
		delete_transient( 'elementor_' . self::MIGRATION_REQUIRED_TRANSIENT );
		delete_option( 'elementor_' . self::NEEDS_UPDATE_OPTION );
		update_option( 'elementor_' . self::FONTAWESOME_CURRENTLY_USED_VERSION_OPTION, self::LATEST_MIGRATION_REQUIRED_VERSION );
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
			$is_icon_control = ! empty( $value['value'] ) && is_string( $value['value'] ) && str_contains( $value['value'], ' fa-' );

			if ( ! $is_icon_control ) {
				continue;
			}

			$substitute = self::fa_icon_value_migration( $value );
			$is_value_unchanged = is_array( $value ) && empty( array_diff_assoc( $substitute, $value ) );

			if ( $is_value_unchanged ) {
				continue;
			}

			$element['settings'][ $key ] = $substitute;
			$args['do_update'] = true;
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
			add_action( 'elementor/ajax/register_actions', [ $this, 'register_ajax_actions' ] );
		}
	}
}
