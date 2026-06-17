import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#050505",
        color: "#ff5f1f",
        display: "flex",
        fontSize: 68,
        fontWeight: 900,
        height: "100%",
        justifyContent: "center",
        letterSpacing: "-3px",
        position: "relative",
        width: "100%",
      }}
    >
      :am
    </div>,
    size,
  );
}
