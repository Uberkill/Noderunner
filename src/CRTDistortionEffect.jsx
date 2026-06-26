import { Effect } from 'postprocessing';
import { wrapEffect } from '@react-three/postprocessing';
import { Uniform } from 'three';

// 1. The GLSL Fragment Shader
// This calculates the distance from the center of the screen
// and pinches/stretches the UV coordinates to create a convex curve.
const fragmentShader = `
  uniform float distortion;

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Shift UVs so 0.0 is the exact center of the screen
    vec2 cc = uv - 0.5;
    
    // Calculate the distance from center (radius squared)
    float dist = dot(cc, cc);
    
    // Push the pixels outward based on their distance from center
    vec2 distortedUV = uv + cc * (dist * distortion);
    
    // If the curve pushes pixels completely off-screen, render black (the edge of the monitor)
    if (distortedUV.x < 0.0 || distortedUV.x > 1.0 || distortedUV.y < 0.0 || distortedUV.y > 1.0) {
      outputColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
      // Sample the original scene with our new curved coordinates
      outputColor = texture2D(inputBuffer, distortedUV);
    }
  }
`;

// 2. The Effect Class
class CRTDistortionImpl extends Effect {
  constructor({ distortion = 0.2 } = {}) {
    super('CRTDistortion', fragmentShader, {
      uniforms: new Map([
        ['distortion', new Uniform(distortion)]
      ]),
    });
  }
}

// 3. Wrap it so React Three Fiber can use it as a component
export const CRTDistortion = wrapEffect(CRTDistortionImpl);
