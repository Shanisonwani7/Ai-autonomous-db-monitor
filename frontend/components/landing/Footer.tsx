"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Database,
  Mail,
  GraduationCap,
} from "lucide-react";

import {
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";

const QUICK_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Technology", href: "#technology" },
  { label: "FAQ", href: "#faq" },
];

const TECHNOLOGY_LINKS = [
  { label: "Next.js", href: "#technology" },
  { label: "PostgreSQL", href: "#technology" },
  { label: "Prisma", href: "#technology" },
  { label: "Python AI", href: "#technology" },
];

const RESOURCE_LINKS = [
  { label: "Documentation", href: "#" },
  { label: "API Reference", href: "#" },
  { label: "Changelog", href: "#" },
  { label: "Support", href: "#" },
];

const SOCIAL_LINKS = [
  {
    icon: FaGithub,
    label: "GitHub",
    href: "https://github.com",
  },
  {
    icon: FaLinkedin,
    label: "LinkedIn",
    href: "https://linkedin.com",
  },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-200">{title}</h3>

      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-sm text-slate-500 transition-colors duration-200 hover:text-white"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#020617] py-16">
      {/* Background Glow */}
      <div
        aria-hidden
        className="absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3B82F6]/10 blur-[140px]"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] shadow-lg shadow-blue-500/25">
                <Database className="h-5 w-5 text-white" />
              </div>

              <h2 className="text-lg font-bold text-white">
                <span className="text-[#3B82F6]">AI</span> DB Monitor
              </h2>
            </div>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              AI DB Monitor is an{" "}
              <span className="font-medium text-slate-300">
                AI-Powered Autonomous Database Monitoring Platform
              </span>{" "}
              designed to monitor, analyze, predict, and optimize PostgreSQL
              databases using Artificial Intelligence.
            </p>

            <div className="mt-6 space-y-3">
              <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
                >
                <FaGithub className="h-4 w-4" />
                 GitHub Repository
              </a>

              <Link
                href="mailto:contact@aidbmonitor.com"
                className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
              >
                <Mail className="h-4 w-4" />
                contact@aidbmonitor.com
              </Link>
            </div>

            <div className="mt-6 flex gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:border-[#3B82F6]/40 hover:text-[#60A5FA]"
                >
                 <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Quick Links" links={QUICK_LINKS} />

          <FooterColumn title="Technology" links={TECHNOLOGY_LINKS} />

          <FooterColumn title="Resources" links={RESOURCE_LINKS} />
        </div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-lg sm:flex-row"
        >
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <GraduationCap className="h-4 w-4 text-[#3B82F6]" />
            Built as a Final Year Project
          </div>

          <p className="text-center text-xs text-slate-500">
            © {new Date().getFullYear()} AI DB Monitor. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}