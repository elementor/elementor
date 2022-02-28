<?php
namespace Elementor\Core\Common\Modules\EventTracker;

use Elementor\Core\Base\Base_Object;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class DB extends Base_Object {

	/**
	 * @var \wpdb
	 */
	private $wpdb;

	/**
	 * @var string
	 */
	private $table_name;

	const TABLE_NAME = 'e_events';

	const DB_VERSION_OPTION_KEY = 'elementor_events_db_version';

	const CURRENT_DB_VERSION = 1;

	// Create DB entry
	// Delete DB entry

	public function create_entry( $event_data ) {
		$event_data['created_at'] = time();
		$this->wpdb->insert( $this->get_table_name(), $event_data );
	}

	public function fetch_events() {
		$query = $this->wpdb->prepare( "SELECT * FROM $this->wpdb->{$this->table_name}" );
		$this->wpdb->get_results( $query );
	}

	public function get_events_count() {
		$query = $this->wpdb->prepare( "SELECT COUNT(*) FROM {$this->get_table_name()}" );

		return $this->wpdb->get_results( $query );
	}

	private function create_table() {
		$charset_collate = $this->wpdb->get_charset_collate();

		$e_events_table = "CREATE TABLE `{$this->table_name}` (
			id bigint(20) unsigned auto_increment primary key,
			event_data text null,
			created_at datetime not null
		) {$charset_collate};";

		dbDelta( $e_events_table );

		update_option( self::DB_VERSION_OPTION_KEY, self::CURRENT_DB_VERSION, false );
	}

	private function add_indexes() {
		$this->wpdb->query( "ALTER TABLE `{$this->get_table_name()}`
    		ADD INDEX `created_at_index` (`created_at`)
		" );
	}

	public function get_table_name() {
		return $this->wpdb->prefix . $this->table_name;
	}

	private function set_table_prefix() {
		$this->wpdb->{$this->table_name} = $this->get_table_name();
	}

	public function __construct() {
		$this->table_name = $this->wpdb->prefix . self::TABLE_NAME;

		global $wpdb;
		$this->wpdb = $wpdb;

		$installed_version = get_option( self::DB_VERSION_OPTION_KEY, -1 );

		if ( self::CURRENT_DB_VERSION !== $installed_version ) {
			$this->create_table();
			$this->add_indexes();
		}
	}
}
