# Zoom Follow Handoff

## Goal

Make zoom behavior feel closer to Screen Studio:

- zoom should not only snap to a clicked point
- once zoomed in, the camera should follow the cursor
- movement should be smooth, not rigid
- zoomed framing should stay inside the source bounds

This is not just a visual tweak. The current model is too limited and needs a small architecture upgrade.

## Current Behavior

The existing implementation is click-to-zoom, not cursor-follow zoom.

### Current flow

- input events are captured
- `generateAutoZoomKeyframes(...)` filters to `click` events only
- each click creates:
  - a zoom-in keyframe at the click location
  - a zoom-out keyframe back to center after a fixed duration
- preview interpolates between those fixed points

Relevant files:

- `src/renderer/utils/keyframes.ts`
- `src/renderer/canvas/renderer.ts`
- `src/shared/types.ts`
- `src/renderer/stores/project.ts`

## Why It Does Not Feel Like Screen Studio

The current system has these limitations:

- it ignores `move` events entirely
- it always recenters after each zoom
- camera target is a fixed point, not a tracked path
- there is no separate smoothing layer for camera follow
- there is no bounds clamping for zoomed framing

As a result:

- zooms feel like static punches
- the cursor can leave the framed area while zoom remains active
- the motion does not feel cinematic or guided

## Desired Behavior

When the user clicks:

1. zoom in toward the clicked region
2. while zoom is active, follow cursor movement smoothly
3. optionally zoom back out after the follow window ends

The important detail:

- cursor motion and camera motion are not the same thing
- camera should follow with damping or spring smoothing
- it should lag slightly in a pleasing way

## Recommended Implementation

### 1. Introduce an active zoom segment model

The current keyframe-only model is too primitive for this behavior.

Suggested new structure:

```ts
export interface ZoomSegment {
  id: string
  startTime: number
  endTime: number
  scale: number
  followCursor: boolean
  releaseToCenter: boolean
}
```

This can exist alongside the current `ZoomKeyframe` model at first if that reduces migration risk.

Alternative:

- keep keyframes for manual editing
- generate a derived camera path from segments + move events at render time

### 2. Use move events during active zoom

Right now `generateAutoZoomKeyframes(...)` filters to clicks only.

That must change.

Suggested logic:

- clicks start zoom segments
- for each active segment, collect `move` events inside `[startTime, endTime]`
- convert move events into normalized camera targets
- interpolate the cursor path over time

If no move events exist during a segment:

- hold near the click location

### 3. Separate camera smoothing from raw cursor tracking

Do not map camera target directly to the latest cursor coordinate.

Use a smoothing layer:

- critically damped spring
- or exponential smoothing with velocity carry

Conceptually:

- raw cursor path = where the cursor actually went
- camera path = a smoothed, delayed version of that path

This is the core difference between “technically follows” and “feels good”.

### 4. Clamp camera framing to safe bounds

When scale > 1, the visible camera window shrinks.

The camera center must be clamped so the visible rect never leaves the source frame.

For example:

- if zoom scale is `2x`
- visible width is `50%` of the source
- camera center cannot get closer than `25%` to the left or right edge

This must be applied in preview and export.

### 5. Treat click zoom as transitions, not the entire behavior

The click event should only define:

- where zoom begins
- when zoom becomes active
- when zoom ends

The follow phase should be driven by move events after that.

Not:

- click -> fixed zoom point -> back to center

But:

- click -> zoom in -> follow cursor -> optional zoom out

## Suggested Code Changes

### `src/shared/types.ts`

Add a richer zoom representation.

Options:

- add `ZoomSegment`
- or add a richer camera/zoom timeline model

Also consider whether `InputEvent` timestamps are guaranteed relative to recording start. If not, normalize them before camera path generation.

### `src/renderer/utils/keyframes.ts`

Refactor this file substantially.

Current state:

- `generateAutoZoomKeyframes(...)` only uses clicks

Needed:

- derive active zoom windows from click events
- consume move events inside those windows
- compute camera target path over time
- return either:
  - richer zoom segments, or
  - time-sampled camera targets for renderer/export

### `src/renderer/canvas/renderer.ts`

Current state:

- gets `{ x, y, scale }`
- scales around a fixed target center

Needed:

- render from a computed camera state that supports follow behavior
- apply smoothing
- clamp the camera target to bounds

Recommended internal model:

```ts
interface CameraState {
  x: number
  y: number
  scale: number
}
```

Compute this each frame from:

- current time
- zoom segments
- move events

### `src/main/video/exporter.ts`

Preview and export must match.

After preview behavior is correct:

- port the same camera math to export
- do not leave export on the old fixed-keyframe model

This likely means:

- sampling camera state over time
- generating FFmpeg zoom/pan expressions
- or rendering a composited intermediate

If FFmpeg expression complexity becomes too high, document the limitation clearly and keep preview/export parity as a hard requirement.

### `src/renderer/stores/project.ts`

If zoom segments become project data:

- add storage for them here
- add actions for update/delete/create

If this is still generated from raw input events only:

- ensure the required source data is preserved

## Minimal Viable Version

If the goal is to ship the first version quickly:

1. Keep the current click-triggered zoom start.
2. During the active zoom window, follow the nearest smoothed move event.
3. Clamp camera bounds.
4. Keep the existing timed zoom-out behavior.

That will already be much closer to Screen Studio than the current implementation.

## Better Version

After the MVP works:

- expose follow strength
- expose zoom duration
- expose “keep zoomed in” mode
- support manual zoom regions in the timeline
- respect crop/aspect ratio when clamping camera bounds

## Acceptance Criteria

The implementation is correct when:

- clicking zooms into the area of interest
- while zoom is active, moving the cursor causes the framed area to follow it
- camera movement is smooth and slightly delayed
- camera never drifts outside the source frame
- when there are no move events, zoom still behaves sensibly
- preview and export use the same camera behavior

## Recommended Execution Order

1. Update zoom model or add derived zoom segments.
2. Refactor keyframe generation to use move events.
3. Implement camera follow + clamping in preview.
4. Verify behavior manually with a real recording.
5. Port the same logic to export.
6. Add tests around zoom path generation and bounds clamping.

## Important Notes

- Do not try to solve this with easing tweaks only. The issue is not easing. The issue is the model.
- Do not keep recentring to `(0.5, 0.5)` during active zoom unless explicitly desired.
- Keep preview/export parity in mind from the start.
