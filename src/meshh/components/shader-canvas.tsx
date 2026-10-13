"use client";

import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";

export type ShaderUniformValue = number | boolean | string | string[];

// Accepts either a plain object (the common case — a new object each render
// is fine, only its shape matters) or a ref to one. Passing a ref lets a
// consumer mutate uniform values every frame (e.g. easing toward a pointer
// position) without forcing a React re-render on every tick — the render
// loop below reads whatever is in the object at draw time either way.
export type UniformsInput =
  | Record<string, ShaderUniformValue>
  | MutableRefObject<Record<string, ShaderUniformValue>>;

function isUniformsRef(
  input: UniformsInput,
): input is MutableRefObject<Record<string, ShaderUniformValue>> {
  return typeof input === "object" && input !== null && "current" in input;
}

function resolveUniforms(
  input: UniformsInput,
): Record<string, ShaderUniformValue> {
  return isUniformsRef(input) ? input.current : input;
}

const vertexShader = `#version 300 es
  in vec2 a_position;
  out vec2 v_uv;

  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

export type Heightmap = {
  label?: string;
  shape?: "diamond";
  blur?: number;
  scale?: number;
  // An uploaded logo takes over the mask instead of the procedural
  // diamond/text shape — its alpha channel becomes the heightmap, so it
  // should be a transparent-background image for a clean silhouette.
  image?: string;
};

// Single WebGL2 fullscreen-shader runtime. Uniform declarations are inferred
// from the `uniforms` prop (number/boolean -> float, hex string -> vec4 color,
// string[] -> vec4[8] + matching `_length` int for a color array) rather than
// a fixed vocabulary, so any component's control schema maps straight through.
// `mousePosition` is a special case: it's always declared as vec4 and pinned
// to a centered, at-rest value (0.5, 0.5, 0, 0) — none of the components that
// reference it actually wire up live pointer tracking, it's inherited
// placeholder plumbing from their Framer export.
export function ShaderCanvas({
  fragmentShader,
  uniforms,
  image,
  textures,
  heightmap,
  className = "",
  onUnsupported,
}: {
  fragmentShader: string;
  uniforms: UniformsInput;
  image?: string;
  textures?: Record<string, string>;
  heightmap?: Heightmap;
  className?: string;
  onUnsupported?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const resolvedUniforms = resolveUniforms(uniforms);
  const uniformsRef = useRef(resolvedUniforms);
  const heightmapRef = useRef(heightmap);
  // Remount only when the program shape changes (uniform types, sampler set).
  // Heightmap blur/scale are tuned live via the ref instead of remounting.
  const declarationKey = [
    ...Object.entries(resolvedUniforms).map(
      ([name, value]) =>
        `${name}:${Array.isArray(value) ? `array${value.length}` : typeof value}`,
    ),
    image ? "img" : "",
    textures ? Object.keys(textures).sort().join("+") : "",
    heightmap ? "hm" : "",
  ]
    .sort()
    .join(",");
  const textureKey = textures ? Object.values(textures).join("|") : "";

  useEffect(() => {
    uniformsRef.current = resolvedUniforms;
  }, [resolvedUniforms]);

  useEffect(() => {
    heightmapRef.current = heightmap;
  }, [heightmap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return mountShader({
      canvas,
      fragmentShader,
      uniformsRef,
      image,
      textures,
      heightmapRef,
      onUnsupported,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fragmentShader, declarationKey, image, textureKey]);

  return (
    <canvas ref={canvasRef} className={`block h-full w-full ${className}`} />
  );
}

function mountShader({
  canvas,
  fragmentShader,
  uniformsRef,
  image,
  textures,
  heightmapRef,
  onUnsupported,
}: {
  canvas: HTMLCanvasElement;
  fragmentShader: string;
  uniformsRef: MutableRefObject<Record<string, ShaderUniformValue>>;
  image?: string;
  textures?: Record<string, string>;
  heightmapRef: MutableRefObject<Heightmap | undefined>;
  onUnsupported?: () => void;
}) {
  const context = canvas.getContext("webgl2", {
    alpha: true,
    antialias: true,
    premultipliedAlpha: false,
  })!;

  if (!context) {
    onUnsupported?.();
    return;
  }

  const textureNames = textures ? Object.keys(textures) : [];
  const samplerUniforms: string[] = [];
  if (image) samplerUniforms.push("u_texture");
  for (const name of textureNames) samplerUniforms.push(`u_${name}`);
  const useHeightmap = Boolean(heightmapRef.current);
  if (useHeightmap) samplerUniforms.push("u_image_heightmap");

  const program = createProgram(
    context,
    vertexShader,
    wrapFragment(
      fragmentShader,
      buildUniformDeclarations(uniformsRef.current, samplerUniforms),
    ),
  )!;
  if (!program) return;

  context.useProgram(program);

  const buffer = context.createBuffer();
  context.bindBuffer(context.ARRAY_BUFFER, buffer);
  context.bufferData(
    context.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    context.STATIC_DRAW,
  );

  const position = context.getAttribLocation(program, "a_position");
  context.enableVertexAttribArray(position);
  context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0);

  const resolution = context.getUniformLocation(program, "u_resolution");
  const time = context.getUniformLocation(program, "u_time");
  const pixelRatioLocation = context.getUniformLocation(
    program,
    "u_pixelRatio",
  );
  const locations = new Map<string, WebGLUniformLocation | null>();

  function getLocation(name: string) {
    if (!locations.has(name)) {
      locations.set(name, context.getUniformLocation(program, name));
    }

    return locations.get(name);
  }

  // Texture units: the diamond heightmap (if any) takes unit 0 since
  // updateHeightmapTexture binds TEXTURE0 internally; image/extra textures
  // follow on subsequent units.
  let unit = 0;
  let heightmapTexture: WebGLTexture | null = null;
  let heightmapUnit = -1;
  let heightmapKey = "";
  let heightmapImage: HTMLImageElement | null = null;
  let heightmapImageSrc = "";

  // Kicks off (or reuses) the load for an uploaded logo. Returns the loaded
  // image once ready, or null while still loading — the caller retries next
  // frame since `heightmapKey` is left stale until a texture is produced.
  function ensureHeightmapImage(src: string) {
    if (heightmapImageSrc === src) return heightmapImage;
    heightmapImageSrc = src;
    heightmapImage = null;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (heightmapImageSrc === src) heightmapImage = img;
    };
    img.src = src;
    return null;
  }

  if (useHeightmap) {
    heightmapUnit = unit++;
    heightmapTexture = context.createTexture();
    context.activeTexture(context.TEXTURE0 + heightmapUnit);
    context.bindTexture(context.TEXTURE_2D, heightmapTexture);
    setTextureParams(context);
    context.uniform1i(
      context.getUniformLocation(program, "u_image_heightmap"),
      heightmapUnit,
    );
  }

  const imageSources: { uniform: string; src: string }[] = [];
  if (image) imageSources.push({ uniform: "u_texture", src: image });
  for (const name of textureNames) {
    imageSources.push({ uniform: `u_${name}`, src: textures![name] });
  }

  const imageBindings: {
    uniform: string;
    unit: number;
    texture: WebGLTexture;
  }[] = [];

  for (const { uniform, src } of imageSources) {
    const textureUnit = unit++;
    const created = context.createTexture();
    if (!created) continue;

    context.activeTexture(context.TEXTURE0 + textureUnit);
    context.bindTexture(context.TEXTURE_2D, created);
    // 1x1 placeholder until the image loads so texelFetch/textureSize are valid.
    context.texImage2D(
      context.TEXTURE_2D,
      0,
      context.RGBA,
      1,
      1,
      0,
      context.RGBA,
      context.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255]),
    );
    setTextureParams(context);
    context.uniform1i(
      context.getUniformLocation(program, uniform),
      textureUnit,
    );

    const source = new Image();
    source.crossOrigin = "anonymous";
    source.onload = () => {
      context.activeTexture(context.TEXTURE0 + textureUnit);
      context.bindTexture(context.TEXTURE_2D, created);
      context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, false);
      context.texImage2D(
        context.TEXTURE_2D,
        0,
        context.RGBA,
        context.RGBA,
        context.UNSIGNED_BYTE,
        source,
      );
    };
    source.src = src;

    imageBindings.push({ uniform, unit: textureUnit, texture: created });
  }

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(canvas.clientWidth * pixelRatio));
    const height = Math.max(1, Math.floor(canvas.clientHeight * pixelRatio));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    context.viewport(0, 0, width, height);
    context.uniform2f(resolution, width, height);
    context.uniform1f(pixelRatioLocation, pixelRatio);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  let frame = 0;
  const start = performance.now();

  function render(now: number) {
    resize();
    context.useProgram(program);
    context.uniform1f(time, (now - start) / 1000);

    if (heightmapTexture) {
      const heightmap = heightmapRef.current;
      const key = heightmap
        ? [
            heightmap.image ? `img:${heightmap.image}` : (heightmap.shape ?? "diamond"),
            heightmap.blur ?? 0,
            heightmap.scale ?? 1,
            canvas.width,
            canvas.height,
          ].join(":")
        : "";

      if (heightmap && key !== heightmapKey) {
        if (heightmap.image) {
          const img = ensureHeightmapImage(heightmap.image);
          if (img) {
            updateHeightmapTextureFromImage(context, heightmapTexture, {
              img,
              scale: heightmap.scale ?? 1,
              width: canvas.width,
              height: canvas.height,
            });
            heightmapKey = key;
          }
          // Not loaded yet — key stays stale so this retries next frame.
        } else {
          updateHeightmapTexture(context, heightmapTexture, {
            shape: heightmap.shape ?? "diamond",
            blur: heightmap.blur ?? 0,
            scale: heightmap.scale ?? 1,
            width: canvas.width,
            height: canvas.height,
          });
          heightmapKey = key;
        }
      }

      context.activeTexture(context.TEXTURE0 + heightmapUnit);
      context.bindTexture(context.TEXTURE_2D, heightmapTexture);
      const location = getLocation("u_image_heightmap");
      if (location) context.uniform1i(location, heightmapUnit);
    }

    for (const binding of imageBindings) {
      context.activeTexture(context.TEXTURE0 + binding.unit);
      context.bindTexture(context.TEXTURE_2D, binding.texture);
      const location = getLocation(binding.uniform);
      if (location) context.uniform1i(location, binding.unit);
    }

    for (const [name, value] of Object.entries(uniformsRef.current)) {
      if (name === "mousePosition") {
        const location = getLocation(`u_${name}`);
        if (location) context.uniform4f(location, 0.5, 0.5, 0, 0);
        continue;
      }

      if (Array.isArray(value)) {
        setColorArray(context, program, name, value);
        continue;
      }

      const location = getLocation(`u_${name}`);
      if (!location) continue;

      if (typeof value === "number") {
        context.uniform1f(location, value);
      } else if (typeof value === "boolean") {
        context.uniform1f(location, value ? 1 : 0);
      } else if (typeof value === "string") {
        const [r, g, b] = hexToRgb(value);
        context.uniform4f(location, r, g, b, 1);
      }
    }

    context.drawArrays(context.TRIANGLES, 0, 6);
    frame = requestAnimationFrame(render);
  }

  frame = requestAnimationFrame(render);

  return () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
    if (buffer) context.deleteBuffer(buffer);
    if (heightmapTexture) context.deleteTexture(heightmapTexture);
    for (const binding of imageBindings) context.deleteTexture(binding.texture);
    context.deleteProgram(program);
  };
}

function setTextureParams(context: WebGL2RenderingContext) {
  context.texParameteri(
    context.TEXTURE_2D,
    context.TEXTURE_WRAP_S,
    context.CLAMP_TO_EDGE,
  );
  context.texParameteri(
    context.TEXTURE_2D,
    context.TEXTURE_WRAP_T,
    context.CLAMP_TO_EDGE,
  );
  context.texParameteri(
    context.TEXTURE_2D,
    context.TEXTURE_MIN_FILTER,
    context.LINEAR,
  );
  context.texParameteri(
    context.TEXTURE_2D,
    context.TEXTURE_MAG_FILTER,
    context.LINEAR,
  );
}

function buildUniformDeclarations(
  uniforms: Record<string, ShaderUniformValue>,
  samplers: string[],
) {
  const lines: string[] = [];

  for (const [name, value] of Object.entries(uniforms)) {
    if (name === "mousePosition") {
      lines.push(`uniform vec4 u_${name};`);
    } else if (Array.isArray(value)) {
      lines.push(`uniform vec4 u_${name}[8];`);
      lines.push(`uniform int u_${name}_length;`);
    } else if (typeof value === "string") {
      lines.push(`uniform vec4 u_${name};`);
    } else {
      lines.push(`uniform float u_${name};`);
    }
  }

  for (const sampler of samplers) {
    lines.push(`uniform sampler2D ${sampler};`);
  }

  return lines.join("\n    ");
}

function wrapFragment(source: string, declarations: string) {
  return `#version 300 es
    precision highp float;
    precision highp int;

    in vec2 v_uv;
    out vec4 fragColor;

    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_pixelRatio;
    ${declarations}

    ${source}
  `;
}

function updateHeightmapTexture(
  gl: WebGL2RenderingContext,
  texture: WebGLTexture,
  {
    label,
    shape,
    width,
    height,
    blur,
    scale,
  }: {
    label?: string;
    shape?: "diamond";
    width: number;
    height: number;
    blur: number;
    scale: number;
  },
) {
  const mask = document.createElement("canvas");
  mask.width = Math.max(1, width);
  mask.height = Math.max(1, height);
  const context = mask.getContext("2d");
  if (!context) return;

  context.clearRect(0, 0, mask.width, mask.height);
  context.fillStyle = "white";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.shadowColor = "rgba(255,255,255,0.9)";
  context.shadowBlur = Math.max(0, blur);

  if (shape === "diamond") {
    const size = Math.min(mask.width, mask.height) * 0.72 * scale;
    const cx = mask.width / 2;
    const cy = mask.height / 2;
    const half = size / 2;

    context.beginPath();
    context.moveTo(cx, cy - half);
    context.lineTo(cx + half, cy);
    context.lineTo(cx, cy + half);
    context.lineTo(cx - half, cy);
    context.closePath();
    context.fill();
  } else {
    const text = label?.trim() || "MESHH";
    context.font = `900 ${Math.min(mask.width * 0.24, mask.height * 0.42) * scale}px Arial, Helvetica, sans-serif`;
    context.fillText(text, mask.width / 2, mask.height / 2);
  }

  remapAlphaAndUploadHeightmap(gl, texture, mask);
}

// An uploaded logo replaces the procedural shape/text mask above — it's
// contain-fit into the same footprint (72% of the shorter side) so swapping
// in a real logo doesn't change the effect's overall scale, then goes through
// the same alpha-channel remap. Expects a transparent-background image.
function updateHeightmapTextureFromImage(
  gl: WebGL2RenderingContext,
  texture: WebGLTexture,
  {
    img,
    width,
    height,
    scale,
  }: {
    img: HTMLImageElement;
    width: number;
    height: number;
    scale: number;
  },
) {
  const mask = document.createElement("canvas");
  mask.width = Math.max(1, width);
  mask.height = Math.max(1, height);
  const context = mask.getContext("2d");
  if (!context) return;

  context.clearRect(0, 0, mask.width, mask.height);

  const maxSize = Math.min(mask.width, mask.height) * 0.72 * scale;
  const ratio = Math.min(
    maxSize / Math.max(img.naturalWidth, 1),
    maxSize / Math.max(img.naturalHeight, 1),
  );
  const drawWidth = img.naturalWidth * ratio;
  const drawHeight = img.naturalHeight * ratio;
  context.drawImage(
    img,
    (mask.width - drawWidth) / 2,
    (mask.height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );

  remapAlphaAndUploadHeightmap(gl, texture, mask);
}

// Shared tail for both mask sources: the heightmap shader only reads the red
// channel, so the mask's alpha is copied into r/b/a (g stays 0) before upload.
function remapAlphaAndUploadHeightmap(
  gl: WebGL2RenderingContext,
  texture: WebGLTexture,
  mask: HTMLCanvasElement,
) {
  const context = mask.getContext("2d");
  if (!context) return;

  const image = context.getImageData(0, 0, mask.width, mask.height);
  for (let index = 0; index < image.data.length; index += 4) {
    const alpha = image.data[index + 3];
    image.data[index] = alpha;
    image.data[index + 1] = 0;
    image.data[index + 2] = alpha;
    image.data[index + 3] = alpha;
  }
  context.putImageData(image, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragment) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function setColorArray(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string,
  values: string[],
) {
  const colors = values.slice(0, 8);
  const lengthLocation = gl.getUniformLocation(program, `u_${name}_length`);
  gl.uniform1i(lengthLocation, colors.length);

  colors.forEach((color, index) => {
    const [r, g, b] = hexToRgb(color);
    const location = gl.getUniformLocation(program, `u_${name}[${index}]`);
    gl.uniform4f(location, r, g, b, 1);
  });
}

function hexToRgb(value: string) {
  const normalized = value.replace("#", "").trim();
  const hex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized.padEnd(6, "0").slice(0, 6);

  const int = Number.parseInt(hex, 16);

  return [
    ((int >> 16) & 255) / 255,
    ((int >> 8) & 255) / 255,
    (int & 255) / 255,
  ] as const;
}