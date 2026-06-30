/**
 * VitalLine - the signature visual motif of the app: an ECG/heartbeat trace.
 * Used in the hero, as section dividers, and faintly in the background of cards
 * to reinforce the "vital signs / health monitoring" identity throughout.
 */
export default function VitalLine({ className = "", animated = true, color = "currentColor" }) {
  return (
    <svg
      viewBox="0 0 600 80"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 40 H120 L145 40 L160 12 L180 68 L200 40 L230 40 L250 20 L270 60 L290 40 H600"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? "vital-line-path animate-pulseLine" : ""}
      />
    </svg>
  );
}
