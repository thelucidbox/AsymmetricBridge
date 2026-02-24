import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { IntroScene } from "./scenes/IntroScene";
import { DashboardScene } from "./scenes/DashboardScene";
import { SignalScene } from "./scenes/SignalScene";
import { PerformanceScene } from "./scenes/PerformanceScene";
import { OutroScene } from "./scenes/OutroScene";

const TRANSITION_FRAMES = 20;
const transition = fade();
const timing = linearTiming({ durationInFrames: TRANSITION_FRAMES });

export const DemoVideo = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0D0D0F",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: "white",
      }}
    >
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={210}>
          <IntroScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={transition}
          timing={timing}
        />

        <TransitionSeries.Sequence durationInFrames={200}>
          <DashboardScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={transition}
          timing={timing}
        />

        <TransitionSeries.Sequence durationInFrames={180}>
          <SignalScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={transition}
          timing={timing}
        />

        <TransitionSeries.Sequence durationInFrames={180}>
          <PerformanceScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={transition}
          timing={timing}
        />

        <TransitionSeries.Sequence durationInFrames={210}>
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </div>
  );
};
