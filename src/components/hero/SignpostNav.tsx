
'use client';

import dynamic from 'next/dynamic';

const Signpost3D = dynamic(
  () => import('@/components/3D/Signpost3D'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: 600,
          background: '#f4ecdc',
          display: 'grid',
          placeItems: 'center',
          color: '#4a3023',
        }}
      >
        Preparing the signpost...
      </div>
    ),
  },
);

export default function SignpostNav() {
  return <Signpost3D />;
}
