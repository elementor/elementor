<?php

namespace Elementor\Modules\GlobalClasses\Database;

use Elementor\Core\Database\Base_Database_Updater;
use Elementor\Modules\GlobalClasses\Database\Migrations\Add_Capabilities;
use Elementor\Modules\GlobalClasses\Database\Migrations\Migrate_To_Posts;
use Elementor\Modules\GlobalClasses\Database\Migrations\Reconcile_Downgraded_Posts;

class Global_Classes_Database_Updater extends Base_Database_Updater {
	const DB_VERSION = 3;
	const OPTION_NAME = 'elementor_global_classes_db_version';

	protected function get_migrations(): array {
		return [
			1 => new Add_Capabilities(),
			2 => new Migrate_To_Posts(),
			3 => new Reconcile_Downgraded_Posts(),
		];
	}

	protected function get_db_version() {
		return static::DB_VERSION;
	}

	protected function get_db_version_option_name(): string {
		return static::OPTION_NAME;
	}

	public function up( $force = false ) {
		$installed_version = intval( get_option( static::OPTION_NAME ) );
		$db_version        = static::DB_VERSION;

		// #region agent log
		$log_payload = [
			'sessionId'    => 'a2248d',
			'location'     => 'global-classes-database-updater.php:up',
			'message'      => 'DB Updater::up called',
			'hypothesisId' => 'D',
			'data'         => [
				'installed_version' => $installed_version,
				'db_version'        => $db_version,
				'force'             => $force,
				'will_run'          => $force || $db_version > $installed_version,
			],
			'timestamp'    => round( microtime( true ) * 1000 ),
		];
		file_put_contents(
			'/Users/ronros/Local Sites/multi-local-site-1/app/public/wp-content/plugins/.cursor/debug-a2248d.log',
			json_encode( $log_payload ) . "\n",
			FILE_APPEND
		);
		// #endregion

		parent::up( $force );

		// #region agent log
		$after_payload = [
			'sessionId'    => 'a2248d',
			'location'     => 'global-classes-database-updater.php:up:after',
			'message'      => 'DB Updater::up completed',
			'hypothesisId' => 'D',
			'data'         => [
				'version_after' => intval( get_option( static::OPTION_NAME ) ),
			],
			'timestamp'    => round( microtime( true ) * 1000 ),
		];
		file_put_contents(
			'/Users/ronros/Local Sites/multi-local-site-1/app/public/wp-content/plugins/.cursor/debug-a2248d.log',
			json_encode( $after_payload ) . "\n",
			FILE_APPEND
		);
		// #endregion
	}
}
