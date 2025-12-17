## Menu Structure Comparison: e_editor_one Experiment

**Starting point**: `/wp-admin/`

### Elementor Main Menu

| Menu Item | Experiment OFF | Experiment ON | Notes |
|-----------|----------------|---------------|-------|
| **Main Menu** | Elementor | Elementor | Menu text remains the same, but navigation changes when experiment is active |

---

## Administrator Role

### Elementor Submenu Items (Main WordPress Admin Sidebar)

| Order | Menu Item | Experiment OFF | Experiment ON |
|-------|-----------|----------------|---------------|
| 1 | Home | ✅ Visible | ✅ Visible |
| 1 | Editor | ❌ Not present | ✅ Visible |
| 2 | Settings | ✅ Visible | ✅ Visible |
| 3 | Role Manager | ✅ Visible | ✅ Visible |
| 3 | Submissions | ✅ Visible | ✅ Visible |
| 4 | Element Manager | ✅ Visible | ✅ Visible |
| 5 | Tools | ✅ Visible | ✅ Visible |
| 6 | System Info | ✅ Visible | ✅ Visible |
| 9 | Custom Fonts | ✅ Visible | ✅ Visible |
| 10 | Custom Icons | ✅ Visible | ✅ Visible |
| 11 | Custom Code | ✅ Visible | ✅ Visible |
| 14 | Upgrade | ✅ Visible | ✅ Visible |

**Note**: When experiment is ON, items marked as visible are accessible through either the main WordPress admin sidebar (starting from `/wp-admin/`) or the Editor One sidebar navigation (accessible after navigating to Elementor menu).

### Templates Menu

| Order | Menu Item | Experiment OFF | Experiment ON |
|-------|-----------|----------------|---------------|
| - | **Templates Menu** | ✅ Visible | ✅ Visible |
| 1 | Saved Templates | ✅ Visible | ✅ Visible |
| 2 | Theme Builder | ✅ Visible | ✅ Visible |
| 3 | Floating Elements | ✅ Visible | ✅ Visible |
| 4 | Website Templates | ✅ Visible | ✅ Visible |
| 5 | Popups | ✅ Visible | ✅ Visible |

---

## Editor Role

### Elementor Submenu Items (Main WordPress Admin Sidebar)

| Order | Menu Item | Experiment OFF | Experiment ON |
|-------|-----------|----------------|---------------|
| 1 | Home | ❌ Not visible | ❌ Not visible |
| 1 | Editor | ❌ Not present | ❌ Not visible |
| 2 | Settings | ❌ Not visible | ❌ Not visible |
| 3 | Role Manager | ❌ Not visible | ❌ Not visible |
| 3 | Submissions | ❌ Not visible | ❌ Not visible |
| 4 | Element Manager | ❌ Not visible | ❌ Not visible |
| 5 | Tools | ❌ Not visible | ❌ Not visible |
| 6 | System Info | ❌ Not visible | ❌ Not visible |
| 9 | Custom Fonts | ❌ Not visible | ❌ Not visible |
| 10 | Custom Icons | ❌ Not visible | ❌ Not visible |
| 11 | Custom Code | ❌ Not visible | ❌ Not visible |
| 14 | Upgrade | ❌ Not visible | ❌ Not visible |

**Note**: Editor role does not have access to the Elementor menu in the main WordPress admin sidebar (starting from `/wp-admin/`). When experiment is ON, the Editor One sidebar navigation exists but is empty - no menu items are visible.

### Templates Menu

| Order | Menu Item | Experiment OFF | Experiment ON |
|-------|-----------|----------------|---------------|
| - | **Templates Menu** | ✅ Visible | ❌ Not visible |
| 1 | Saved Templates | ✅ Visible | ❌ Not visible |
| 2 | Theme Builder | ✅ Visible | ❌ Not visible |
| 3 | Popups | ✅ Visible | ❌ Not visible |

**Note**: When experiment is OFF, Templates menu is visible for Editor role with submenu items: Saved Templates, Theme Builder, and Popups. When experiment is ON, Templates menu is hidden by CSS (`display: none !important;`) and the Editor One sidebar navigation exists but is empty - no menu items are visible.

---

## Contributor Role

### Elementor Submenu Items (Main WordPress Admin Sidebar)

| Order | Menu Item | Experiment OFF | Experiment ON |
|-------|-----------|----------------|---------------|
| 1 | Home | ❌ Not visible | ❌ Not visible |
| 1 | Editor | ❌ Not present | ❌ Not visible |
| 2 | Settings | ❌ Not visible | ❌ Not visible |
| 3 | Role Manager | ❌ Not visible | ❌ Not visible |
| 3 | Submissions | ❌ Not visible | ❌ Not visible |
| 4 | Element Manager | ❌ Not visible | ❌ Not visible |
| 5 | Tools | ❌ Not visible | ❌ Not visible |
| 6 | System Info | ❌ Not visible | ❌ Not visible |
| 9 | Custom Fonts | ❌ Not visible | ❌ Not visible |
| 10 | Custom Icons | ❌ Not visible | ❌ Not visible |
| 11 | Custom Code | ❌ Not visible | ❌ Not visible |
| 14 | Upgrade | ❌ Not visible | ❌ Not visible |

**Note**: Contributor role does not have access to the Elementor menu in the main WordPress admin sidebar (starting from `/wp-admin/`).

### Templates Menu

| Order | Menu Item | Experiment OFF | Experiment ON |
|-------|-----------|----------------|---------------|
| - | **Templates Menu** | ✅ Visible | ❌ Not visible |
| 1 | Saved Templates | ✅ Visible | ❌ Not visible |

---

## Subscriber Role

### Elementor Submenu Items (Main WordPress Admin Sidebar)

| Order | Menu Item | Experiment OFF | Experiment ON |
|-------|-----------|----------------|---------------|
| 1 | Home | ❌ Not visible | ❌ Not visible |
| 1 | Editor | ❌ Not visible | ❌ Not visible |
| 2 | Settings | ❌ Not visible | ❌ Not visible |
| 3 | Role Manager | ❌ Not visible | ❌ Not visible |
| 3 | Submissions | ❌ Not visible | ❌ Not visible |
| 4 | Element Manager | ❌ Not visible | ❌ Not visible |
| 5 | Tools | ❌ Not visible | ❌ Not visible |
| 6 | System Info | ❌ Not visible | ❌ Not visible |
| 9 | Custom Fonts | ❌ Not visible | ❌ Not visible |
| 10 | Custom Icons | ❌ Not visible | ❌ Not visible |
| 11 | Custom Code | ❌ Not visible | ❌ Not visible |
| 14 | Upgrade | ❌ Not visible | ❌ Not visible |

**Note**: Subscriber role does not have access to the WordPress admin dashboard. Users with this role are redirected to the frontend and cannot access any admin menus.

### Templates Menu

| Order | Menu Item | Experiment OFF | Experiment ON |
|-------|-----------|----------------|---------------|
| - | **Templates Menu** | ❌ Not visible | ❌ Not visible |
| 1 | Saved Templates | ❌ Not visible | ❌ Not visible |
| 2 | Theme Builder | ❌ Not visible | ❌ Not visible |
| 3 | Floating Elements | ❌ Not visible | ❌ Not visible |
| 4 | Website Templates | ❌ Not visible | ❌ Not visible |
| 5 | Popups | ❌ Not visible | ❌ Not visible |
