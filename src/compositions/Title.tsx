import { z } from "zod";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const titleSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
});

const ease = Easing.bezier(0.16, 1, 0.3, 1);

export const Title: React.FC<z.infer<typeof titleSchema>> = ({
  eyebrow,
  title,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const reveal = (start: number) =>
    interpolate(frame, [start, start + 30], [0, 1], {
      easing: ease,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const eyebrowIn = reveal(0);
  const titleIn = reveal(8);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#f4f1ec",
        color: "#1a1917",
        fontFamily: "Georgia, 'Times New Roman', serif",
        justifyContent: "center",
        padding: "0 160px",
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          fontFamily: "Helvetica, Arial, sans-serif",
          fontSize: 22,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          opacity: eyebrowIn,
          transform: `translateY(${(1 - eyebrowIn) * 12}px)`,
          marginBottom: 32,
        }}
      >
        {eyebrow}
      </div>
      <div style={{ overflow: "hidden" }}>
        <h1
          style={{
            margin: 0,
            fontSize: 180,
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            transform: `translateY(${(1 - titleIn) * 100}%)`,
          }}
        >
          {title}
        </h1>
      </div>
    </AbsoluteFill>
  );
};
