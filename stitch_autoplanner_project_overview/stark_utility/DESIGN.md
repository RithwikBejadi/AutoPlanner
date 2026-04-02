# Design System Specification: The Utility Editorial

## 1. Overview & Creative North Star
**Creative North Star: "The Architectural Utility"**

This design system moves beyond basic minimalism into the realm of high-end editorial utility. It is inspired by the precision of Swiss modernism—where white space is not "empty," but a structural element. We reject the "web-template" aesthetic of heavy shadows and rounded cards in favor of a stark, intentional layout that feels like a premium productivity tool.

The system relies on **Functional Clarity**. We achieve prestige through extreme typographic hierarchy, surgical precision in spacing, and a high-contrast palette. By removing visual "noise" (shadows, heavy borders, decorative gradients), we place the user’s focus entirely on action and information.

---

## 2. Colors
Our palette is rooted in absolute contrast. We use a pure white base to symbolize a "blank canvas" of productivity, punctuated by obsidian-black actions.

### The Palette (Material Design Mapping)
- **Primary (`#000000`)**: Reserved for high-intent actions and primary branding.
- **Secondary (`#583cdf`)**: Used sparingly for "smart" features, links, or success states to provide a technical, modern edge.
- **Surface (`#fcf9f8`)**: A slightly off-white used for large layout blocks to soften the starkness of `#FFFFFF`.
- **Outline Variant (`#cfc4c5`)**: For those rare moments where a "Ghost Border" is required.

### The "No-Line" Rule
Standard 1px solid borders are generally prohibited for layout sectioning. Instead, boundaries are defined by **Background Shifting**.
- To separate a sidebar from a main content area, transition from `surface` (`#fcf9f8`) to `surface_container_lowest` (`#ffffff`).
- The transition should feel like a change in paper stock, not a drawn line.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested precision layers. 
- **Level 1 (Base):** `surface`
- **Level 2 (Containers):** `surface_container_low`
- **Level 3 (Interactive Elements):** `surface_container_highest`
By nesting a "High" container within a "Low" background, we create architectural depth without the need for traditional shadows.

### Signature Textures
While the system is "flat," we introduce **Glassmorphism** for floating overlays (like command palettes or dropdowns). Use a semi-transparent `surface` color with a `20px` backdrop-blur. This keeps the "Utility" feel while adding a layer of contemporary sophistication.

---

## 3. Typography
Typography is the cornerstone of this system. We use **Inter** for its neutral, highly legible "utility" feel, and **Cal Sans** for moments of editorial character.

| Level | Token | Font | Size | Character |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Cal Sans | 3.5rem | High-impact, low kerning. |
| **Headline** | `headline-md`| Cal Sans | 1.75rem | For section anchors. |
| **Title** | `title-md` | Inter | 1.125rem | Semi-bold for navigation/headers. |
| **Body** | `body-md` | Inter | 0.875rem | The workhorse. 1.5x line-height. |
| **Label** | `label-sm` | Inter | 0.6875rem | Uppercase, +5% letter spacing. |

**Editorial Intent:** Use `label-sm` in all-caps for metadata. This provides a "technical document" feel that reinforces the professional utility of the system.

---

## 4. Elevation & Depth
In "The Architectural Utility," depth is a result of **Tonal Layering**, not light simulation.

- **The Layering Principle:** To lift a card, do not add a shadow. Instead, change the background color from `surface_container` to `surface_container_lowest`. The "white-on-grey" effect creates a crisp, clean lift.
- **Ambient Shadows (The Exception):** If a component must float (e.g., a Modal), use a "Whisper Shadow": `color: rgba(27, 28, 28, 0.06)`, `blur: 40px`, `spread: 0`. It should be felt, not seen.
- **The Ghost Border:** For input fields or containers requiring containment, use `outline_variant` at 20% opacity. This creates a "hairline" effect that disappears into the layout until focused.

---

## 5. Components

### Buttons
- **Primary:** `background: #000000`, `color: #FFFFFF`. Corner radius: `md` (0.375rem). No shadow.
- **Secondary:** `background: transparent`, `border: 1px solid #e4e2e1`. 
- **Tertiary/Ghost:** `background: transparent`, `color: #1b1c1c`. Interaction is shown via a subtle shift to `surface_container_high`.

### Input Fields
- **State:** Unfocused inputs have no border—only a `surface_container_low` background. 
- **Focus:** On focus, the field transitions to `surface_container_lowest` with a 1px solid `#000000` border. This "pop" of black signals the transition from "reading" to "acting."

### Cards & Lists
- **Rule:** Forbid divider lines between list items. Use the **Spacing Scale `3` (1rem)** to create "White Space Dividers." 
- If a list is dense, use a alternating background color (`surface` vs `surface_container_low`) for zebra-striping rather than lines.

### Chips
- **Action Chips:** Small, tight padding (`0.5` scale). Use `surface_container_highest` with `label-sm` text. They should look like physical labels taped to a document.

---

## 6. Do's and Don'ts

### Do
- **Do** use asymmetric layouts. Align text to the far left and actions to the far right with massive "breathing room" (Scale `12` or `16`) between them.
- **Do** use `Cal Sans` for numbers and large headers to inject brand personality into data.
- **Do** favor vertical white space over horizontal lines.

### Don't
- **Don't** use 100% black text on 100% white for long-form body text. Use `on_surface_variant` (`#4c4546`) to reduce eye strain.
- **Don't** use rounded corners larger than `xl` (0.75rem). This system is about "architectural" precision, not "bubbly" consumerism.
- **Don't** use drop shadows for buttons. High-contrast color fills are enough to denote interactivity.

### Accessibility Note
While we emphasize "subtle" tones, ensure that all text against background shifts maintains a 4.5:1 contrast ratio. When using "Ghost Borders," ensure the input label and focus states are highly prominent to assist users with visual impairments.