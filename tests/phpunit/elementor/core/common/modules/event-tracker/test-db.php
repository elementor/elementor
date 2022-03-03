<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Common\Modules\EventTracker;

use Elementor\Core\Common\Modules\EventTracker\DB;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_DB extends Elementor_Test_Base {

	private static $db_manager;
	private static $table_name;
	private static $event_mock;

	public static function setUpBeforeClass() {
		global $wpdb;

		/** @var DB db_manager */
		self::$db_manager = new DB();

		self::$table_name = $wpdb->prefix . DB::TABLE_NAME;

		$timestamp = current_time( 'mysql' );

		self::$event_mock = [
			'event_data' => '{"placement":"Onboarding wizard","event":"modal load","step":"account","user_state":"anon","timestamp":"' . $timestamp . '"}',
			'created_at' => $timestamp,
		];

		// Cleanup
		DB::reset_table();
	}

	public function tearDown() {
		parent::tearDown();

		// Cleanup
		DB::reset_table();
	}

	public function test_prepare_db_for_entry() {
		global $wpdb;

		$table_name = self::$table_name;

		// set up a DB with 1000 events.
		$events_mock_data = [];
		$placeholders = [];

		for ( $i = 0; $i < 1000; $i++ ) {
			$events_mock_data[] = self::$event_mock['event_data'];
			$events_mock_data[] = self::$event_mock['created_at'];
			$placeholders[] = '("%s", "%s")';
		}

		$query = 'INSERT INTO ' . $table_name . ' (event_data, created_at) VALUES ';
		$query .= implode( ', ', $placeholders );

		// Insert the 1000 events.
		$wpdb->query( $wpdb->prepare( "$query", $events_mock_data ) );

		$count_query = "SELECT COUNT(*) FROM {$table_name}";

		// Get the events count in the DB.
		$initial_count = (int) $wpdb->get_var( $count_query );

		// Run the tested method.
		self::$db_manager->prepare_db_for_entry();

		// Get the updated count.
		$updated_count = (int) $wpdb->get_var( $count_query );

		$this->assertTrue( $initial_count - 1, $updated_count );
	}

	public function test_create_entry() {
		global $wpdb;

		self::$db_manager->create_entry( self::$event_mock['event_data'] );

		$entry = $wpdb->get_row( 'SELECT * FROM `wp_e_events` WHERE id = 1' );

		$this->assertEquals( self::$event_mock['event_data'], $entry->event_data );
	}
}
