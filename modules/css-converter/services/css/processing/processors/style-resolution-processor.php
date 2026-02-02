<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

if (! defined('ABSPATH') ) {
    exit;
}

class Style_Resolution_Processor implements Css_Processor_Interface
{
    public function get_processor_name(): string
    {
        return 'style_resolution';
    }

    public function get_priority(): int
    {
        return 100; // Final step - highest priority number (runs last)
    }

    public function supports_context( Css_Processing_Context $context ): bool
    {
        $unified_style_manager = $context->get_metadata('unified_style_manager');
        $widgets = $context->get_widgets();

        return null !== $unified_style_manager && ! empty($widgets);
    }

    public function process( Css_Processing_Context $context ): Css_Processing_Context
    {
        $unified_style_manager = $context->get_metadata('unified_style_manager');
        $widgets = $context->get_widgets();

        if (null === $unified_style_manager ) {
            return $context;
        }

        $resolved_widgets = $this->resolve_styles_recursively($widgets, $unified_style_manager);

        $debug_info = $unified_style_manager->get_debug_info();
        $reset_styles_stats = $unified_style_manager->get_reset_styles_stats();
        $complex_reset_styles = $unified_style_manager->get_complex_reset_styles();

        $context->set_widgets($resolved_widgets);
        $context->set_metadata('style_resolution_debug_info', $debug_info);
        $context->set_metadata('reset_styles_stats', $reset_styles_stats);
        $context->set_metadata('complex_reset_styles', $complex_reset_styles);

        $context->add_statistic('widgets_with_resolved_styles', $this->count_widgets_with_resolved_styles($resolved_widgets));
        $context->add_statistic('reset_styles_detected', $reset_styles_stats['reset_element_styles'] > 0 || $reset_styles_stats['reset_complex_styles'] > 0 ? 1 : 0);
        $context->add_statistic('complex_reset_styles_count', count($complex_reset_styles));

        return $context;
    }

    public function get_statistics_keys(): array
    {
        return [
        'widgets_with_resolved_styles',
        'reset_styles_detected',
        'complex_reset_styles_count',
        ];
    }

    private function resolve_styles_recursively( array $widgets, $unified_style_manager ): array
    {
        $resolved_widgets = [];

        foreach ( $widgets as $widget ) {
            $widget_id = $this->get_widget_identifier($widget);
            $element_id = $widget['element_id'] ?? 'no-element-id';
            $widget_classes = $widget['attributes']['class'] ?? '';

            $resolved_styles = $unified_style_manager->resolve_styles_for_widget($widget);

            // CRITICAL FIX: Preserve existing widget data (including modified classes) and only add resolved_styles
            $resolved_widget = $widget; // Preserve all existing data including modified attributes
            $resolved_widget['resolved_styles'] = $resolved_styles;

            // Recursively resolve styles for child widgets
            if (! empty($resolved_widget['children']) ) {
                $resolved_widget['children'] = $this->resolve_styles_recursively($resolved_widget['children'], $unified_style_manager);
            }

            $resolved_widgets[] = $resolved_widget;
        }

        return $resolved_widgets;
    }

    private function get_widget_identifier( array $widget ): string
    {
        $widget_type = $widget['widget_type'] ?? 'unknown';
        $element_id = $widget['element_id'] ?? 'no-element-id';
        return "{$widget_type}#{$element_id}";
    }

    private function count_widgets_with_resolved_styles( array $widgets ): int
    {
        $count = 0;

        foreach ( $widgets as $widget ) {
            // Check if widget has resolved styles
            if (! empty($widget['resolved_styles']) ) {
                ++$count;
            }

            // Count children recursively
            if (! empty($widget['children']) ) {
                $count += $this->count_widgets_with_resolved_styles($widget['children']);
            }
        }

        return $count;
    }

    private function find_target_widget( array $widgets, string $element_id ): ?array
    {
        foreach ( $widgets as $widget ) {
            if (( $widget['element_id'] ?? '' ) === $element_id ) {
                return $widget;
            }
            if (! empty($widget['children']) ) {
                $found = $this->find_target_widget($widget['children'], $element_id);
                if ($found ) {
                    return $found;
                }
            }
        }
        return null;
    }

    private function get_widget_resolved_style( ?array $widget, string $property ): string
    {
        if (! $widget ) {
            return 'WIDGET_NOT_FOUND';
        }

        $resolved_styles = $widget['resolved_styles'] ?? [];
        if (isset($resolved_styles[ $property ]) ) {
            $style = $resolved_styles[ $property ];
            return $style['value'] ?? 'NO_VALUE';
        }

        return 'PROPERTY_NOT_FOUND';
    }
}
