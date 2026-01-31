import Link from "next/link";
import { Mail, Twitter, Linkedin, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Methodology", href: "#methodology" },
    { label: "Integrations", href: "/integrations" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  resources: [
    { label: "Documentation", href: "/docs" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Ethics Guidelines", href: "/ethics" },
    { label: "API Reference", href: "/api" },
  ],
};

export function Footer() {
  return (
    <footer className="py-16 bg-[#1A1A2E]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#7C3AED]" />
              <span className="text-base font-semibold text-white">
                Arquetype
              </span>
            </div>
            <p className="text-sm text-white/50 mb-6 max-w-xs">
              Synthetic survey respondents powered by AI. Get market research insights in minutes, not weeks.
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <p className="text-sm font-medium text-white/70 mb-2">
                Get research insights weekly
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]"
                />
                <Button variant="gradient" size="sm">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-white/50">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-[#7C3AED] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-white/50">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-[#7C3AED] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-white/50">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-[#7C3AED] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Arquetype. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-white/40">
            <Link href="/privacy" className="hover:text-[#7C3AED] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#7C3AED] transition-colors">
              Terms
            </Link>
            <Link href="/security" className="hover:text-[#7C3AED] transition-colors">
              Security
            </Link>
          </div>
          <div className="flex gap-4">
            <Link
              href="https://twitter.com/arquetype"
              className="text-white/40 hover:text-[#7C3AED] transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </Link>
            <Link
              href="https://linkedin.com/company/arquetype"
              className="text-white/40 hover:text-[#7C3AED] transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </Link>
            <Link
              href="https://github.com/arquetype"
              className="text-white/40 hover:text-[#7C3AED] transition-colors"
            >
              <Github className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
