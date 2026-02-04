<?php

namespace Elementor\App\Modules\E_Onboarding\Storage\Entities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class User_Choices {

	private ?string $building_for = null;
	private ?string $site_type = null;
	private ?string $experience_level = null;
	private array $goals = [];
	private array $features = [];
	private ?string $design_preference = null;
	private ?string $template_choice = null;
	private ?bool $connected_account = null;
	private ?string $site_name = null;
	private array $custom_data = [];

	public static function from_array( array $data ): self {
		$instance = new self();

		$instance->building_for = $data['building_for'] ?? null;
		$instance->site_type = $data['site_type'] ?? null;
		$instance->experience_level = $data['experience_level'] ?? null;
		$instance->goals = $data['goals'] ?? [];
		$instance->features = $data['features'] ?? [];
		$instance->design_preference = $data['design_preference'] ?? null;
		$instance->template_choice = $data['template_choice'] ?? null;
		$instance->connected_account = $data['connected_account'] ?? null;
		$instance->site_name = $data['site_name'] ?? null;
		$instance->custom_data = $data['custom_data'] ?? [];

		return $instance;
	}

	public function to_array(): array {
		return [
			'building_for' => $this->building_for,
			'site_type' => $this->site_type,
			'experience_level' => $this->experience_level,
			'goals' => $this->goals,
			'features' => $this->features,
			'design_preference' => $this->design_preference,
			'template_choice' => $this->template_choice,
			'connected_account' => $this->connected_account,
			'site_name' => $this->site_name,
			'custom_data' => $this->custom_data,
		];
	}

	public function get_building_for(): ?string {
		return $this->building_for;
	}

	public function set_building_for( ?string $value ): void {
		$this->building_for = $value;
	}

	public function get_site_type(): ?string {
		return $this->site_type;
	}

	public function set_site_type( ?string $value ): void {
		$this->site_type = $value;
	}

	public function get_experience_level(): ?string {
		return $this->experience_level;
	}

	public function set_experience_level( ?string $value ): void {
		$this->experience_level = $value;
	}

	public function get_goals(): array {
		return $this->goals;
	}

	public function set_goals( array $value ): void {
		$this->goals = $value;
	}

	public function get_features(): array {
		return $this->features;
	}

	public function set_features( array $value ): void {
		$this->features = $value;
	}

	public function get_design_preference(): ?string {
		return $this->design_preference;
	}

	public function set_design_preference( ?string $value ): void {
		$this->design_preference = $value;
	}

	public function get_template_choice(): ?string {
		return $this->template_choice;
	}

	public function set_template_choice( ?string $value ): void {
		$this->template_choice = $value;
	}

	public function get_connected_account(): ?bool {
		return $this->connected_account;
	}

	public function set_connected_account( ?bool $value ): void {
		$this->connected_account = $value;
	}

	public function get_site_name(): ?string {
		return $this->site_name;
	}

	public function set_site_name( ?string $value ): void {
		$this->site_name = $value;
	}

	public function get_custom_data(): array {
		return $this->custom_data;
	}

	public function set_custom_data( array $value ): void {
		$this->custom_data = $value;
	}
}
