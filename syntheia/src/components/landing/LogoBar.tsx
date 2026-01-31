"use client";

const companies = [
  { name: "Unilever", logo: "U" },
  { name: "P&G", logo: "P&G" },
  { name: "Nielsen", logo: "N" },
  { name: "Kantar", logo: "K" },
  { name: "Ipsos", logo: "I" },
  { name: "McKinsey", logo: "Mc" },
  { name: "Deloitte", logo: "D" },
  { name: "Accenture", logo: "A" },
];

function LogoItem({ company }: { company: typeof companies[0] }) {
  return (
    <div className="flex-shrink-0 mx-8 flex items-center gap-3 group cursor-default">
      <div className="w-10 h-10 rounded-xl bg-[#1A1A2E]/5 flex items-center justify-center group-hover:bg-[#7C3AED]/10 transition-colors">
        <span className="text-lg font-bold text-[#1A1A2E]/30 group-hover:text-[#7C3AED] transition-colors">
          {company.logo}
        </span>
      </div>
      <span className="text-lg font-semibold text-[#1A1A2E]/30 group-hover:text-[#7C3AED] transition-colors">
        {company.name}
      </span>
    </div>
  );
}

export function LogoBar() {
  return (
    <section className="relative py-12 bg-white border-y border-[#E5E7EB] overflow-hidden">
      {/* Subtle decorative purple accent */}
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[200px] bg-[#7C3AED]/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      <div className="relative">
        <p className="text-center text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-8">
          Trusted by research teams at leading companies
        </p>

        {/* Marquee container */}
        <div className="relative overflow-hidden">
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Scrolling logos */}
          <div className="flex animate-marquee-left" style={{ animationDuration: '25s' }}>
            {companies.map((company, i) => (
              <LogoItem key={`original-${i}`} company={company} />
            ))}
            {companies.map((company, i) => (
              <LogoItem key={`duplicate-${i}`} company={company} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
