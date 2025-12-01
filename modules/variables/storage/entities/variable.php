<?php

namespace Elementor\Modules\Variables\Storage\Entities;

use InvalidArgumentException;

class Variable {
	private array $data;

	private function __construct( array $data ) {
		$this->data = $data;
	}

	public static function create_new( array $data ): self {
		$now = gmdate( 'Y-m-d H:i:s' );

		$data['created_at'] = $now;
		$data['updated_at'] = $now;

		return self::from_array( $data );
	}

	public static function from_array( array $data ): self {
		$required = [ 'id', 'type', 'label', 'value' ];

		foreach ( $required as $key ) {
			if ( ! array_key_exists( $key, $data ) ) {
				throw new InvalidArgumentException(
					sprintf(
						"Missing required field '%s' in %s::from_array()",
						esc_html( $key ),
						self::class
					)
				);
			}
		}

		return new self( $data );
	}

	public function soft_delete(): void {
		$this->data['deleted_at'] = $this->now();
	}

	public function restore(): void {
		unset( $this->data['deleted_at'] );
		// TODO to be removed if client is no longer need this
		unset( $this->data['deleted'] );

		$this->data['updated_at'] = $this->now();
	}

	private function now() {
		return gmdate( 'Y-m-d H:i:s' );
	}

	public function to_array(): array {
		return array_diff_key( $this->data, array_flip( [ 'id' ] ) );
	}

	public function id(): string {
		return $this->data['id'];
	}

	public function label(): string {
		return $this->data['label'];
	}

	public function order(): int {
		return $this->data['order'];
	}

	public function value() {
		return $this->data['value'];
	}

	public function set_value( $value ) {
		$this->data['value'] = $value;
	}

	public function type() {
		return $this->data['type'];
	}

	public function has_order(): int {
		return isset( $this->data['order'] );
	}

	public function is_deleted(): bool {
		return isset( $this->data['deleted_at'] );
	}

	public function apply_changes( array $data ): void {
		$allowed_fields = [ 'label', 'value', 'order' ];
		$has_changes = false;

		foreach ( $allowed_fields as $field ) {
			if ( isset( $data[ $field ] ) ) {
				$this->data[ $field ] = $data[ $field ];

				$has_changes = true;
			}
		}

		if ( $has_changes ) {
			$this->data['updated_at'] = $this->now();
		}
	}
}
