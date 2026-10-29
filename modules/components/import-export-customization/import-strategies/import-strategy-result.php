<?php

namespace Elementor\Modules\Components\ImportExportCustomization\ImportStrategies;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import_Strategy_Result {
	private string $action;
	private string $uid;
	private ?int $destination_component_id;
	private bool $should_track_in_session;
	private array $revert_metadata;

	private function __construct(
		string $action,
		string $uid,
		?int $destination_component_id,
		bool $should_track_in_session,
		array $revert_metadata
	) {
		$this->action = $action;
		$this->uid = $uid;
		$this->destination_component_id = $destination_component_id;
		$this->should_track_in_session = $should_track_in_session;
		$this->revert_metadata = $revert_metadata;
	}

	public static function for_create( string $uid, bool $should_track_in_session = true, array $revert_metadata = [] ): self {
		return new self( 'create', $uid, null, $should_track_in_session, $revert_metadata );
	}

	public static function for_existing( int $destination_component_id, string $uid, bool $should_track_in_session = false, array $revert_metadata = [] ): self {
		return new self( 'existing', $uid, $destination_component_id, $should_track_in_session, $revert_metadata );
	}

	public static function for_skip( array $revert_metadata = [] ): self {
		return new self( 'skip', '', null, false, $revert_metadata );
	}

	public function should_create_document(): bool {
		return 'create' === $this->action;
	}

	public function should_import_document(): bool {
		return 'skip' !== $this->action;
	}

	public function should_track_in_session(): bool {
		return $this->should_track_in_session;
	}

	public function get_uid(): string {
		return $this->uid;
	}

	public function get_destination_component_id(): ?int {
		return $this->destination_component_id;
	}

	public function set_destination_component_id( int $destination_component_id ): self {
		$this->destination_component_id = $destination_component_id;

		return $this;
	}

	public function get_revert_metadata(): array {
		return $this->revert_metadata;
	}
}
