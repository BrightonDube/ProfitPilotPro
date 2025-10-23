import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Bolt, ShieldCheck, Cog, ChartBar, Package, TrendingUp, Users, FileText, ShoppingCart, DollarSign, PieChart } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary">BizPilot</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/pricing" className="text-gray-700 hover:text-primary">
                Pricing
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-primary">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary">
                Contact
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Manage Your Business with Confidence
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              All-in-one platform for inventory management, sales tracking, customer relationships, 
              and financial reporting. Built for modern businesses.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/auth/signup">
                <Button size="lg" className="px-8">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="px-8">
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Business
            </h2>
            <p className="text-lg text-gray-600">
              Powerful features designed to streamline your operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="font-semibold text-lg mb-2">Inventory Management</h3>
              <p className="text-gray-600">Track stock levels, set alerts, and manage suppliers efficiently</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-semibold text-lg mb-2">Sales & Orders</h3>
              <p className="text-gray-600">Process orders, track payments, and manage your sales pipeline</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="font-semibold text-lg mb-2">Customer Management</h3>
              <p className="text-gray-600">Build lasting relationships with comprehensive CRM tools</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-semibold text-lg mb-2">Financial Reports</h3>
              <p className="text-gray-600">Get insights with real-time reports and analytics</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of businesses already using BizPilot
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="px-8">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Business
            </h2>
            <p className="text-lg text-gray-600">
              Powerful features designed to streamline your operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Inventory Management</h3>
              <p className="text-gray-600">Track stock levels, set alerts, and manage suppliers efficiently</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Sales & Orders</h3>
              <p className="text-gray-600">Process orders, track payments, and manage your sales pipeline</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Customer Management</h3>
              <p className="text-gray-600">Build lasting relationships with comprehensive CRM tools</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <PieChart className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Financial Reports</h3>
              <p className="text-gray-600">Get insights with real-time reports and analytics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose BizPilot?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Bolt className="h-6 w-6 text-primary mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Lightning Fast</h3>
                    <p className="text-gray-600">Built with modern technology for optimal performance</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ShieldCheck className="h-6 w-6 text-primary mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Secure & Reliable</h3>
                    <p className="text-gray-600">Enterprise-grade security with 99.9% uptime</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Cog className="h-6 w-6 text-primary mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Easy Integration</h3>
                    <p className="text-gray-600">Connect with your existing tools seamlessly</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ChartBar className="h-6 w-6 text-primary mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Scalable Solution</h3>
                    <p className="text-gray-600">Grows with your business from startup to enterprise</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-xl p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Start Your Free Trial</h3>
                <p className="text-gray-600 mb-6">No credit card required. 14-day free trial.</p>
                <Link href="/auth/signup">
                  <Button className="w-full" size="lg">
                    Get Started Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">BizPilot</h4>
              <p className="text-gray-400">
                Your complete business management solution.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Product</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/integrations" className="hover:text-white">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Company</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Support</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/status" className="hover:text-white">Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BizPilot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}