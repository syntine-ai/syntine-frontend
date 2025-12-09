import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Zap,
  Phone,
  BarChart3,
  Bot,
  ArrowRight,
  CheckCircle,
  Shield,
  Users,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Agents",
    description: "Deploy intelligent voice agents that handle complex conversations naturally.",
  },
  {
    icon: Phone,
    title: "Smart Campaigns",
    description: "Launch automated calling campaigns with real-time sentiment analysis.",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Track every interaction with comprehensive dashboards and insights.",
  },
  {
    icon: Users,
    title: "Contact Management",
    description: "Organize and segment your contacts for targeted outreach.",
  },
];

const stats = [
  { value: "10M+", label: "Calls Processed" },
  { value: "99.9%", label: "Uptime" },
  { value: "500+", label: "Organizations" },
  { value: "4.9★", label: "Customer Rating" },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-sidebar text-sidebar-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-sidebar/80 backdrop-blur-xl border-b border-sidebar-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Syntine</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-sidebar-foreground hover:bg-sidebar-accent">
                Sign In
              </Button>
            </Link>
            <Link to="/login">
              <Button className="bg-primary hover:bg-primary/90">
                Get Started
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              AI-First Voice Automation Platform
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            <span className="gradient-text">Intelligent Voice</span>
            <br />
            <span className="text-sidebar-foreground">for Modern Teams</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-sidebar-muted max-w-2xl mx-auto mb-10"
          >
            Syntine empowers organizations to deploy AI voice agents that engage customers, 
            analyze sentiment in real-time, and deliver actionable insights at scale.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/login">
              <Button size="lg" className="bg-primary hover:bg-primary/90 h-12 px-8 text-base">
                Start Free Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent">
              Watch Demo
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 border-y border-sidebar-border bg-sidebar-accent/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-primary mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-sidebar-muted">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to scale voice operations
            </h2>
            <p className="text-lg text-sidebar-muted max-w-2xl mx-auto">
              From intelligent agents to deep analytics, Syntine provides a complete
              platform for modern voice automation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-sidebar-accent/50 to-transparent border border-sidebar-border hover:border-primary/30 transition-colors"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-sidebar-muted">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 p-12 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_50%)]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to transform your voice operations?
              </h2>
              <p className="text-lg text-sidebar-muted mb-8 max-w-xl mx-auto">
                Join hundreds of organizations using Syntine to automate customer
                engagement and drive results.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/login">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 h-12 px-8">
                    Start Free Trial
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-sm text-sidebar-muted">
                  <CheckCircle className="h-4 w-4 text-success" />
                  No credit card required
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-sidebar-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">Syntine</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-sidebar-muted">
              <Link to="#" className="hover:text-sidebar-foreground transition-colors">
                Privacy
              </Link>
              <Link to="#" className="hover:text-sidebar-foreground transition-colors">
                Terms
              </Link>
              <Link to="#" className="hover:text-sidebar-foreground transition-colors">
                Contact
              </Link>
              <Link
                to="/admin/login"
                className="flex items-center gap-1.5 hover:text-sidebar-foreground transition-colors"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Link>
            </div>
            <p className="text-sm text-sidebar-muted">
              © 2024 Syntine. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
