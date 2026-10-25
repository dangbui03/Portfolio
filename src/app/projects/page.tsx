import Link from 'next/link';

export default function ProjectsPage() {
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
          Waypoint 1.2 km
        </span>
        <h1 className="text-4xl font-serif font-bold text-[#3a2014] mb-4">
          Selected Works & Tools
        </h1>
        <p className="text-[#634b3c] leading-relaxed mb-6">
          A showcase of interactive web applications, graphics experiments, and open-source
          creations.
        </p>
      </div>
    </main>
  );
}
