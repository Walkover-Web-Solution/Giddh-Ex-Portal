"use client";

import { BookOpen, Zap, Lock, Building2, ArrowRight } from "lucide-react";
import { useConfig } from "@/contexts/ConfigContext";

export default function Home() {
  const { config } = useConfig();

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <section className="relative flex w-full items-center justify-center bg-blue-900 px-6 py-8 text-white md:py-12 lg:w-1/2 lg:py-20">
        <div className="max-w-md text-center lg:text-left">
          <div className="mb-6 flex justify-center md:mb-8 lg:justify-start">
            <BookOpen className="h-10 w-10" aria-hidden />
          </div>

          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            Smart Accounting
            <br />
            Made Simple
          </h1>

          <p className="mt-3 text-sm text-indigo-200 sm:text-base md:mt-4">
            Manage your books with confidence. Giddh provides powerful tools for modern businesses.
          </p>
        </div>
      </section>
      <section className="flex w-full items-center justify-center bg-white px-6 py-8 md:py-12 lg:w-1/2 lg:py-20">
        <div className="w-full max-w-md text-center lg:text-left">
          <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">Access Your Portal</h2>

          <ul className="mt-8 space-y-5 md:mt-6 md:space-y-4 lg:mt-10 lg:space-y-6">
            <FeatureItem
              icon={<Zap />}
              title="Lightning Fast"
              description="Process transactions and generate reports in seconds"
            />

            <FeatureItem
              icon={<Lock />}
              title="Secure & Reliable"
              description="Bank-level security for your financial data"
            />

            <FeatureItem
              icon={<Building2 />}
              title="Enterprise Ready"
              description="Scalable solution for businesses of all sizes"
            />
          </ul>
          <a
            href={config.WEBSITE_DOMAIN}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 md:mt-6 lg:mt-10"
          >
            Know more about Giddh
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </main>
  );
}

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <li className="flex flex-col items-center gap-3 lg:flex-row lg:items-start lg:gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-blue-900 shadow-sm">
        {icon}
      </div>
      <div className="text-center lg:text-left">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </li>
  );
}
