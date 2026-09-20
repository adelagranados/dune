import Svg, { Path } from 'react-native-svg';

/**
 * The canonical hourglass exported from Figma — the path data is the approved
 * asset as-is. Only size and stroke color are parameterized so it can adapt to
 * the active theme.
 */
const VIEWBOX_WIDTH = 52;
const VIEWBOX_HEIGHT = 68;

type HourglassProps = {
  color: string;
  width?: number;
};

export function Hourglass({ color, width = VIEWBOX_WIDTH }: HourglassProps) {
  return (
    <Svg
      width={width}
      height={(width * VIEWBOX_HEIGHT) / VIEWBOX_WIDTH}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      fill="none"
    >
      <Path
        d="M39.3234 6H13C13 18.3445 20.897 30.689 22.6519 35.9795C21.4108 39.7212 17.0973 46.9914 14.6781 55.2945C13.6768 58.7313 13 62.3451 13 65.9589H39.3234C39.3234 60.142 37.57 54.3252 35.5319 49.2463C33.2449 43.547 30.5995 38.777 29.6715 35.9795C31.4264 30.689 39.3234 18.3445 39.3234 6Z"
        stroke={color}
        strokeWidth={2.5}
      />
    </Svg>
  );
}
