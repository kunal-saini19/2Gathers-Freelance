import Link from "next/link";

const links = {
  Platform: [
    { href: "/jobs", label: "Find Jobs" },
    { href: "/register", label: "Get Started" },
    { href: "/wallet", label: "Wallet" },
    { href: "/chatbot", label: "AI Assistant" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/support", label: "Support" },
    { href: "/login", label: "Sign in" },
  ],
  Legal: [
    { href: "#", label: "Privacy Policy" },
    { href: "#", label: "Terms of Service" },
  ],
};

function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-secondary-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <span className="text-sm font-black text-white">2G</span>
              </div>
              <span className="text-base font-bold text-white">2Gathers</span>
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-500">
              A cleaner freelancing platform prototype with stronger structure, calmer spacing, and a more intentional product feel.
            </p>
          </div>

          {Object.entries(links).map(([groupName, items]) => (
            <div key={groupName}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white">{groupName}</h4>
              <ul className="space-y-2.5 text-sm">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="transition hover:text-slate-200">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-800 pt-8 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} 2Gathers. All rights reserved.</p>
          <p>Built for a more polished freelance workflow.</p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
export default Footer;
