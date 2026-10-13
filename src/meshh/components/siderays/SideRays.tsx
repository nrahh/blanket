"use client";

import { useMemo } from "react";
import { ShaderCanvas } from "@/meshh/components/shader-canvas";

type Origin = "top-left" | "top-right" | "bottom-right" | "bottom-left";

const originToFlip = (origin: Origin): [number, number] => {
  switch (origin) {
    case "top-left":
      return [1, 0];
    case "bottom-right":
      return [0, 1];
    case "bottom-left":
      return [1, 1];
    default:
      return [0, 0];
  }
};

export const fragmentShader = `
float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  float cosAngle = dot(normalize(sourceToCoord), rayRefDirection);
  return clamp(
    (0.45 + 0.15 * sin(cosAngle * seedA + u_time * speed)) +
    (0.3 + 0.2 * cos(-cosAngle * seedB + u_time * speed)),
    0.0, 1.0) *
    clamp((u_resolution.x - length(sourceToCoord)) / u_resolution.x, 0.5, 1.0);
}

void main() {
  vec2 fragCoord = v_uv * u_resolution;
  if (u_flipX > 0.5) fragCoord.x = u_resolution.x - fragCoord.x;
  if (u_flipY > 0.5) fragCoord.y = u_resolution.y - fragCoord.y;

  vec2 coord = vec2(fragCoord.x, u_resolution.y - fragCoord.y);
  vec2 rayPos = vec2(u_resolution.x * 1.1, -0.5 * u_resolution.y);

  float tiltRad = u_tilt * 3.14159265 / 180.0;
  float cs = cos(tiltRad);
  float sn = sin(tiltRad);
  vec2 rel = coord - rayPos;
  vec2 tiltedCoord = vec2(rel.x * cs - rel.y * sn, rel.x * sn + rel.y * cs) + rayPos;

  float halfSpread = u_spread * 0.275;
  vec2 rayRefDir1 = normalize(vec2(cos(0.785398 + halfSpread), sin(0.785398 + halfSpread)));
  vec2 rayRefDir2 = normalize(vec2(cos(0.785398 - halfSpread), sin(0.785398 - halfSpread)));

  vec4 rays1 = vec4(u_rayColor1.rgb, 1.0) * rayStrength(rayPos, rayRefDir1, tiltedCoord, 36.2214, 21.11349, u_speed);
  vec4 rays2 = vec4(u_rayColor2.rgb, 1.0) * rayStrength(rayPos, rayRefDir2, tiltedCoord, 22.3991, 18.0234, u_speed * 0.2);

  vec4 color = rays1 * (1.0 - u_blend) * 0.9 + rays2 * u_blend * 0.9;

  float distanceToLight = length(fragCoord.xy - vec2(rayPos.x, u_resolution.y - rayPos.y)) / u_resolution.y;
  float brightness = u_intensity * 0.4 / pow(max(distanceToLight, 0.001), u_falloff);
  color.rgb *= brightness;

  float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  color.rgb = mix(vec3(gray), color.rgb, u_saturation);

  color.a = max(color.r, max(color.g, color.b)) * u_opacity;
  fragColor = color;
}
`;

interface SideRaysProps {
  speed?: number;
  rayColor1?: string;
  rayColor2?: string;
  intensity?: number;
  spread?: number;
  origin?: Origin;
  tilt?: number;
  saturation?: number;
  blend?: number;
  falloff?: number;
  opacity?: number;
  className?: string;
}

export default function SideRays({
  speed = 2.5,
  rayColor1 = "#EAB308",
  rayColor2 = "#96c8ff",
  intensity = 2,
  spread = 2,
  origin = "top-right",
  tilt = 0,
  saturation = 1.5,
  blend = 0.75,
  falloff = 2.0,
  opacity = 1.0,
  className = "",
}: SideRaysProps) {
  const [flipX, flipY] = originToFlip(origin);

  const uniforms = useMemo(
    () => ({
      speed,
      rayColor1,
      rayColor2,
      intensity,
      spread,
      flipX,
      flipY,
      tilt,
      saturation,
      blend,
      falloff,
      opacity,
    }),
    [
      blend,
      falloff,
      flipX,
      flipY,
      intensity,
      opacity,
      rayColor1,
      rayColor2,
      saturation,
      spread,
      speed,
      tilt,
    ],
  );

  return (
    <div
      className={["relative", "h-full", "w-full", "overflow-hidden", "bg-black", className]
        .filter(Boolean)
        .join(" ")}
    >
      <ShaderCanvas fragmentShader={fragmentShader} uniforms={uniforms} />
    </div>
  );
}