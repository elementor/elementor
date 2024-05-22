<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Common\Modules\EventTracker;

use Elementor\Core\Common\Modules\EventTracker\DB;
use Elementor\Modules\System_Info\Reporters\User;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_DB extends Elementor_Test_Base {

	private static $db_manager;
	private static $event_mock;
	private static $timestamp;

	public function setUp(): void {
		parent::setUp();

		self::$timestamp = current_time( \DateTime::ATOM );

		self::$event_mock = [
			'event_data' => '{"placement":"Onboarding wizard","event":"modal load","step":"account","user_state":"anon","ts":"' . self::$timestamp . '", "details":{}}',
			'created_at' => self::$timestamp,
		];
	}

	public static function setUpBeforeClass(): void {
		global $wpdb;

		/** @var DB db_manager */
		self::$db_manager = new DB();

		// Cleanup
		DB::reset_table();
	}

	public function tearDown(): void {
		parent::tearDown();

		// Cleanup
		DB::reset_table();
	}

	public function test_get_table_name() {
		global $wpdb;

		$this->assertEquals( $wpdb->prefix . DB::TABLE_NAME, self::$db_manager->get_table_name() );
	}

	public function test_prepare_db_for_entry() {
		global $wpdb;

		$table_name = $wpdb->prefix . DB::TABLE_NAME;

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

		$this->assertEquals( $initial_count - 1, $updated_count );
	}

	public function test_create_entry() {
		global $wpdb;

		$table_name = $wpdb->prefix . DB::TABLE_NAME;

		self::create_mock_entry();

		$entry = $wpdb->get_row( "SELECT event_data FROM {$table_name} ORDER BY created_at DESC LIMIT 1" );

		$expected = '{"placement":"Onboarding wizard","event":"modal load","step":"account","user_state":"anon","ts":"' . self::$timestamp . '","details":"[]"}';

		$this->assertEquals( $expected, $entry->event_data );
	}

	public function test_get_event_ids_from_db() {
		// Create an entry so there's something to fetch for the test.
		self::create_mock_entry();

		$event_ids = self::$db_manager->get_event_ids_from_db();

		$this->assertEquals( 1, $event_ids[0]->id );
	}

	public static function create_mock_entry() {
		self::$db_manager->create_entry( json_decode( self::$event_mock['event_data'], true ) );
	}
}
