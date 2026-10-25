import Link from 'next/link';

export default function ContactPage() {
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
          Waypoint 1.8 km
        </span>
        <h1 className="text-4xl font-serif font-bold text-[#3a2014] mb-4">
          Campfire & Contact
        </h1>
        <p className="text-[#634b3c] leading-relaxed mb-6">
          Pull up a log by the fire. Whether you have a project idea, feedback, or just
          want to say hello, feel free to drop a message.
        </p>
      </div>
    </main>
  );
}
