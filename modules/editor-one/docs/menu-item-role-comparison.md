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

### Elementor Core (Without Pro Plugin)

#### Elementor Submenu Items (Main WordPress Admin Sidebar)

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

**Note**: Editor role does not have access to the Elementor menu in the main WordPress admin sidebar (starting from `/wp-admin/`).

#### Templates Menu

| Order | Menu Item | Experiment OFF | Experiment ON |
|-------|-----------|----------------|---------------|
| - | **Templates Menu** | ✅ Visible | ✅ Visible |
| 1 | Saved Templates | ✅ Visible | ✅ Visible |
| 2 | Theme Builder | ❌ Not visible (Pro plugin required) | ❌ Not visible (Pro plugin required) |
| 3 | Website Templates | ❌ Not visible (Pro plugin required) | ❌ Not visible (Pro plugin required) |
| 4 | Floating Elements | ❌ Not visible (Pro plugin required) | ❌ Not visible (Pro plugin required) |
| 5 | Popups | ❌ Not visible (Pro plugin required) | ❌ Not visible (Pro plugin required) |

**Note**: When experiment is OFF, Templates menu is visible in WordPress admin sidebar. When experiment is ON, Templates menu is visible in Editor One sidebar navigation. With Pro plugin inactive, only Saved Templates is visible in Editor One sidebar navigation for Editor role.

---

### Elementor Pro (With Pro Plugin Active)

#### Elementor Submenu Items (Main WordPress Admin Sidebar)

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

**Note**: Editor role does not have access to the Elementor menu in the main WordPress admin sidebar (starting from `/wp-admin/`).

#### Templates Menu

| Order | Menu Item | Experiment OFF | Experiment ON |
|-------|-----------|----------------|---------------|
| - | **Templates Menu** | ✅ Visible | ✅ Visible |
| 1 | Saved Templates | ✅ Visible | ✅ Visible |
| 2 | Theme Builder | ✅ Visible | ✅ Visible |
| 3 | Website Templates | ❌ Not visible | ✅ Visible |
| 4 | Floating Elements | ❌ Not visible | ❌ Not visible |
| 5 | Popups | ✅ Visible | ✅ Visible |

**Note**: When experiment is OFF, Templates menu is visible in WordPress admin sidebar. When experiment is ON, Templates menu is visible in Editor One sidebar navigation. Website Templates and Floating Elements are NOT visible in the Templates submenu for Editor role when experiment is OFF, even with Pro plugin active.

---

## Contributor Role

### Elementor Core (Without Pro Plugin)

#### Elementor Submenu Items (Main WordPress Admin Sidebar)

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

#### Templates Menu

| Order | Menu Item | Experiment OFF | Experiment ON |
|-------|-----------|----------------|---------------|
| - | **Templates Menu** | ✅ Visible | ✅ Visible |
| 1 | Saved Templates | ✅ Visible | ✅ Visible |
| 2 | Theme Builder | ❌ Not visible (Pro plugin required) | ❌ Not visible (Pro plugin required) |
| 3 | Website Templates | ❌ Not visible (Pro plugin required) | ❌ Not visible (Pro plugin required) |
| 4 | Floating Elements | ❌ Not visible (Pro plugin required) | ❌ Not visible (Pro plugin required) |
| 5 | Popups | ❌ Not visible (Pro plugin required) | ❌ Not visible (Pro plugin required) |

**Note**: When experiment is OFF, Templates menu is visible in WordPress admin sidebar. When experiment is ON, Templates menu is visible in Editor One sidebar navigation. With Pro plugin inactive, only Saved Templates is visible in Editor One sidebar navigation for Contributor role.

---

### Elementor Pro (With Pro Plugin Active)

#### Elementor Submenu Items (Main WordPress Admin Sidebar)

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

#### Templates Menu

| Order | Menu Item | Experiment OFF | Experiment ON |
|-------|-----------|----------------|---------------|
| - | **Templates Menu** | ✅ Visible | ✅ Visible |
| 1 | Saved Templates | ✅ Visible | ✅ Visible |
| 2 | Theme Builder | ❌ Not visible (requires `publish_posts` capability) | ✅ Visible |
| 3 | Website Templates | ❌ Not visible (requires `publish_posts` capability) | ✅ Visible |
| 4 | Floating Elements | ❌ Not visible (requires `publish_posts` capability) | ✅ Visible |
| 5 | Popups | ❌ Not visible (requires `publish_posts` capability) | ❌ Not visible |

**Note**: When experiment is OFF, Templates menu is visible in WordPress admin sidebar. When experiment is ON, Templates menu is visible in Editor One sidebar navigation. With Pro plugin inactive, all template menu items are visible in Editor One sidebar navigation for Contributor role.

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
