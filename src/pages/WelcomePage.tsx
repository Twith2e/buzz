import { Link } from "react-router-dom";


const WelcomePage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <header className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <img
            src="/tapo-text-image.png"
            alt="Tapo"
            className="h-8 w-auto select-none"
          />
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="/onboarding" className="text-sm hover:text-indigo-600">
            Features
          </a>
          <a href="/pricing" className="text-sm hover:text-indigo-600">
            Pricing
          </a>
          <a href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Sign in
          </a>
        </nav>
      </header>
      <section className="px-6 py-10 md:py-16 max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Connect with ease—message or call in one place.
          </h1>
          <p className="mt-4 text-base md:text-lg text-gray-600">
            Tapo helps you start conversations, stay in touch, and collaborate faster.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              aria-label="Get started with Tapo"
            >
              <img src="/tapo-call-image.png" alt="" className="h-5 w-5" />
              Get started
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-5">
            <div className="flex items-center gap-2 text-gray-600">
              <img src="/messagIcon.png" alt="Messages icon" className="h-6 w-6" />
              <span>Smart messaging</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <img src="/callIcon.png" alt="Calls icon" className="h-6 w-6" />
              <span>HD calls</span>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-[4/3] rounded-xl bg-white shadow-lg border border-gray-200 flex items-center justify-center overflow-hidden">
            <img
              src="/tapo-call-image.png"
              alt="Preview of Tapo call experience"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-4 -left-4 hidden md:block">
            <img
              src="/tapo-text-image.png"
              alt="Preview of Tapo chat experience"
              className="h-24 w-auto drop-shadow"
            />
          </div>
        </div>
      </section>
      <section className="px-6 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <img src="/messagIcon.png" alt="Chat feature" className="h-10 w-10" />
              <h3 className="font-semibold text-lg">Chat, organized</h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Keep conversations on track with threads, mentions, and clean design.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <img src="/tapo-call-image.png" alt="Call feature" className="h-10 w-10 rounded" />
              <h3 className="font-semibold text-lg">Calls that feel close</h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              High-definition audio and video for teams, friends, and families.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <img src="/tapo-text-image.png" alt="Privacy feature" className="h-10 w-10 rounded" />
              <h3 className="font-semibold text-lg">Privacy by default</h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Thoughtful controls so you decide who sees what and when.
            </p>
          </div>
        </div>
      </section>
      <footer className="px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Tapo. All rights reserved.
          </p>
          <a
            href="/login"
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Already have an account? Sign in
          </a>
        </div>
      </footer>
    </main>
  );
};

export default WelcomePage;
