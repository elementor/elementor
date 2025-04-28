<?php
namespace Elementor\Core\Database;

use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Base_Database_Updater {
	/**
	 * Run all the 'up' method of the migrations classes if needed, and update the db version.
	 *
	 * @param bool $force When passing true, it ignores the current version and run all the up migrations.
	 */
	public function up( $force = false ) {
		$installed_version = $this->get_installed_version();

		// Up to date. Nothing to do.
		if ( ! $force && $this->get_db_version() <= $installed_version ) {
			return;
		}

		$migrations = $this->get_collected_migrations();

		if ( ! $force ) {
			$migrations = $migrations->filter( function ( $_, $version ) use ( $installed_version ) {
				// Filter all the migrations that already done.
				return $version > $installed_version;
			} );
		}

		$migrations->map( function ( Base_Migration $migration, $version ) {
			$migration->up();

			// In case some migration failed it updates version every migration.
			$this->update_db_version_option( $version );
		} );

		$this->update_db_version_option( $this->get_db_version() );
	}

	/**
	 * Register hooks to activate the migrations.
	 */
	public function register() {
		add_action( 'admin_init', function () {
			$this->up();
		} );
	}

	/**
	 * Update the version in the users DB.
	 *
	 * @param $version
	 */
	protected function update_db_version_option( $version ) {
		update_option( $this->get_db_version_option_name(), $version );
	}

	/**
	 * Get the version that already installed.
	 *
	 * @return int
	 */
	protected function get_installed_version() {
		return intval( get_option( $this->get_db_version_option_name() ) );
	}

	/**
	 * Get all migrations inside a Collection.
	 *
	 * @return Collection
	 */
	protected function get_collected_migrations() {
		return new Collection( $this->get_migrations() );
	}

	/**
	 * The most updated version of the DB.
	 *
	 * @return numeric
	 */
	abstract protected function get_db_version();

	/**
	 * The name of the option that saves the current user DB version.
	 *
	 * @return string
	 */
	abstract protected function get_db_version_option_name();

	/**
	 * Array of migration classes.
	 *
	 * @return Base_Migration[]
	 */
	abstract protected function get_migrations();
}
