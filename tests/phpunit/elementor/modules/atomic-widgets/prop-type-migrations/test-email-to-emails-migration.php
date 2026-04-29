<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migration_Interpreter;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group prop-type-migrations
 */
class Test_Email_To_Emails_Migration extends Elementor_Test_Base {

	private array $migration;

	public function setUp(): void {
		parent::setUp();

		$path = ELEMENTOR_PATH . 'migrations/operations/email-to-emails.json';
		$this->migration = json_decode( file_get_contents( $path ), true );
	}

	public function test_up__changes_type_to_emails() {
		// Arrange
		$data = $this->make_email_data( 'admin@example.com' );

		// Act
		$result = Migration_Interpreter::run( $this->migration, $data, 'up' );

		// Assert
		$this->assertSame( 'emails', $result['$$type'] );
	}

	public function test_up__wraps_to_in_string_array() {
		// Arrange
		$data = $this->make_email_data( 'admin@example.com' );

		// Act
		$result = Migration_Interpreter::run( $this->migration, $data, 'up' );

		// Assert
		$this->assertSame( 'string-array', $result['value']['to']['$$type'] );
		$this->assertCount( 1, $result['value']['to']['value'] );
		$this->assertSame( 'string', $result['value']['to']['value'][0]['$$type'] );
		$this->assertSame( 'admin@example.com', $result['value']['to']['value'][0]['value'] );
	}

	public function test_up__wraps_cc_in_string_array() {
		// Arrange
		$data = $this->make_email_data( 'admin@example.com', 'cc@example.com' );

		// Act
		$result = Migration_Interpreter::run( $this->migration, $data, 'up' );

		// Assert
		$this->assertSame( 'string-array', $result['value']['cc']['$$type'] );
		$this->assertCount( 1, $result['value']['cc']['value'] );
		$this->assertSame( 'cc@example.com', $result['value']['cc']['value'][0]['value'] );
	}

	public function test_up__wraps_bcc_in_string_array() {
		// Arrange
		$data = $this->make_email_data( 'admin@example.com', null, 'bcc@example.com' );

		// Act
		$result = Migration_Interpreter::run( $this->migration, $data, 'up' );

		// Assert
		$this->assertSame( 'string-array', $result['value']['bcc']['$$type'] );
		$this->assertCount( 1, $result['value']['bcc']['value'] );
		$this->assertSame( 'bcc@example.com', $result['value']['bcc']['value'][0]['value'] );
	}

	public function test_up__preserves_other_fields() {
		// Arrange
		$data = $this->make_email_data( 'admin@example.com' );

		// Act
		$result = Migration_Interpreter::run( $this->migration, $data, 'up' );

		// Assert
		$this->assertSame( 'string', $result['value']['from']['$$type'] );
		$this->assertSame( 'sender@example.com', $result['value']['from']['value'] );
		$this->assertSame( 'string', $result['value']['subject']['$$type'] );
		$this->assertSame( 'Test subject', $result['value']['subject']['value'] );
	}

	public function test_up__null_cc_bcc_stay_null() {
		// Arrange
		$data = $this->make_email_data( 'admin@example.com' );

		// Act
		$result = Migration_Interpreter::run( $this->migration, $data, 'up' );

		// Assert
		$this->assertNull( $result['value']['cc'] );
		$this->assertNull( $result['value']['bcc'] );
	}

	public function test_down__changes_type_to_email() {
		// Arrange
		$data = $this->make_emails_data( [ 'admin@example.com' ] );

		// Act
		$result = Migration_Interpreter::run( $this->migration, $data, 'down' );

		// Assert
		$this->assertSame( 'email', $result['$$type'] );
	}

	public function test_down__extracts_first_to_from_array() {
		// Arrange
		$data = $this->make_emails_data( [ 'first@example.com', 'second@example.com' ] );

		// Act
		$result = Migration_Interpreter::run( $this->migration, $data, 'down' );

		// Assert
		$this->assertSame( 'string', $result['value']['to']['$$type'] );
		$this->assertSame( 'first@example.com', $result['value']['to']['value'] );
	}

	public function test_down__extracts_first_cc_from_array() {
		// Arrange
		$data = $this->make_emails_data( [ 'admin@example.com' ], [ 'cc@example.com' ] );

		// Act
		$result = Migration_Interpreter::run( $this->migration, $data, 'down' );

		// Assert
		$this->assertSame( 'string', $result['value']['cc']['$$type'] );
		$this->assertSame( 'cc@example.com', $result['value']['cc']['value'] );
	}

	public function test_down__extracts_first_bcc_from_array() {
		// Arrange
		$data = $this->make_emails_data( [ 'admin@example.com' ], [], [ 'bcc@example.com' ] );

		// Act
		$result = Migration_Interpreter::run( $this->migration, $data, 'down' );

		// Assert
		$this->assertSame( 'string', $result['value']['bcc']['$$type'] );
		$this->assertSame( 'bcc@example.com', $result['value']['bcc']['value'] );
	}

	public function test_roundtrip__up_then_down_preserves_to() {
		// Arrange
		$original = $this->make_email_data( 'admin@example.com', 'cc@test.com', 'bcc@test.com' );

		// Act
		$up = Migration_Interpreter::run( $this->migration, $original, 'up' );
		$down = Migration_Interpreter::run( $this->migration, $up, 'down' );

		// Assert
		$this->assertSame( $original['$$type'], $down['$$type'] );
		$this->assertSame( $original['value']['to'], $down['value']['to'] );
		$this->assertSame( $original['value']['cc'], $down['value']['cc'] );
		$this->assertSame( $original['value']['bcc'], $down['value']['bcc'] );
		$this->assertSame( $original['value']['from'], $down['value']['from'] );
		$this->assertSame( $original['value']['subject'], $down['value']['subject'] );
	}

	private function make_string( string $value ): array {
		return [ '$$type' => 'string', 'value' => $value ];
	}

	private function make_string_array( array $values ): array {
		return [
			'$$type' => 'string-array',
			'value' => array_map( fn( $v ) => $this->make_string( $v ), $values ),
		];
	}

	private function make_email_data( string $to, ?string $cc = null, ?string $bcc = null ): array {
		return [
			'$$type' => 'email',
			'value' => [
				'to' => $this->make_string( $to ),
				'subject' => $this->make_string( 'Test subject' ),
				'message' => $this->make_string( '[all-fields]' ),
				'from' => $this->make_string( 'sender@example.com' ),
				'meta-data' => null,
				'send-as' => $this->make_string( 'html' ),
				'from-name' => null,
				'reply-to' => null,
				'cc' => $cc ? $this->make_string( $cc ) : null,
				'bcc' => $bcc ? $this->make_string( $bcc ) : null,
			],
		];
	}

	private function make_emails_data( array $to, array $cc = [], array $bcc = [] ): array {
		return [
			'$$type' => 'emails',
			'value' => [
				'to' => $this->make_string_array( $to ),
				'subject' => $this->make_string( 'Test subject' ),
				'message' => $this->make_string( '[all-fields]' ),
				'from' => $this->make_string( 'sender@example.com' ),
				'meta-data' => null,
				'send-as' => $this->make_string( 'html' ),
				'from-name' => null,
				'reply-to' => null,
				'cc' => ! empty( $cc ) ? $this->make_string_array( $cc ) : null,
				'bcc' => ! empty( $bcc ) ? $this->make_string_array( $bcc ) : null,
			],
		];
	}
}
