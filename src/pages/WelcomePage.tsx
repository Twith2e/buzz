import { Link } from "react-router-dom";
import {
  Lock,
  MessageSquare,
  Phone,
  Globe,
  Users,
  Smile,
  Zap,
} from "lucide-react";

const WelcomePage = () => {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Buzz Logo" className="w-10 h-10" />
            <span className="text-2xl font-bold tracking-tight text-primary">
              Buzz
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a
              href="#features"
              className="hover:text-primary transition-colors"
            >
              Features
            </a>
            <a href="#privacy" className="hover:text-primary transition-colors">
              Privacy
            </a>
            <a
              href="#download"
              className="hover:text-primary transition-colors"
            >
              Download
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              to="/signup"
              className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-sm"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-48 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-24 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Connect privately. <br />
              <span className="text-primary">Anywhere. Anytime.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
              Buzz makes it easy and fun to stay close to your favorite people.
              Send texts, voice notes, and make crystal-clear calls—all secured
              with end-to-end encryption.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="inline-flex justify-center items-center px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25"
              >
                Start Buzzing
              </Link>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground/80 pt-4">
              <Lock size={16} />
              <span>Your privacy is our priority</span>
            </div>
          </div>

          <div className="relative group animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            {/* Abstract Background Blotches */}
            <div className="absolute -inset-1 bg-linear-to-tr from-brandSky to-brandBlue rounded-[2.5rem] blur opacity-30 group-hover:opacity-40 transition duration-1000"></div>

            <div className="relative">
              <img
                src="/buzz_hero_mockup.png"
                alt="Buzz App Interface"
                className="w-full h-auto rounded-4xl shadow-2xl border border-border/50 bg-background -rotate-2 hover:rotate-0 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlight 1: Messaging */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="aspect-square rounded-3xl bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/10 flex items-center justify-center p-12">
              <MessageSquare className="w-48 h-48 text-primary opacity-80" />
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Message privately
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Simple, reliable messaging. Send messages to your friends and
              family for free. Buzz uses your phone's Internet connection so you
              can avoid SMS fees.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                Text & Voice Messages
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                Photo & Video Sharing
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                Document Sharing
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Feature Highlight 2: Groups */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Keep in touch with your groups
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Keep in touch with the groups of people that matter the most, like
              your family or coworkers. Compare notes, share photos, and stay
              organized.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              Create a group <Zap size={16} />
            </Link>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-3xl bg-linear-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/10 flex items-center justify-center p-12">
              <Users className="w-48 h-48 text-green-600 dark:text-green-500 opacity-80" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlight 3: Calls */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="aspect-square rounded-3xl bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/10 flex items-center justify-center p-12">
              <Phone className="w-48 h-48 text-purple-600 dark:text-purple-500 opacity-80" />
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Speak freely
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              With voice calls, you can talk to your friends and family for
              free, even if they're in another country. And with free video
              calls, you can have face-to-face conversations.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Highlight 4: Expression */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Say what you feel
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Express yourself with built-in stickers, emojis, and GIFs.
              Sometimes, words just aren't enough.
            </p>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-3xl bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/10 flex items-center justify-center p-12">
              <Smile className="w-48 h-48 text-orange-500 opacity-80" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Buzz" className="w-8 h-8" />
                <span className="text-xl font-bold text-primary">Buzz</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Simple. Secure. Reliable messaging.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary">
                    Messaging
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Voice & Video Calls
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Group Chats
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Brand Center
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Help</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Safety
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Buzz Inc.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-foreground">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground">
                Terms
              </a>
              <div className="flex items-center gap-2 hover:text-foreground cursor-pointer">
                <Globe size={14} />
                <span>English</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default WelcomePage;
