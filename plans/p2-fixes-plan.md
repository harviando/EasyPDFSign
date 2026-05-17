# Plan: Fix Rotation, Handle Overlap, and Delete Button Position

## Issues

1. **Rotation direction is inverted** - dragging clockwise rotates counter-clockwise
2. **Rotation handle stick overlays top-middle resize handle** - visual overlap
3. **Delete button needs to move below bottom-middle resize handle** - currently at top-left

---

## Fix 1: Invert Rotation Direction

**File:** `src/components/PDFViewer.jsx`, line 148

**Current code:**
```js
let newAngle = initialSig.rotation + (currentAngle - startAngle);
```

**Change to:**
```js
let newAngle = initialSig.rotation - (currentAngle - startAngle);
```

Negating the delta makes clockwise mouse movement produce clockwise rotation.

---

## Fix 2: Move Rotation Handle Stick Away from Top-Middle Resize Handle

**File:** `src/App.css`, `.rotation-handle` and `.rotation-handle-line` (lines 733-780)

**Current state:**
- `.rotation-handle` is at `top: -40px`
- `.rotation-handle-line` starts at `top: 18px` (below the circle) and extends `22px` down, reaching into the top-middle resize handle area (`top: -8px` relative to signature)

**Change:**
- Move `.rotation-handle` to `top: -60px` (further from the box)
- Adjust `.rotation-handle-line{