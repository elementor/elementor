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

	/**
	 * Prepare Database for Entry
	 *
	 * The events database should have a limit of up to 1000 event entries stored daily.
	 * That limit is managed in the FIFO method -  If the limit is reached, the last
	 *
	 * @since 3.6.0
	 */
	public function prepare_db_for_entry() {
		$events = $this->get_events_from_db();

		if ( 1000 <= count( $events ) ) {
			// Sort the array by entry ID
			$id_col = array_column( $events, 'id' );
			array_multisort( $id_col, SORT_ASC, $events );

			$this->delete_entry( $events[0]['id'] );
		}
	}

	public function delete_entry( $id ) {
		$this->wpdb->insert( $this->get_table_name(), [ 'ID' => $id ] );
	}

	public function create_entry( $event_data ) {
		$this->prepare_db_for_entry();

		$entry = [
			'event_data' => wp_json_encode( $event_data ),
		];

		$this->wpdb->insert( $this->get_table_name(), $entry );
	}

	public function get_events_from_db() {
		$query = $this->wpdb->prepare( "SELECT `id` FROM {$this->get_table_name()}" );

		return $this->wpdb->get_results( $query );
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
