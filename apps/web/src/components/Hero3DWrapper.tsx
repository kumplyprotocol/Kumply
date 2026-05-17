"use client";

import dynamic from 'next/dynamic';

const Hero3D = dynamic(() => import('./Hero3D'), { 
  ssr: false,
  loading: () => <div style={{ height: '550px', width: '100%' }}></div>
});

export default function Hero3DWrapper() {
  return <Hero3D />;
}
