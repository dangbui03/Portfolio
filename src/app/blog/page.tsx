import Link from 'next/link';

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#fdfbf7] text-[#3a2014] px-6 py-16 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-mono uppercase tracking-wider text-[#8c6748] hover:text-[#3a2014] mb-8 transition-colors"
        >
          ← Return to Crossroads
        </Link>
        <span className="text-xs font-mono tracking-widest text-[#d97706] uppercase block mb-2">
          Waypoint 0.6 km
        </span>
        <h1 className="text-4xl font-serif font-bold text-[#3a2014] mb-4">
          Field Notes & Essays
        </h1>
        <p className="text-[#634b3c] leading-relaxed mb-6">
          Writings on web architecture, interactive 3D rendering, creative engineering,
          and thoughts gathered along the path.
        </p>
      </div>
    </main>
  );
}
