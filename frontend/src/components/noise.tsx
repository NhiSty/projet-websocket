export function Noise() {
  return (
    <svg>
      <filter id="noiseFilter2">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.6"
          stitchTiles="stitch"
        />
      </filter>
    </svg>
  );
}
