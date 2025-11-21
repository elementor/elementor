<?php

namespace Elementor\Modules\Variables\Storage\Entities;

class Variable {
	private string $id;
	private string $type;
	private string $label;
	private $value;
	private int $order;
	private ?string $deleted_at;
	private ?string $updated_at;

	private function __construct(
		string $id,
		string $type,
		string $label,
		string $value,
		int $order,
		?string $deleted_at,
		?string $updated_at
	) {
		$this->id = $id;
		$this->type = $type;
		$this->label = $label;
		$this->value = $value;
		$this->order = $order;
		$this->updated_at = $updated_at;
		$this->deleted_at = $deleted_at;
	}

	public static function from_array( array $data ): self {
		return new self(
			$data['id'],
			$data['type'],
			$data['label'] ?? '',
			$data['value'] ?? '',
			$data['order'] ?? 0,
			$data['deleted_at'] ?? null,
			$data['updated_at'] ?? null
		);
	}

	public function soft_delete(): void {
		$this->deleted_at = $this->now();
	}

	public function restore(): void {
		$this->deleted_at = null;
		$this->updated_at = $this->now();
	}

	private function now() {
		return gmdate( 'Y-m-d H:i:s' );
	}

	public function to_array(): array {
		return [
			'type' => $this->type,
			'label' => $this->label,
			'value' => $this->value,
			'order' => $this->order,
			'deleted_at' => $this->deleted_at,
			'updated_at' => $this->updated_at,
		];
	}

	public function id(): string {
		return $this->id;
	}

	public function label(): string {
		return $this->label;
	}

	public function is_deleted(): bool {
		return ! empty( $this->deleted_at );
	}

	public function apply_changes( array $data ): void {
		$allowed_fields = [ 'label', 'value', 'order' ];
		$has_changes = false;

		foreach ( $allowed_fields as $field ) {
			if ( isset( $data[ $field ] ) ) {
				$this->$field = $data[ $field ];
				$has_changes = true;
			}
		}

		if ( $has_changes ) {
			$this->updated_at = $this->now();
		}
	}
}
