<?php

namespace Elementor\Modules\Variables\Storage\Entities;

use Elementor\Modules\Variables\Adapters\Prop_Type_Adapter;
use Elementor\Modules\Variables\PropTypes\Size_Variable_Prop_Type;
use Elementor\Modules\Variables\Storage\Exceptions\Type_Mismatch;
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

	public function set_type( $type ) {
		$this->data['type'] = $type;
	}

	public function has_order(): int {
		return isset( $this->data['order'] );
	}

	public function is_deleted(): bool {
		return isset( $this->data['deleted_at'] );
	}

	/**
	 * @throws Type_Mismatch If a type that is not allowed to be changed is passed.
	 */
	private function maybe_apply_type( array $data ) {
		if ( ! array_key_exists( 'type', $data ) ) {
			return false;
		}

		$current_type = $this->type();
		$target_type  = $data['type'];

		if ( $current_type === $target_type ) {
			return false;
		}

		$custom_size_prop_type = Prop_Type_Adapter::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY;
		$size_prop_type = Size_Variable_Prop_Type::get_key();

		$allowed_types = [ $custom_size_prop_type, $size_prop_type ];

		$is_valid_transition =
			in_array( $current_type, $allowed_types, true ) &&
			in_array( $target_type, $allowed_types, true );

		if ( ! $is_valid_transition ) {
			throw new Type_Mismatch( 'Type change is forbidden' );
		}

		$this->set_type( $data['type'] );

		return true;
	}

	public function apply_changes( array $data ): void {
		$allowed_fields = [ 'label', 'value', 'order', 'type' ];
		$has_changes = $this->maybe_apply_type( $data );

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
