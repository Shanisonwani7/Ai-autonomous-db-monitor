"use client";

import { motion } from "framer-motion";
import {
  Layers,
  Atom,
  FileCode2,
  Server,
  Route,
  Database,
  Boxes,
  Brain,
  Palette,
  Cloud,
  Container,
  GitBranch,
  TerminalSquare,
  Cpu,
  Workflow as WorkflowIcon,
} from "lucide-react";

interface Tech {
  icon: typeof Layers;
  name: string;
  description: string;
}

interface Category {
  name: string;
  accent: string;
  items: Tech[];
}

const CATEGORIES: Category[] = [
  {
    name: "Frontend",
    accent: "#3B82F6",
    items: [
      { icon: Layers, name: "Next.js", description: "React framework with App Router" },
      { icon: Atom, name: "React", description: "Component-driven UI library" },
      { icon: FileCode2, name: "TypeScript", description: "Static typing across the app" },
      { icon: Palette, name: "Tailwind CSS", description: "Utility-first styling system" },
    ],
  },
  {
    name: "Backend",
    accent: "#8B5CF6",
    items: [
      { icon: Server, name: "Node.js", description: "JavaScript runtime environment" },
      { icon: Route, name: "Express", description: "REST API and routing layer" },
    ],
  },
  {
    name: "Database",
    accent: "#22C55E",
    items: [
      { icon: Database, name: "PostgreSQL", description: "Primary relational database" },
      { icon: Boxes, name: "Prisma", description: "Type-safe database ORM" },
    ],
  },
  {
    name: "AI / ML",
    accent: "#F59E0B",
    items: [
      { icon: Brain, name: "Python AI", description: "Prediction and analysis models" },
      { icon: Cpu, name: "ML Pipeline", description: "Anomaly and trend detection" },
    ],
  },
  {
    name: "Cloud",
    accent: "#EF4444",
    items: [
      { icon: Cloud, name: "Cloud Hosting", description: "Scalable deployment infrastructure" },
      { icon: Container, name: "Containers", description: "Isolated, portable environments" },
    ],
  },
  {
    name: "Dev Tools",
    accent: "#60A5FA",
    items: [
      { icon: GitBranch, name: "Git", description: "Version control and collaboration" },
      { icon: TerminalSquare, name: "CLI Tooling", description: "Local development workflow" },
      { icon: WorkflowIcon, name: "CI Pipelines", description: "Automated build and checks" },
    ],
  },
];

export default function TechStack() {
  return (
    <section id="technology" className="relative bg-[#020617] py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3B82F6]">
            Built On
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            A modern, reliable technology stack
          </h2>
          <p className="mt-4 text-slate-400">
            Every layer chosen for performance, type-safety, and long-term
            maintainability.
          </p>
        </motion.div>

        <div className="mt-16 flex flex-col gap-14">
          {CATEGORIES.map((category, categoryIndex) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.05 }}
            >
              <div className="mb-5 flex items-center gap-3">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: category.accent }}
                />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                  {category.name}
                </h3>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {category.items.map((tech, i) => (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45, delay: i * 0.06 }}
                    className="group relative rounded-2xl p-[1px] transition-transform duration-300 hover:-translate-y-1"
                    style={{
                      background: `linear-gradient(135deg, ${category.accent}55, transparent 60%)`,
                    }}
                  >
                    <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]/80 p-5 backdrop-blur-xl">
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-70"
                        style={{ backgroundColor: category.accent }}
                      />
                      <span
                        className="relative flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                        style={{
                          background: `linear-gradient(135deg, ${category.accent}33, ${category.accent}11)`,
                        }}
                      >
                        <tech.icon className="h-5 w-5" style={{ color: category.accent }} />
                      </span>
                      <p className="relative mt-4 text-sm font-semibold text-white">
                        {tech.name}
                      </p>
                      <p className="relative mt-1.5 text-xs leading-relaxed text-slate-500">
                        {tech.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
