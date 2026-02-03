<?php

namespace Elementor\App\Modules\OnboardingV2\Storage\Entities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class User_Progress {

	private int $current_step;
	private array $completed_steps;
	private ?string $exit_type;
	private ?int $last_active_timestamp;
	private ?int $started_at;
	private ?int $completed_at;

	private function __construct( array $data ) {
		$this->current_step = $data['current_step'] ?? 0;
		$this->completed_steps = $data['completed_steps'] ?? [];
		$this->exit_type = $data['exit_type'] ?? null;
		$this->last_active_timestamp = $data['last_active_timestamp'] ?? null;
		$this->started_at = $data['started_at'] ?? null;
		$this->completed_at = $data['completed_at'] ?? null;
	}

	public static function from_array( array $data ): self {
		return new self( $data );
	}

	public static function default(): self {
		return new self( [] );
	}

	public function to_array(): array {
		return [
			'current_step' => $this->current_step,
			'completed_steps' => $this->completed_steps,
			'exit_type' => $this->exit_type,
			'last_active_timestamp' => $this->last_active_timestamp,
			'started_at' => $this->started_at,
			'completed_at' => $this->completed_at,
		];
	}

	public function current_step(): int {
		return $this->current_step;
	}

	public function set_current_step( int $step ): self {
		$this->current_step = $step;
		$this->touch();

		return $this;
	}

	public function completed_steps(): array {
		return $this->completed_steps;
	}

	public function complete_step( int $step ): self {
		if ( ! in_array( $step, $this->completed_steps, true ) ) {
			$this->completed_steps[] = $step;
		}

		$this->touch();

		return $this;
	}

	public function exit_type(): ?string {
		return $this->exit_type;
	}

	public function set_exit_type( ?string $type ): self {
		$this->exit_type = $type;
		$this->touch();

		return $this;
	}

	public function mark_user_exit(): self {
		return $this->set_exit_type( 'user_exit' );
	}

	public function started_at(): ?int {
		return $this->started_at;
	}

	public function start(): self {
		if ( null === $this->started_at ) {
			$this->started_at = time();
		}

		$this->exit_type = null;
		$this->touch();

		return $this;
	}

	public function completed_at(): ?int {
		return $this->completed_at;
	}

	public function complete(): self {
		$this->completed_at = time();
		$this->exit_type = 'user_exit';
		$this->touch();

		return $this;
	}

	public function is_completed(): bool {
		return null !== $this->completed_at;
	}

	public function is_in_progress(): bool {
		return $this->current_step > 0 && ! $this->is_completed();
	}

	public function had_unexpected_exit(): bool {
		return null === $this->exit_type
			&& $this->current_step > 0
			&& ! $this->is_completed();
	}

	public function last_active_timestamp(): ?int {
		return $this->last_active_timestamp;
	}

	private function touch(): void {
		$this->last_active_timestamp = time();
	}

	public function apply_changes( array $data ): self {
		if ( isset( $data['current_step'] ) ) {
			$this->current_step = (int) $data['current_step'];
		}

		if ( isset( $data['completed_steps'] ) && is_array( $data['completed_steps'] ) ) {
			$this->completed_steps = array_map( 'intval', $data['completed_steps'] );
		}

		if ( isset( $data['complete_step'] ) ) {
			$this->complete_step( (int) $data['complete_step'] );
		}

		if ( array_key_exists( 'exit_type', $data ) ) {
			$this->exit_type = $data['exit_type'];
		}

		if ( ! empty( $data['start'] ) ) {
			$this->start();
		}

		if ( ! empty( $data['complete'] ) ) {
			$this->complete();
		}

		if ( ! empty( $data['user_exit'] ) ) {
			$this->mark_user_exit();
		}

		$this->touch();

		return $this;
	}
}
