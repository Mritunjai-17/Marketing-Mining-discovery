/**
 * GLSL for the hero globe.
 *
 * Two materials:
 *  - earth      : lit sphere with a soft day/night terminator, ocean-only specular,
 *                 cheap coastal relief derived from the mask gradient, sparse city
 *                 lights on the night side, and a sunset band at the terminator.
 *  - atmosphere : slightly larger shell producing the limb haze. It uses normal
 *                 blending rather than additive, because the hero sits on a white
 *                 card where additive light would be invisible.
 */

export const earthVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalWorld;
  varying vec3 vTangentWorld;
  varying vec3 vBitangentWorld;
  varying float vLatitudeCos;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;

    // Build the tangent frame here: modelMatrix is only available to the vertex
    // stage, and the transform is linear, so perturbing the interpolated world-space
    // frame in the fragment shader gives the same result as perturbing in object space.
    vec3 n = normalize(normal);
    vec3 t = normalize(cross(vec3(0.0, 1.0, 0.0), n) + vec3(1e-5, 0.0, 0.0)); // east
    vec3 b = cross(n, t);                                                     // north

    mat3 model = mat3(modelMatrix);
    vNormalWorld = normalize(model * n);
    vTangentWorld = normalize(model * t);
    vBitangentWorld = normalize(model * b);

    // Meridians converge toward the poles, so a fixed step in u spans less surface
    // there. Clamped so high latitudes do not turn the relief into noise.
    vLatitudeCos = max(sqrt(max(1.0 - n.y * n.y, 0.0)), 0.25);

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const earthFragmentShader = /* glsl */ `
  uniform sampler2D uDayMap;
  uniform sampler2D uMaskMap;
  uniform vec2 uMaskTexel;
  uniform vec3 uSunDirection;
  uniform vec3 uHazeColor;
  uniform vec3 uCityLightColor;
  uniform float uAmbient;
  uniform float uSunIntensity;
  uniform float uReliefStrength;
  uniform float uCityLightStrength;
  uniform float uHazeStrength;

  varying vec2 vUv;
  varying vec3 vNormalWorld;
  varying vec3 vTangentWorld;
  varying vec3 vBitangentWorld;
  varying float vLatitudeCos;
  varying vec3 vWorldPosition;

  void main() {
    // --- Coastal / terrain relief -------------------------------------------------
    // Sample the mask around the fragment and rebuild a tangent-space gradient.
    // Tangent runs east, bitangent runs north, matching the equirectangular layout.
    float hL = texture2D(uMaskMap, vUv - vec2(uMaskTexel.x, 0.0)).r;
    float hR = texture2D(uMaskMap, vUv + vec2(uMaskTexel.x, 0.0)).r;
    float hD = texture2D(uMaskMap, vUv - vec2(0.0, uMaskTexel.y)).r;
    float hU = texture2D(uMaskMap, vUv + vec2(0.0, uMaskTexel.y)).r;

    vec3 N = normalize(
      normalize(vNormalWorld)
      - (
          ((hR - hL) / vLatitudeCos) * normalize(vTangentWorld)
          + (hU - hD) * normalize(vBitangentWorld)
        ) * uReliefStrength
    );

    vec3 V = normalize(cameraPosition - vWorldPosition);
    vec3 L = normalize(uSunDirection);

    float mask = texture2D(uMaskMap, vUv).r;
    float land = smoothstep(0.04, 0.14, mask);

    // --- Day / night --------------------------------------------------------------
    float ndl = dot(N, L);
    float daylight = smoothstep(-0.18, 0.52, ndl);

    vec3 albedo = texture2D(uDayMap, vUv).rgb;

    vec3 dayColor = albedo * (uAmbient + uSunIntensity * daylight);
    vec3 nightColor = albedo * 0.055 + vec3(0.006, 0.011, 0.022);
    vec3 color = mix(nightColor, dayColor, daylight);

    // --- Ocean specular -----------------------------------------------------------
    // Broad and dim on purpose: on a planet-scale sphere a tight, bright lobe reads as
    // a smudge on the water rather than as sunlight, especially at small viewport sizes.
    vec3 halfway = normalize(L + V);
    float specular = pow(max(dot(N, halfway), 0.0), 120.0) * (1.0 - land) * daylight;
    color += vec3(0.46, 0.58, 0.72) * specular * 0.22;

    // --- Sunset band at the terminator --------------------------------------------
    float band = daylight * (1.0 - daylight);
    color += vec3(0.42, 0.21, 0.07) * band * 0.26;

    // --- Night-side city lights ---------------------------------------------------
    float cities = smoothstep(0.82, 0.97, mask) * land;
    color += uCityLightColor * cities * (1.0 - daylight) * uCityLightStrength;

    // --- Limb haze on the sphere itself -------------------------------------------
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.8);
    color += uHazeColor * fresnel * (0.22 + 0.78 * daylight) * uHazeStrength;

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const atmosphereVertexShader = /* glsl */ `
  varying vec3 vNormalWorld;
  varying vec3 vWorldPosition;

  void main() {
    vNormalWorld = normalize(mat3(modelMatrix) * normal);

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const atmosphereFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uSunDirection;
  uniform float uStrength;
  /** dot(N, V) at which a view ray grazes the earth surface: sqrt(1 - (1/shellRadius)^2). */
  uniform float uLimb;
  uniform float uInnerFalloff;

  varying vec3 vNormalWorld;
  varying vec3 vWorldPosition;

  void main() {
    vec3 N = normalize(vNormalWorld);
    vec3 V = normalize(cameraPosition - vWorldPosition);

    // Front faces with depth testing off. The profile has to fall back to zero at the
    // shell silhouette (d = 0) or the halo terminates in a hard ring; it peaks around
    // the limb of the earth beneath and decays toward the centre of the disc.
    float d = max(dot(N, V), 0.0);
    float outward = smoothstep(0.0, 1.0, d / uLimb);
    float inward = exp(-max(d - uLimb, 0.0) * uInnerFalloff);
    float lit = smoothstep(-0.45, 0.55, dot(N, normalize(uSunDirection)));

    float alpha = outward * inward * (0.18 + 0.82 * lit) * uStrength;

    gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 1.0));
  }
`;
