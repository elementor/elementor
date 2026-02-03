<?php

namespace Elementor\App\Modules\OnboardingV2\Storage\Entities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class User_Choices {

	private array $data;

	private function __construct( array $data ) {
		$this->data = $data;
	}

	public static function from_array( array $data ): self {
		return new self( $data );
	}

	public static function default(): self {
		return new self( [] );
	}

	public function to_array(): array {
		return $this->data;
	}

	public function get( string $key, $default = null ) {
		return $this->data[ $key ] ?? $default;
	}

	public function set( string $key, $value ): self {
		$this->data[ $key ] = $value;

		return $this;
	}

	public function has( string $key ): bool {
		return array_key_exists( $key, $this->data );
	}

	public function remove( string $key ): self {
		unset( $this->data[ $key ] );

		return $this;
	}

	public function merge( array $data ): self {
		$this->data = array_merge( $this->data, $data );

		return $this;
	}

	public function building_for(): ?string {
		return $this->get( 'building_for' );
	}

	public function set_building_for( string $value ): self {
		return $this->set( 'building_for', $value );
	}

	public function site_type(): ?string {
		return $this->get( 'site_type' );
	}

	public function set_site_type( string $value ): self {
		return $this->set( 'site_type', $value );
	}

	public function experience_level(): ?string {
		return $this->get( 'experience_level' );
	}

	public function set_experience_level( string $value ): self {
		return $this->set( 'experience_level', $value );
	}

	public function goals(): array {
		return $this->get( 'goals', [] );
	}

	public function set_goals( array $value ): self {
		return $this->set( 'goals', $value );
	}

	public function features(): array {
		return $this->get( 'features', [] );
	}

	public function set_features( array $value ): self {
		return $this->set( 'features', $value );
	}

	public function design_preference(): ?string {
		return $this->get( 'design_preference' );
	}

	public function set_design_preference( string $value ): self {
		return $this->set( 'design_preference', $value );
	}

	public function template_choice(): ?string {
		return $this->get( 'template_choice' );
	}

	public function set_template_choice( string $value ): self {
		return $this->set( 'template_choice', $value );
	}

	public function site_name(): ?string {
		return $this->get( 'site_name' );
	}

	public function set_site_name( string $value ): self {
		return $this->set( 'site_name', $value );
	}

	public function is_connected(): bool {
		return (bool) $this->get( 'connected_account', false );
	}

	public function set_connected( bool $value ): self {
		return $this->set( 'connected_account', $value );
	}
}
