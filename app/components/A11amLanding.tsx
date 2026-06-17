"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

const TALENTS = [
  {
    name: "NaSofia",
    role: "Visual poet / image director",
    img: "/img/na-s.jpg",
    statement:
      "Builds fragile, high-contrast worlds where beauty feels half remembered and half intercepted.",
    index: "01",
  },
  {
    name: "Toanlelet",
    role: "Motion artist / spatial storyteller",
    img: "/img/toanlelet.jpg",
    statement:
      "Turns rhythm, glitches, and negative space into frames that keep moving after the cut.",
    index: "02",
  },
];

export default function A11amLanding() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);
  const flashRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(".gsap-reveal", { autoAlpha: 0, y: 38 });
      gsap.to(".gsap-reveal", {
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
          ".hero-mark",
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
          ".canvas-shell",
          {
            filter: "contrast(1.9) invert(0.08) saturate(2) brightness(1.12)",
            ease: "none",
          },
          0.18,
        )
        .to(
          ".talent-panel",
          {
            yPercent: -8,
            ease: "none",
            stagger: 0.08,
          },
          0.45,
        );

      ScrollTrigger.batch(".talent-panel", {
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
            glitchUv.x += blockShift * (0.018 + uFlash * 0.075);
            glitchUv.x += sin(uv.y * 38.0 + uTime * 1.0) * (0.004 + uFlash * 0.016);
            glitchUv.y += vWave * 0.08;

            float fragments = 0.0;
            fragments += shard(glitchUv, vec2(-0.58, 0.42), -0.5, vec2(0.42, 0.118), uTime * 0.42);
            // fragments += shard(glitchUv, vec2(0.38, 0.26), 0.18, vec2(0.56, 0.014), -uTime * 0.36);
            // fragments += shard(glitchUv, vec2(-0.08, -0.08), -0.12, vec2(0.72, 0.012), uTime * 0.28);
            // fragments += shard(glitchUv, vec2(0.72, -0.5), 0.46, vec2(0.34, 0.016), -uTime * 0.5);
            // fragments += shard(glitchUv, vec2(-0.48, -0.72), 0.08, vec2(0.5, 0.01), uTime * 0.32);

            float hairline = smoothstep(0.965, 1.0, noise(glitchUv * vec2(42.0, 8.0) + uTime * 0.7));
            hairline *= smoothstep(0.06, 0.0, abs(sin(glitchUv.y * 34.0 + uTime)));
            float bands = 0.0;
            bands += glitchBand(glitchUv, 0.58 + sin(uTime * 0.1) * 0.08, 0.055, uTime * 0.9);
            bands += glitchBand(glitchUv, -0.18 + cos(uTime * 0.2) * 0.1, 0.04, -uTime * 0.75);
            bands += glitchBand(glitchUv, -0.68, 0.03, uTime * 0.3);
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
    scene.add(ringGroup);

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
  }, []);

  return (
    <main ref={rootRef} className="a11am-page">
      <div ref={canvasHostRef} className="canvas-shell" aria-hidden="true" />
      <div className="flash-layer" aria-hidden="true" />

      <nav className="site-nav" aria-label="Primary">
        <a href="#top" className="nav-logo">
          A11:am
        </a>
        <div className="nav-links">
          <a href="#incubator">incubator</a>
          <a href="#talents">talents</a>
        </div>
      </nav>

      <section id="top" className="hero-section" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow gsap-reveal">after 11 am / talent incubator</p>
          <h1 id="hero-title" className="hero-mark gsap-reveal">
            A11:am
          </h1>
          <p className="hero-text gsap-reveal">
            A post-noon art talent incubator for image-makers, performers, and
            motion authors shaping intimate worlds with sharp contrast.
          </p>
        </div>
        <div className="hero-meta gsap-reveal" aria-label="Studio notes">
          <span>art direction</span>
          <span>moving image</span>
          <span>talent systems</span>
        </div>
      </section>

      <section
        id="incubator"
        className="manifesto-section"
        aria-labelledby="incubator-title"
      >
        <div className="section-index">after eleven:am</div>
        <div className="manifesto-copy">
          <p className="eyebrow">incubation language</p>
          <h2 id="incubator-title">
            We keep the room unstable enough for new signatures to surface.
          </h2>
          <p>
            a11am develops young art talent through image research, live briefs,
            portfolio direction, motion experiments, and public-facing releases.
            The work sits between gallery instinct, internet velocity, and
            cinematic pressure.
          </p>
        </div>
      </section>

      <section
        id="talents"
        className="talents-section"
        aria-labelledby="talents-title"
      >
        <div className="talents-heading">
          <p className="eyebrow">current orbit</p>
          <h2 id="talents-title">Talents</h2>
        </div>
        <div className="talent-grid">
          {TALENTS.map((talent) => (
            <article className="talent-panel" key={talent.name}>
              <span className="talent-index">{talent.index}</span>
              <div>
                <h3>{talent.name}</h3>
                <p className="talent-role">{talent.role}</p>
                <p className="talent-statement">{talent.statement}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="closing-section" aria-label="Closing statement">
        <p className="">after 11:am, the sound gets stranger.</p>
        <a href="mailto:studio@a11am.art">studio@a11am.art</a>
      </section>
    </main>
  );
}
