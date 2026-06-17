import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#050505",
          color: "#ff5f1f",
          display: "flex",
          fontSize: 56,
          fontWeight: 900,
          height: "100%",
          justifyContent: "center",
          letterSpacing: "-2px",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "#ff5f1f",
            bottom: 30,
            height: 8,
            left: 32,
            position: "absolute",
            right: 32,
          }}
        />
        a11am
      </div>
    ),
    size,
  );
}
