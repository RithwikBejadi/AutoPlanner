# Design System Specification: Technical Precision Editorial

## 1. Overview & Creative North Star: "The Architectural Ledger"
This design system rejects the "generic SaaS" aesthetic in favor of a **High-Density Architectural** approach. Our Creative North Star is **The Architectural Ledger**: a space where technical complexity is mastered through extreme typographic clarity, rhythmic spacing, and tonal depth rather than structural lines.

While the prompt calls for "utility and clarity," we achieve this not through a flat, uninspired grid, but through **Sophisticated Minimalism**. We treat data as the primary visual hero. By utilizing intentional asymmetry in header layouts and overlapping "glass" surfaces for overlays, we create an environment that feels authoritative, premium, and purpose-built for high-stakes decision-making.

---

## 2. Colors: Tonal Logic over Structural Lines
We move away from the "boxed-in" look. Hierarchy is established through the light and shadow of the palette, not through 1px strokes.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off parts of the application. Boundaries must be defined solely through background color shifts.
*   **Background (`#f7f9fb`)**: The base canvas.
*   **Surface-Container-Low (`#f0f4f7`)**: Used for large structural blocks (e.g., sidebars or secondary content areas).
*   **Surface-Container-Lowest (`#ffffff`)**: Used for the most interactive, "top-level" data cards.
*   **Transitioning:** A card (`surface-container-lowest`) sitting on a section (`surface-container-low`) provides all the visual affordance needed without a border.

### The "Glass & Gradient" Rule
To elevate the "Professional B2B" feel, floating elements (modals, dropdowns, tooltips) should utilize **Glassmorphism**. Use `surface_container_lowest` at 85% opacity with a `backdrop-filter: blur(12px)`. This ensures the data-heavy background remains visible but blurred, maintaining context without clutter.

### Signature Textures
Main CTAs and Hero Data Points should use a subtle **Linear Gradient**:
*   *Direction:* 135deg
*   *From:* `primary` (`#0053db`)
*   *To:* `primary_dim` (`#0048c1`)
This adds "soul" and a sense of "active energy" to functional elements.

---

## 3. Typography: The Inter Hierarchy
We use **Inter** as a variable font to maximize legibility at high densities. The type system follows an editorial scale where Display and Headline sizes are used sparingly for impact, and Label sizes are optimized for micro-data.

*   **Display/Headline (MD/LG):** Used for high-level dashboard summaries. Set these with a letter-spacing of `-0.02em` to feel tighter and more premium.
*   **Title (SM/MD):** The workhorse for data table headers. Use `on_surface_variant` (`#566166`) for metadata and `on_surface` (`#2a3439`) for primary titles.
*   **Body (MD):** Default for all user-generated content. Line height is strictly `1.5` for readability.
*   **Label (SM/MD):** Specifically for status badges and table column headers. Often used in All-Caps with `+0.05em` tracking to differentiate from body text.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are too heavy for a technical B2B tool. We use **Ambient Depth**.

*   **The Layering Principle:** Depth is achieved by "stacking."
    *   *Level 0:* `surface` (Base)
    *   *Level 1:* `surface_container_low` (In-page sections)
    *   *Level 2:* `surface_container_lowest` (Interactive cards/tables)
*   **Ambient Shadows:** For floating elements like menus, use a multi-layered shadow:
    *   `box-shadow: 0 4px 20px -2px rgba(42, 52, 57, 0.04), 0 12px 40px -8px rgba(42, 52, 57, 0.08);`
    *   The shadow color is derived from `on_surface`, creating a natural integration.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in a high-contrast mode or specific data cell separation), use `outline_variant` (`#a9b4b9`) at **15% opacity**. Never use 100% opaque lines.

---

## 5. Components: The Functional Primitives

### Data Tables (The Core)
*   **Layout:** High-density. Use `3 (0.6rem)` vertical padding for rows.
*   **Separation:** No horizontal dividers. Use a subtle hover state change to `surface_container_high` (`#e1e9ee`) to highlight the active row.
*   **Headers:** Use `label-sm` in `secondary` (`#526074`) color.

### Form Inputs
*   **Container:** Use `surface_container_lowest` with a `ghost border` (`outline_variant` at 20%).
*   **Focus State:** Transition the border to `primary` (`#0053db`) and add a 2px "glow" using `primary_container` at 50% opacity.
*   **Rounding:** Strictly `md` (`0.375rem`) for a crisp, professional corner.

### Status Badges
*   **Success:** `primary_container` background with `on_primary_container` text.
*   **Error:** `error_container` background with `on_error_container` text.
*   **Shape:** `full` (pill) rounding to distinguish them from rectangular data fields.

### Buttons
*   **Primary:** Linear gradient (`primary` to `primary_dim`), `on_primary` text, `md` rounding.
*   **Secondary:** `surface_container_high` background, `on_surface` text. No border.
*   **Tertiary:** Transparent background, `primary` text. Use for low-emphasis actions like "Cancel" or "Export."

### Header-Based Navigation
*   **Surface:** `surface_container_lowest` (White).
*   **Indicator:** Active links are marked by a 2px `primary` underline that sits exactly on the bottom edge of the header, creating a seamless connection to the page content.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use white space as a separator. If two sections feel too close, increase the spacing to `8 (1.75rem)` or `10 (2.25rem)` rather than adding a line.
*   **Do** use `primary_fixed_dim` for subtle background highlights behind important data visualizations.
*   **Do** align all text to a strict baseline grid to maintain the "Architectural" feel.

### Don't:
*   **Don't** use pure black (`#000000`) for text. Use `on_surface` (`#2a3439`) to keep the "Editorial" softness.
*   **Don't** use standard "drop shadows" with high opacity. They muddy the interface and reduce the "Clean" feeling.
*   **Don't** use bright, saturated colors for anything other than `primary` or `error` states. The slate and blue tones must dominate to maintain the "Professional" promise.