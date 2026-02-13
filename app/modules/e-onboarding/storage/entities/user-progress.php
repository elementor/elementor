<?php

namespace Elementor\App\Modules\E_Onboarding\Storage\Entities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class User_Progress {

	private int $current_step_index = 0;
	private ?string $current_step_id = null;
	private array $completed_steps = [];
	private ?string $exit_type = null;
	private ?int $last_active_timestamp = null;
	private ?int $started_at = null;
	private ?int $completed_at = null;
	private bool $starter_dismissed = false;

	public static function from_array( array $data ): self {
		$instance = new self();

		$instance->current_step_index = $data['current_step_index'] ?? $data['current_step'] ?? 0;
		$instance->current_step_id = $data['current_step_id'] ?? null;
		$instance->completed_steps = $data['completed_steps'] ?? [];
		$instance->exit_type = $data['exit_type'] ?? null;
		$instance->last_active_timestamp = $data['last_active_timestamp'] ?? null;
		$instance->started_at = $data['started_at'] ?? null;
		$instance->completed_at = $data['completed_at'] ?? null;
		$instance->starter_dismissed = ! empty( $data['starter_dismissed'] );

		return $instance;
	}

	public function to_array(): array {
		return [
			'current_step' => $this->current_step_index,
			'current_step_index' => $this->current_step_index,
			'current_step_id' => $this->current_step_id,
			'completed_steps' => $this->completed_steps,
			'exit_type' => $this->exit_type,
			'last_active_timestamp' => $this->last_active_timestamp,
			'started_at' => $this->started_at,
			'completed_at' => $this->completed_at,
			'starter_dismissed' => $this->starter_dismissed,
		];
	}

	public function get_current_step(): int {
		return $this->current_step_index;
	}

	public function get_current_step_index(): int {
		return $this->current_step_index;
	}

	public function set_current_step_index( int $index ): void {
		$this->current_step_index = $index;
	}

	public function get_current_step_id(): ?string {
		return $this->current_step_id;
	}

	public function set_current_step_id( ?string $step_id ): void {
		$this->current_step_id = $step_id;
	}

	public function set_current_step( int $step, ?string $step_id = null ): void {
		$this->current_step_index = $step;

		if ( null !== $step_id ) {
			$this->current_step_id = $step_id;
		}
	}

	public function get_completed_steps(): array {
		return $this->completed_steps;
	}

	public function set_completed_steps( array $steps ): void {
		$this->completed_steps = $steps;
	}

	public function add_completed_step( $step ): void {
		if ( ! in_array( $step, $this->completed_steps, true ) ) {
			$this->completed_steps[] = $step;
		}
	}

	public function is_step_completed( $step ): bool {
		return in_array( $step, $this->completed_steps, true );
	}

	public function get_exit_type(): ?string {
		return $this->exit_type;
	}

	public function set_exit_type( ?string $type ): void {
		$this->exit_type = $type;
	}

	public function get_last_active_timestamp(): ?int {
		return $this->last_active_timestamp;
	}

	public function set_last_active_timestamp( ?int $timestamp ): void {
		$this->last_active_timestamp = $timestamp;
	}

	public function get_started_at(): ?int {
		return $this->started_at;
	}

	public function set_started_at( ?int $timestamp ): void {
		$this->started_at = $timestamp;
	}

	public function get_completed_at(): ?int {
		return $this->completed_at;
	}

	public function set_completed_at( ?int $timestamp ): void {
		$this->completed_at = $timestamp;
	}

	public function is_starter_dismissed(): bool {
		return $this->starter_dismissed;
	}

	public function set_starter_dismissed( bool $dismissed ): void {
		$this->starter_dismissed = $dismissed;
	}

	public function had_unexpected_exit(): bool {
		return null === $this->exit_type
			&& $this->current_step_index > 0
			&& null === $this->completed_at;
	}
}
