"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import PageLoader from "./PageLoader";

gsap.registerPlugin(ScrollTrigger);

const TALENTS = [
  {
    name: "NaSofia",
    role: "Singer - Songwriter • Visual Poet",
    img: "/img/na-s.jpg",
    statement: "Where poetry becomes light, and light becomes sound.",
    index: "01",
  },
  {
    name: "Toanlelet",
    role: "Singer - Songwriter • DJ",
    img: "/img/toanlelet.jpg",
    statement:
      "Surfing unseen frequencies between memory, motion, and starlight.",
    index: "02",
  },
];

export default function A11amLanding() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);
  const flashRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const readyPartsRef = useRef(new Set<string>());
  const [isPageReady, setIsPageReady] = useState(false);

  const markReady = useCallback((part: "window" | "fonts" | "frame") => {
    readyPartsRef.current.add(part);
    if (
      readyPartsRef.current.has("window") &&
      readyPartsRef.current.has("fonts") &&
      readyPartsRef.current.has("frame")
    ) {
      setIsPageReady(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const complete = (part: "window" | "fonts") => {
      if (!cancelled) {
        markReady(part);
      }
    };
    const onWindowLoad = () => complete("window");

    if (document.readyState === "complete") {
      complete("window");
    } else {
      window.addEventListener("load", onWindowLoad, { once: true });
    }

    if ("fonts" in document) {
      document.fonts.ready.then(
        () => complete("fonts"),
        () => complete("fonts"),
      );
    } else {
      complete("fonts");
    }

    const fallbackTimer = window.setTimeout(() => {
      complete("window");
      complete("fonts");
    }, 2800);

    return () => {
      cancelled = true;
      window.removeEventListener("load", onWindowLoad);
      window.clearTimeout(fallbackTimer);
    };
  }, [markReady]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set("[data-gsap-reveal]", { autoAlpha: 0, y: 38 });
      gsap.to("[data-gsap-reveal]", {
        autoAlpha: 1,
        y: 0,
        duration: 1.15,
        ease: "power3.out",
        stagger: 0.12,
      });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.7,
            onUpdate: (self) => {
              scrollProgressRef.current = self.progress;
              const flashPulse = Math.max(
                0,
                Math.sin(self.progress * Math.PI * 13) - 0.42,
              );
              const glitchBeat =
                Math.sin(self.progress * Math.PI * 41) > 0.82 ? 0.22 : 0;
              const burst = Math.pow(self.progress, 1.65) * 0.36;
              const pulse = Math.min(1, flashPulse + burst + glitchBeat);
              flashRef.current = pulse;
              root.style.setProperty("--scroll-progress", `${self.progress}`);
              root.style.setProperty("--flash", `${pulse}`);
            },
          },
        })
        .to(
          "[data-hero-mark]",
          {
            scale: 0.86,
            x: 299,
            letterSpacing: "0.08em",
            opacity: 0.24,
            ease: "none",
          },
          0,
        )
        .to(
          "[data-canvas-shell]",
          {
            filter: "contrast(1.9) invert(0.08) saturate(2) brightness(1.12)",
            ease: "none",
          },
          0.18,
        )
        .to(
          "[data-talent-panel]",
          {
            yPercent: -8,
            ease: "none",
            stagger: 0.08,
          },
          0.45,
        );

      const incubatorSection = root.querySelector<HTMLElement>(
        "[data-incubator-section]",
      );
      const incubatorWords = Array.from(
        root.querySelectorAll<HTMLElement>("[data-incubator-word]"),
      );

      if (incubatorSection && incubatorWords.length > 0) {
        gsap.set(incubatorWords, {
          autoAlpha: 0,
          y: 30,
          x: 0,
          filter: "blur(8px)",
        });

        gsap
          .timeline({
            defaults: {
              ease: "power2.out",
            },
            scrollTrigger: {
              trigger: incubatorSection,
              start: () => (window.innerWidth < 1200 ? "top 8%" : "top top"),
              end: () =>
                `+=${Math.max(window.innerHeight * 1.25, incubatorWords.length * 170)}`,
              scrub: 0.65,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })
          .to(
            incubatorWords,
            {
              autoAlpha: 1,
              y: 0,
              x: 0,
              filter: "blur(0px)",
              duration: 0.5,
              stagger: 0.18,
            },
            0,
          );
      }

      ScrollTrigger.batch("[data-talent-panel]", {
        start: "top 78%",
        onEnter: (items) => {
          gsap.to(items, {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.15,
            overwrite: true,
          });
        },
        onLeaveBack: (items) => {
          gsap.to(items, {
            autoAlpha: 0.32,
            y: 30,
            duration: 0.45,
            ease: "power2.out",
            overwrite: true,
          });
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setClearColor(0x060606, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 8.2);

    const uniforms = {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uFlash: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uResolution: { value: new THREE.Vector2(1, 1) },
    };

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 10, 96, 96),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms,
        vertexShader: `
          uniform float uTime;
          uniform float uScroll;
          varying vec2 vUv;
          varying float vWave;

          void main() {
            vUv = uv;
            vec3 pos = position;
            float ripple = sin((pos.x * 1.1) + (uTime * 0.24)) * 0.16;
            // pos.y * 1.3 để mượt hơn
            ripple += cos((pos.y * 0.1) - (uTime * 0.42)) * 0.18;
            pos.z += ripple * (0.8 + uScroll * 3.6);
            pos.x += sin(pos.y * 1.7 + uTime * 0.8) * (0.08 + uScroll * 0.32);
            pos.y += cos(pos.x * 1.9 - uTime * 0.6) * uScroll * 0.22;
            vWave = ripple;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          precision highp float;
          uniform float uTime;
          uniform float uScroll;
          uniform float uFlash;
          uniform vec2 uPointer;
          varying vec2 vUv;
          varying float vWave;

          mat2 rotate2d(float angle) {
            float s = sin(angle);
            float c = cos(angle);
            return mat2(c, -s, s, c);
          }

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
          }

          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(
              mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
              mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
              u.y
            );
          }

          float boxMask(vec2 p, vec2 size) {
            vec2 d = abs(p) - size;
            return 1.0 - smoothstep(0.0, 0.018, max(d.x, d.y));
          }

          float shard(vec2 uv, vec2 center, float angle, vec2 size, float jag) {
            vec2 p = rotate2d(angle) * (uv - center);
            p.x += sin(p.y * 18.0 + jag) * 0.95;
            p.y += noise(p * 18.0 + jag) * 0.55;
            float body = boxMask(p, size);
            float chip = smoothstep(0.38, 1.0, noise(p * 35.0 + jag));
            return body * (0.5 + chip * 0.6);
          }

          float glitchBand(vec2 uv, float y, float height, float drift) {
            float band = smoothstep(height, 0.0, abs(uv.y - y));
            float tear = smoothstep(0.55, 1.0, noise(vec2(uv.y * 20.0, drift)));
            return band * tear;
          }

          void main() {
            vec2 uv = vUv * 2.0 - 1.0;
            uv.x *= 1.65;
            float dist = length(uv - vec2(uPointer.x * 0.24, uPointer.y * 0.18));
            float burst = 0.35 + smoothstep(0.08, 0.9, uScroll) * (0.34 + uFlash * 1.25);
            float blockShift = floor(noise(vec2(floor(uv.y * 18.0), floor(uTime * 8.0))) * 3.0) - 1.0;
            vec2 glitchUv = uv;
            // glitch set cao + uflash hon
            glitchUv.x += blockShift * (0.0 + uFlash * 0.0);
            glitchUv.x += sin(uv.y * 110.0 + uTime * 1.0) * (0.004 + uFlash * 0.016);
            glitchUv.y += vWave * 2.08;

            float fragments = 0.0;
            fragments += shard(glitchUv, vec2(-0.58, 0.42), -0.5, vec2(0.42, 0.118), uTime * 0.42);
            // fragments += shard(glitchUv, vec2(0.38, 0.26), 0.18, vec2(0.56, 0.014), -uTime * 0.36);
            // fragments += shard(glitchUv, vec2(-0.08, -0.08), -0.12, vec2(0.72, 0.012), uTime * 0.28);
            // fragments += shard(glitchUv, vec2(0.72, -0.5), 0.46, vec2(0.34, 0.016), -uTime * 0.5);
            // fragments += shard(glitchUv, vec2(-0.48, -0.72), 0.08, vec2(0.5, 0.01), uTime * 0.32);

            float hairline = smoothstep(10.65, 1.0, noise(glitchUv * vec2(42.0, 8.0) + uTime * 0.7));
            hairline *= smoothstep(0.06, 0.0, abs(sin(glitchUv.y * 34.0 + uTime)));
            float bands = 0.0;
            // bands += glitchBand(glitchUv, 0.58 + sin(uTime * 0.1) * 0.08, 0.055, uTime * 0.9);
            // bands += glitchBand(glitchUv, -0.18 + cos(uTime * 0.2) * 0.1, 0.04, -uTime * 0.75);
            // bands += glitchBand(glitchUv, -0.68, 0.03, uTime * 0.3);
            float flashCut = step(0.78, noise(vec2(floor(uTime * 5.0), floor(uv.y * 6.0))));
            float scan = clamp(fragments * 0.86 + hairline * 0.38 + bands * (0.5 + uFlash) + flashCut * uFlash * 0.45, 0.0, 1.0);
            float mask = smoothstep(1.35, 0.08, dist);
            float cut = smoothstep(0.12, 0.82, scan + mask * 0.08 + uFlash * 0.2);

            vec3 ink = vec3(0.08, 0.015, 0.0);
            vec3 cold = vec3(1.0, 0.42, 0.0);
            vec3 acid = vec3(1.0, 0.74, 0.08);
            vec3 hot = vec3(1.0, 0.16, 0.0);
            vec3 color = mix(cold, acid, smoothstep(-0.2, 0.9, glitchUv.y + uScroll));
            color = mix(color, hot, smoothstep(0.7, 0.0, abs(glitchUv.x + sin(uTime * 0.7) * 0.18)) + bands * 0.38);
            color = mix(ink, color, cut);
            color.r += scan * uFlash * 0.28;
            color.g -= bands * uFlash * 0.12;
            color = mix(color, 1.0 - color, clamp(uFlash * 0.8 + flashCut * 0.35, 0.0, 1.0));
            color += vec3(mask * 0.06 + hairline * 0.1);

            float alpha = 0.14 + cut * 0.5 + burst * 0.12 + bands * 0.18 + hairline * 0.08;
            gl_FragColor = vec4(color, alpha);
          }
        `,
      }),
    );
    scene.add(plane);

    const ringGroup = new THREE.Group();
    // scene.add(ringGroup);

    const ringMaterials = [
      new THREE.LineBasicMaterial({
        color: 0xfff0c2,
        transparent: true,
        opacity: 0.56,
      }),
      new THREE.LineBasicMaterial({
        color: 0xff9f1c,
        transparent: true,
        opacity: 0.42,
      }),
      new THREE.LineBasicMaterial({
        color: 0xff4d00,
        transparent: true,
        opacity: 0.4,
      }),
    ];

    for (let i = 0; i < 12; i += 1) {
      const points: THREE.Vector3[] = [];
      const radiusX = 1.15 + i * 0.32;
      const radiusY = 0.72 + i * 0.22;
      for (let a = 0; a <= 160; a += 1) {
        const angle = (a / 160) * Math.PI * 2;
        const warp = Math.sin(angle * 5 + i) * 0.13;
        points.push(
          new THREE.Vector3(
            Math.cos(angle) * (radiusX + warp),
            Math.sin(angle) * (radiusY - warp * 0.5),
            -0.28 - i * 0.03,
          ),
        );
      }

      const line = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(points),
        ringMaterials[i % ringMaterials.length],
      );
      line.rotation.z = i * 0.17;
      line.userData.speed = i % 2 === 0 ? 0.13 : -0.18;
      ringGroup.add(line);
    }

    const particleCount = 920;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      const stride = i * 3;
      particlePositions[stride] = (Math.random() - 0.5) * 13;
      particlePositions[stride + 1] = (Math.random() - 0.5) * 7.2;
      particlePositions[stride + 2] = (Math.random() - 0.5) * 2.2;
    }
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3),
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.018,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const clock = new THREE.Clock();
    let animationFrame = 0;
    let hasRenderedFirstFrame = false;

    const resize = () => {
      const width = host.clientWidth || window.innerWidth;
      const height = host.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      uniforms.uResolution.value.set(width, height);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const scroll = scrollProgressRef.current;
      const flash = flashRef.current;

      uniforms.uTime.value = elapsed;
      uniforms.uScroll.value += (scroll - uniforms.uScroll.value) * 0.07;
      uniforms.uFlash.value += (flash - uniforms.uFlash.value) * 0.12;
      uniforms.uPointer.value.lerp(
        new THREE.Vector2(pointerRef.current.x, pointerRef.current.y),
        0.08,
      );

      plane.rotation.z = Math.sin(elapsed * 0.18) * 0.03 + scroll * 0.08;
      ringGroup.rotation.z = elapsed * 0.04 + scroll * 1.2;
      ringGroup.rotation.x = Math.sin(elapsed * 0.16) * 0.18 + scroll * 0.32;
      particles.rotation.z = -elapsed * 0.035;
      particles.position.y = scroll * -0.8;
      camera.position.z = 8.2 - scroll * 1.3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      if (!hasRenderedFirstFrame) {
        hasRenderedFirstFrame = true;
        markReady("frame");
      }
      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    if (prefersReducedMotion) {
      uniforms.uTime.value = 2.4;
      uniforms.uScroll.value = 0.18;
      ringGroup.rotation.z = 0.9;
      renderer.render(scene, camera);
      markReady("frame");
    } else {
      animate();
    }

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      host.removeChild(renderer.domElement);
      plane.geometry.dispose();
      (plane.material as THREE.ShaderMaterial).dispose();
      ringGroup.children.forEach((child) => {
        const line = child as THREE.Line;
        line.geometry.dispose();
      });
      ringMaterials.forEach((material) => material.dispose());
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, [markReady]);

  return (
    <main
      ref={rootRef}
      className="relative isolate min-h-[430vh] overflow-clip [--flash:0] [--scroll-progress:0] md:min-h-[420vh]"
      aria-busy={!isPageReady}
      data-ready={isPageReady}
    >
      <PageLoader ready={isPageReady} />
      <div
        ref={canvasHostRef}
        className="fixed inset-0 z-[-3] [transform:translateZ(0)] [background:radial-gradient(circle_at_18%_20%,rgba(255,36,92,0.18),transparent_26%),radial-gradient(circle_at_74%_12%,rgba(0,231,255,0.2),transparent_28%),#050505] [filter:contrast(1.1)_invert(0)_saturate(1.25)] transition-[filter] duration-[160ms] ease-linear [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full"
        data-canvas-shell
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 z-[-1] mix-blend-difference opacity-[calc(0.25+var(--flash)*0.75)] [background:linear-gradient(115deg,rgba(255,255,255,calc(var(--flash)*0.26)),rgba(223,255,31,calc(var(--flash)*0.16))_28%,rgba(255,36,92,calc(var(--flash)*0.18))_54%,rgba(0,0,0,0)),repeating-linear-gradient(0deg,rgba(255,255,255,calc(var(--flash)*0.08))_0_1px,transparent_1px_9px)]"
        aria-hidden="true"
      />

      <nav
        className="fixed left-0 right-0 top-0 z-[5] flex items-center justify-between px-4 py-[0.9rem] font-mono text-[0.76rem] mix-blend-difference md:p-[clamp(1rem,2.5vw,2rem)]"
        aria-label="Primary"
      >
        <a href="#top" className="font-bold text-white">
          A11:am
        </a>
        <div className="flex gap-[0.72rem] md:gap-[clamp(0.85rem,2vw,1.7rem)] [&>a]:text-[0.68rem] [&>a]:text-white/70 md:[&>a]:text-[0.76rem]">
          <a href="#incubator">incubator</a>
          <a href="#talents">talents</a>
        </div>
      </nav>

      <section
        id="top"
        className="relative mx-auto flex min-h-[100svh] max-w-[90vw] 5xl:max-w-[1500px] flex-col justify-end px-[5px] pb-[clamp(3.6rem,8vh,7rem)] pt-28 md:grid md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.32fr)] md:items-end md:px-[clamp(1.1rem,4vw,4.5rem)]"
        aria-labelledby="hero-title"
      >
        <div className="max-w-[72rem]">
          <h1
            id="hero-title"
            className="m-0 max-w-full text-[clamp(4.6rem,25vw,7.3rem)] font-[950] leading-[0.76] tracking-[0] text-white/90 mix-blend-difference md:text-[clamp(5.1rem,10vw,23rem)]"
            data-gsap-reveal
            data-hero-mark
          >
            after 11:am
          </h1>
          <p
            className="mb-0 mt-[clamp(1.4rem,3vw,2.8rem)] max-w-[45rem] text-[11pt] font-extralight leading-[1.35] text-[rgba(245,241,232,0.82)] md:text-[clamp(1.05rem,1.5vw,1.55rem)]"
            data-gsap-reveal
          >
            An independent art studio and talent incubator for emerging artists,
            musicians, and visual creators, curating online exhibitions and
            turning raw ideas into meaningful public work.
          </p>
        </div>
        <div
          className="mt-9 grid w-full grid-cols-1 gap-[0.7rem] border-t border-[rgba(245,241,232,0.26)] pt-4 font-mono text-[0.76rem] text-[rgba(245,241,232,0.78)] md:mt-0 md:w-auto md:self-end md:justify-self-end md:border-l md:border-t-0 md:border-[rgba(245,241,232,0.28)] md:pl-4 md:pt-0"
          aria-label="Studio notes"
          data-gsap-reveal
        >
          <span>artist incubation</span>
          <span>digital exhibitions</span>
          <span>creative identity</span>
        </div>
      </section>

      <section
        id="incubator"
        className="relative mx-auto block min-h-[118svh] max-w-[90vw] 5xl:max-w-[1500px] px-[5px] py-20 md:grid md:grid-cols-[minmax(8rem,0.4fr)_minmax(0,0.8fr)] md:items-start md:gap-[clamp(2rem,6vw,7rem)] md:px-[clamp(1.1rem,4vw,4.5rem)] md:pt-[24vh]"
        aria-labelledby="incubator-title"
        data-incubator-section
      >
        <div>
          <div className="mb-8 font-mono text-[clamp(1.6rem,5vw,5.8rem)] font-extrabold leading-[1.08] md:mb-0">
            <span className="inline box-decoration-clone bg-[#cc3300] px-[0.3em] pb-[0.1em] pt-[0.08em] leading-[1.08] text-[#050505]">
              after eleven:am
            </span>
          </div>
          {/* <div className="max-w-[600px]">
            <p className="mb-0 mt-8 text-[clamp(1rem,1.7vw,1.35rem)] leading-[1.6] text-[rgba(245,241,232,0.78)]">
              A11:am supports young creative talent through concept development,
              portfolio direction, online exhibitions, and public-facing
              releases. The work sits between art, sound, image, and internet
              culture.
            </p>
          </div> */}
        </div>
        <div className="flex flex-col justify-end items-end mt-10 md:mt-0">
          <h2
            id="incubator-title"
            className="m-0 mt-[-20px] w-full text-[clamp(3.25rem,10vw,6.25rem)] font-black leading-[1.08] text-[#f5f1e8] md:text-right md:text-[clamp(4rem,6vw,6.25rem)] md:max-w-[50vw]"
          >
            {[
              "We",
              "create",
              "space",
              "for",
              "emerging",
              "artists",
              "to",
              "shape",
              "their",
              "first",
              "real",
              "signal.",
            ].map((word) => (
              <span
                className="mr-[0.18em] inline-block will-change-[transform,opacity,filter]"
                data-incubator-word
                key={word}
              >
                {word}
              </span>
            ))}
          </h2>
        </div>
      </section>

      <section
        id="talents"
        className="relative mx-auto min-h-[130svh] max-w-[90vw] 5xl:max-w-[1500px] px-[5px] pb-[16vh] pt-[16vh] md:px-[clamp(1.1rem,4vw,4.5rem)]"
        aria-labelledby="talents-title"
      >
        <div className="mb-[clamp(2rem,7vw,6.5rem)] block md:flex md:items-end md:justify-between md:gap-8">
          <p className="mb-[0.8rem] mt-0 font-mono text-[clamp(0.72rem,1.8vw,0.9rem)] font-bold leading-[1.08]">
            <span className="inline box-decoration-clone bg-[#cc3300] px-[0.3em] pb-[0.1em] pt-[0.08em] leading-[1.08] text-[#050505]">
              current orbit
            </span>
          </p>
          <h2
            id="talents-title"
            className="m-0 max-w-[58rem] text-[clamp(2.25rem,5.5vw,7.5rem)] font-black leading-[0.92] text-[#f5f1e8]"
          >
            Talents
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-[clamp(1rem,2vw,1.4rem)] md:grid-cols-2">
          {TALENTS.map((talent) => (
            <article
              className="grid min-h-[26rem] translate-y-[30px] content-between border border-[rgba(245,241,232,0.28)] bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04)),rgba(5,5,5,0.44)] p-4 opacity-30 md:min-h-[clamp(22rem,36vw,34rem)] md:p-[clamp(1.1rem,3vw,2.25rem)] md:[&:nth-child(2)]:mt-[clamp(2.2rem,8vw,8rem)]"
              key={talent.name}
              data-talent-panel
            >
              <span className="font-mono text-[clamp(0.8rem,1vw,0.95rem)] font-extrabold leading-[1.08]">
                <span className="inline box-decoration-clone bg-[#0033cc] px-[0.3em] pb-[0.1em] pt-[0.08em] leading-[1.08] text-[#050505]">
                  {talent.index}
                </span>
              </span>
              <div>
                <h3 className="mb-4 mt-0 text-[clamp(2.3rem,6vw,8rem)] font-[950] leading-[0.84] text-[#f5f1e8] [overflow-wrap:anywhere]">
                  {talent.name}
                </h3>
                <p className="mb-4 mt-0 font-mono text-[0.82rem] font-bold leading-[1.08]">
                  <span className="inline box-decoration-clone bg-[#cc3300] px-[0.3em] pb-[0.1em] pt-[0.08em] leading-[1.08] text-[#050505]">
                    {talent.role}
                  </span>
                </p>
                <p className="m-0 max-w-[31rem] text-[clamp(1rem,1.55vw,1.26rem)] leading-[1.45] text-[rgba(245,241,232,0.78)]">
                  {talent.statement}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="relative mx-auto block min-h-[72svh] max-w-[90vw] 5xl:max-w-[1500px] px-[5px] pb-8 pt-[15vh] md:flex md:items-end md:justify-between md:px-[clamp(1.1rem,4vw,4.5rem)] md:pb-[clamp(2rem,6vw,5rem)] md:pt-0"
        aria-label="Closing statement"
      >
        <p className="m-0 max-w-[58rem] text-[clamp(2.4rem,9vw,9rem)] font-[920] leading-[0.9] text-white/90 mix-blend-difference">
          after 11:am, the sound gets stranger.
        </p>
        <div className="mt-8 flex flex-col items-start gap-[0.85rem] md:mb-[0.6rem] md:mt-0 md:items-end">
          <a
            className="border-b border-current font-mono text-[0.82rem] leading-[1.08]"
            href="mailto:studio@a11am.art"
          >
            <span className="inline box-decoration-clone bg-[#cc3300] px-[0.3em] pb-[0.1em] pt-[0.08em] leading-[1.08] text-[#050505]">
              studio@a11am.art
            </span>
          </a>
          <span className="font-mono text-[0.68rem] font-medium leading-none text-[rgba(245,241,232,0.46)] [&>a]:border-b [&>a]:border-current [&>a]:text-[rgba(245,241,232,0.68)]">
            by{" "}
            <a
              href="https://www.instagram.com/0x49ms/"
              target="_blank"
              rel="noopener noreferrer"
            >
              0x49ms
            </a>
          </span>
        </div>
      </section>
    </main>
  );
}
