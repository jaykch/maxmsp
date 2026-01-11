# BIND1 Max/MSP Patch (Develop)

This repository contains a Max/MSP patch created for BIND1 (Develop) at Catalyst Institute Berlin.

## Files
- `jaykumar_BIND1_patch.maxpat`  
  Stereo audio effect patch (rhythm gate + filter + delay)
- `jaykumar_BIND1_patch_documentation.pdf`  
  Short manual explaining signal flow, parameters, and usage

## Overview
The patch is a stereo audio effect designed for rhythmic recontextualisation. It combines:
1) A phasor-driven rhythm gate (rate and depth)  
2) A low-pass filter for tonal shaping (cutoff and resonance)  
3) A feedback delay for spatial motion (time and feedback)  
4) A wet/dry control to blend processed and original signal

## Signal Flow
Input (L/R) -> Rhythm Gate -> SVF Low-pass Filter -> Delay with Feedback -> Wet/Dry Mix -> Output (L/R)

## Parameters
- Gate Rate (Hz): 0.125 to 16  
- Gate Depth: 0 to 1  
- Filter Cutoff (Hz): 80 to 12000  
- Resonance: 0.5 to 4  
- Delay Time (ms): 10 to 800  
- Feedback: 0 to 0.95  
- Wet/Dry: 0 to 1  

## Quick Start
1) Open the patch in Max 8 or later (Presentation Mode shows the main controls).
2) Route a stereo audio signal into inlet~ L and inlet~ R.
3) Set Wet/Dry to 0.3 to start.
4) Set Gate Rate to 6 to 10 Hz and Gate Depth to 0.6 to 0.9 for rhythmic cuts.
5) Shape tone with Filter Cutoff (try 800 to 4000 Hz) and Resonance (0.8 to 1.6).
6) Add motion with Delay Time (120 to 350 ms) and Feedback (0.2 to 0.6).
7) Record automation or multiple takes and choose the best pass for arrangement.

## Notes
- High Feedback can build quickly. If the delay starts to ring, reduce Feedback and lower Wet/Dry.
- If you hear clicks from gating, reduce Gate Depth or slow Gate Rate.
