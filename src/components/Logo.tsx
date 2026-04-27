type LogoProps = {
  width?: number | string;
  height?: number | string;
} & React.SVGProps<SVGSVGElement>;

const Logo: React.FC<LogoProps> = ({ width = 200, height = 200, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    xmlSpace="preserve"
    width={width}
    height={height}
    viewBox="0 0 264.583 264.583"
    {...props}
  >
    <defs>
      <linearGradient id="a">
        <stop
          offset={0}
          style={{
            stopColor: "#347d8e",
            stopOpacity: 1,
          }}
        />
        <stop
          offset={1}
          style={{
            stopColor: "#194d65",
            stopOpacity: 1,
          }}
        />
      </linearGradient>
      <linearGradient
        xlinkHref="#a"
        id="b"
        x1={26.458}
        x2={238.125}
        y1={238.569}
        y2={238.569}
        gradientTransform="translate(0 4.848)"
        gradientUnits="userSpaceOnUse"
      />
    </defs>
    {/* <text
      xmlSpace="preserve"
      x={26.249}
      y={251.114}
      style={{
        fontSize: "23.2908px",
        fontFamily: "Vipnagorgialla",
        textAlign: "start",
        direction: "ltr",
        textAnchor: "start",
        fill: "url(#b)",
        strokeWidth: 0.272939,
      }}
      transform="translate(0 -12.712)"
    >
      <tspan
        x={26.249}
        y={251.114}
        style={{
          fontStyle: "normal",
          fontVariant: "normal",
          fontWeight: 700,
          fontStretch: "normal",
          fontFamily: "Vipnagorgialla",
          fill: "url(#b)",
          fillOpacity: 1,
          strokeWidth: 0.272939,
        }}
      >
        {"WATCH"}
        <tspan
          style={{
            fill: "url(#b)",
            fillOpacity: 1,
          }}
        >
          {"TOWER"}
        </tspan>
      </tspan>
    </text> */}
    <path
      d="M132.292 74.083 26.458 148.167l105.834 74.083Z"
      style={{
        fill: "#347d8e",
        fillOpacity: 1,
        strokeWidth: 0.313059,
      }}
      transform="translate(0 -9.273)"
    />
    <path
      d="m132.292 222.25 105.833-74.083-105.833-74.084Z"
      style={{
        fill: "#194d65",
        fillOpacity: 1,
        strokeWidth: 0.31306,
      }}
      transform="translate(0 -9.273)"
    />
    <path
      d="M21.167 113.242v33.337l111.125-77.787V35.454l-15.875 11.113v16.668l-15.875 11.113V57.679L84.667 68.792V85.46L68.792 96.573V79.904L52.917 91.017v16.668l-15.875 11.113v-16.669z"
      style={{
        fill: "#347d8e",
        fillOpacity: 1,
        strokeWidth: 0.33205,
      }}
      transform="translate(0 -9.273)"
    />
    <path
      d="M243.417 113.242v33.337L132.292 68.792V35.454l15.875 11.113v16.668l15.875 11.113V57.679l15.875 11.113V85.46l15.875 11.113V79.904l15.875 11.113v16.668l15.875 11.113v-16.669z"
      style={{
        fill: "#194d65",
        fillOpacity: 1,
        strokeWidth: 0.33205,
      }}
      transform="translate(0 -9.273)"
    />
  </svg>
);
export default Logo;
