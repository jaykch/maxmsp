# Feature Roadmap

## Product Direction

The recording/playback reliability work is done. The next phase should focus on turning `maxmsp` from a recorder with styling controls into a usable editor.

The highest-value next feature is **cropping** because it unlocks:

- reframing around part of the screen
- better vertical and square outputs
- cleaner tutorials without forcing re-records
- a foundation for area-focus workflows later

## Recommended Order

### P0: Crop + Transform Foundation

Implement clip-level framing controls first.

Scope:

- add crop state to each clip
- add clip positioning / scale metadata if needed
- support crop in preview canvas
- support crop in FFmpeg export
- add inspector controls for crop values
- add a quick reset action

Suggested data model:

- add `crop: { left: number; top: number; right: number; bottom: number }`
- optionally add `transform: { scale: number; x: number; y: number }` if we want pan-after-crop soon

Why first:

- current `Clip` only stores timing and file path
- preview/export both assume the full source frame
- crop is the cleanest next step before aspect ratios, area emphasis, or advanced reframing

### P1: Aspect Ratio Presets

After crop works, add output presets:

- `16:9`
- `9:16`
- `1:1`
- `4:3`
- custom

Scope:

- new presets in the inspector
- update project resolution quickly
- preview layout should clearly reflect portrait and square outputs

Why after crop:

- aspect-ratio changes without crop feel limited
- crop + portrait output together is a real workflow

### P1: Trim Editing

Improve clip editing beyond raw duration.

Scope:

- start/end trim handles in timeline
- inspector numeric trim fields
- preview respects trimmed in/out points
- export respects trimmed range

Why:

- this is the minimum viable editor behavior

### P1: Playback Controls

Make editing faster.

Scope:

- play from playhead
- stop at clip end and reset state cleanly
- seek by clicking/dragging timeline
- keyboard shortcut for play/pause
- optional playback speeds: `0.5x`, `1x`, `1.5x`, `2x`

### P2: Cursor Controls

Start matching creator-focused polish.

Scope:

- cursor show/hide toggle
- click highlight style
- cursor scale
- smoothing strength

Why:

- this is one of the most visible "Screen Studio" style features

### P2: Webcam + Mic

Expand recording inputs after editing is stronger.

Scope:

- microphone capture
- webcam track capture
- simple picture-in-picture layout

Why not first:

- useful, but weaker than crop/trim for editing output quality

### P2: Captions / Callouts / Highlighting

Add communication tools after core editing is stable.

Scope:

- simple callout rectangles
- blur/mask/highlight regions
- captions as timeline items

## Cropping Implementation Plan

### Step 1. Extend types

Files:

- `src/shared/types.ts`
- `src/renderer/stores/project.ts`

Add crop metadata to `Clip`.

Suggested shape:

```ts
export interface ClipCrop {
  left: number
  top: number
  right: number
  bottom: number
}
```

Then store it on every clip with zero defaults.

### Step 2. Add project store actions

Files:

- `src/renderer/stores/project.ts`

Add:

- `updateClipCrop(id, crop)`
- maybe reuse `updateClip(id, updates)` if that remains clean enough

### Step 3. Preview support

Files:

- `src/renderer/components/Preview/Preview.tsx`
- `src/renderer/canvas/renderer.ts`

Current preview draws the entire video:

- compute source rect from crop
- draw only that source rect into the padded preview area
- preserve zoom behavior on the cropped frame

Important:

- clamp crop values so width and height never go below a minimum
- keep preview behavior identical when crop is all zeros

### Step 4. Export support

Files:

- `src/main/video/exporter.ts`

Current export only scales the full frame and overlays it on the background.

Add FFmpeg crop before scale:

- `crop=in_w-left-right:in_h-top-bottom:left:top`
- then existing scale/overlay pipeline

Important:

- validate crop values before building the filter
- ensure export matches preview exactly

### Step 5. Inspector UI

Files:

- `src/renderer/components/Inspector/Inspector.tsx`

Add a new crop section when a clip exists:

- left
- top
- right
- bottom
- reset crop

Start with numeric sliders/inputs. Do not build direct drag handles until the math is proven.

### Step 6. Tests

Add or update tests for:

- clip defaults include zero crop
- crop update action works
- export filter includes crop when crop is non-zero
- preview math stays stable for zero crop and basic crop values

## Concrete Build Sequence

1. Add clip crop model and store support.
2. Add preview crop rendering.
3. Add export crop filter.
4. Add inspector controls.
5. Add aspect-ratio presets.
6. Add trim handles.

## Recommendation

Start with cropping now.

It is the best next feature because it is:

- high value for output quality
- local to the current architecture
- a prerequisite for stronger portrait/social formats
- a clean bridge into more advanced reframing features later
