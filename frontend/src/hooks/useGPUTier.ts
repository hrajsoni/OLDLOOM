'use client';

import { useState, useEffect } from 'react';

interface GPUTier {
  tier: 0 | 1 | 2 | 3;
  isMobile: boolean;
  isLowEnd: boolean;
}

export function useGPUTier(): GPUTier {
  const [gpuTier, setGpuTier] = useState<GPUTier>({
    tier: 2,
    isMobile: false,
    isLowEnd: false,
  });

  useEffect(() => {
    const detect = async () => {
      // Check if mobile
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i.test(
        navigator.userAgent
      );

      // Try WebGL renderer string for GPU detection
      let tier: 0 | 1 | 2 | 3 = 2;

      try {
        const canvas = document.createElement('canvas');
        const gl =
          canvas.getContext('webgl') ||
          canvas.getContext('experimental-webgl');

        if (!gl) {
          // No WebGL support
          tier = 0;
        } else {
          const webgl = gl as WebGLRenderingContext;
          const ext = webgl.getExtension('WEBGL_debug_renderer_info');
          if (ext) {
            const renderer = webgl
              .getParameter(ext.UNMASKED_RENDERER_WEBGL)
              .toLowerCase();

            // Tier 0 — No 3D capable
            if (renderer.includes('swiftshader') || renderer.includes('llvmpipe')) {
              tier = 0;
            }
            // Tier 1 — Integrated / low-end
            else if (
              renderer.includes('intel') ||
              renderer.includes('mali-4') ||
              renderer.includes('mali-t') ||
              renderer.includes('adreno 3') ||
              renderer.includes('adreno 4')
            ) {
              tier = 1;
            }
            // Tier 3 — High-end dedicated
            else if (
              renderer.includes('rtx') ||
              renderer.includes('gtx 1080') ||
              renderer.includes('gtx 1070') ||
              renderer.includes('rx 6') ||
              renderer.includes('rx 7') ||
              renderer.includes('apple m')
            ) {
              tier = 3;
            }
            // Tier 2 — Mid-range (default)
            else {
              tier = 2;
            }
          }
        }
      } catch {
        tier = 1;
      }

      // Downgrade one tier on mobile
      if (isMobile && tier > 0) {
        tier = Math.max(0, tier - 1) as 0 | 1 | 2 | 3;
      }

      setGpuTier({
        tier,
        isMobile,
        isLowEnd: tier < 2,
      });
    };

    detect();
  }, []);

  return gpuTier;
}
