import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, CreditCard, BarChart4 } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold flex items-center text-green-600">
              <img src="/logo.png" alt="Logo" className="h-9 w-10 rounded-full" />
              Parta Pay
            </h2>
          </div>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/signin')}>Sign in</Button>
            <Button onClick={() => navigate('/register')}>Get Started</Button>
          </nav>
        </div>
      </header>
      {/* Hero Section */}
      <section className="flex items-center h-[100vh] justify-center text-center px-4 py-12 md:py-24 lg:py-32">
        <div className="space-y-6 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
            Split Expenses, <span className="text-primary">Simplify Life</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl">
            The easiest way to share expenses with friends and family. Track balances, settle debts, and manage group finances with ease.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/register')} className="gap-2">
              Create Account
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/signin')}>
              Sign In
            </Button>
          </div>
        </div>
      </section>
      {/* Features */}
      <section className="bg-muted/50 flex items-center h-[100vh] justify-center px-4 py-12 md:py-24 lg:py-32">
        <div className="max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {[
            {
              Icon: CreditCard,
              title: 'Track Expenses',
              desc: 'Easily log and categorize all your expenses in one place. Know exactly where your money goes.',
            },
            {
              Icon: Users,
              title: 'Split Bills',
              desc: 'Split bills evenly or with custom amounts. Perfect for roommates, trips, and group activities.',
            },
            {
              Icon: BarChart4,
              title: 'Insights',
              desc: 'Get visual reports and analytics on your spending habits and group expenses.',
            },
          ].map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="bg-card p-6 rounded-lg shadow-sm border border-border text-center"
            >
              <div className="p-2 bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-4">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{title}</h3>
              <p className="text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* CTA */}
      <section className="flex items-center justify-center h-[100vh] px-4 py-12 md:py-24 lg:py-32 text-center">
        <div className="space-y-6 max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tighter">
            Ready to simplify your group finances?
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl">
            Join thousands of users who manage their shared expenses with ParataPay.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/register')}>
              Get Started for Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/signin')}>
              Sign In to Your Account
            </Button>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="border-t border-border py-6 px-4 lg:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold flex items-center text-green-600">
              <img src="/logo.png" alt="Logo" className="h-9 w-10 rounded-full" />
              Parta Pay
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ParataPay. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
