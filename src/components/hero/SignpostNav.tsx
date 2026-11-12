'use client';

import dynamic from 'next/dynamic';
import type { Signpost3DProps } from '@/components/3D/Signpost3D';

const Signpost3D = dynamic(
  () => import('@/components/3D/Signpost3D'),
  {
    ssr: false,
    loading: () => (
      <div
        className="grid h-full w-full place-items-center bg-[#f4ecdc] font-serif text-sm text-[#4a3023]"
      >
        Preparing the crossroads signpost...
      </div>
    ),
  },
);

export default function SignpostNav(props: Signpost3DProps) {
  return <Signpost3D {...props} />;
}
