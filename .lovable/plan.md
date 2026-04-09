

# WiFi Sensing Drone — Ground Station 3D Simulator

## Overview
Interactive web-based demo simulating the ground station display of the WiFi CSI drone system. Shows a 3D building with the drone scanning and detecting people inside — all powered by simulated WiFi CSI data (no UWB, no mmWave).

## Main View — 3D Scene (React Three Fiber)
- **Building**: Semi-transparent 3D multi-room structure (2-3 rooms) so you can see inside
- **Drone**: Animated drone model circling/hovering around the building with a visible WiFi signal pulse emanating from it
- **Detected Persons**: 3-4 human figures inside the building shown as **17-keypoint skeletons** (stick figures with joints), each with different poses (standing, sitting, walking)
- **WiFi Signal Visualization**: Animated concentric rings/waves from the drone AP showing the CSI scanning effect passing through walls
- **Camera Controls**: Orbit controls to rotate/zoom the 3D scene freely

## Side Panel — Live Telemetry Data
- **System Status**: WiFi CSI Active ✅ | UWB ❌ Disabled | mmWave ❌ Disabled
- **Per-Person Cards**: For each detected person:
  - Position (x, y, z) with simulated values
  - Activity: Standing / Sitting / Walking (changes over time)
  - Heart Rate: ~72 BPM (simulated with slight variation)
  - Breathing Rate: ~16 BPM (simulated)
  - Confidence score (e.g., 87%)
- **Drone Info**: Battery %, altitude, flight mode (Mapping/Sensing), current position

## Bottom Bar — Mission Timeline
- Animated progress bar showing: Launch → Mapping Phase → Sensing Phase → Complete
- The 3D scene changes behavior based on phase (drone flies fast during mapping, hovers per room during sensing)

## Simulation Flow
1. **Start**: User clicks "Start Mission" — drone lifts off
2. **Mapping Phase** (~15 sec): Drone circles the building, floor plan gradually appears
3. **Sensing Phase** (~20 sec): Drone hovers at each room, persons appear one by one with skeletons and vitals
4. **Complete**: All data displayed, user can freely explore the 3D scene

## Design
- Dark theme (ground station military/tactical feel)
- Green/cyan accent colors for data overlays
- Monospace font for telemetry numbers
- Clean, professional look suitable for graduation demo

## Tech
- React Three Fiber for 3D rendering
- Simulated data with realistic timing and variation
- Fully client-side, no backend needed

