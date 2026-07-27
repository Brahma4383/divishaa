import { Link } from "react-router-dom";

const FOOTER_COLUMNS = [
  {
    title: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Careers", to: "/careers" },
      { label: "Blog", to: "/blog" },
    ],
  },
  {
    title: "Customer Service",
    links: [
      { label: "Contact", to: "/contact" },
      { label: "FAQ", to: "/faq" },
      { label: "Shipping", to: "/shipping" },
      { label: "Returns", to: "/returns" },
    ],
  },
  {
    title: "Quick Links",
    links: [
      { label: "Shop", to: "/shop" },
      { label: "Men", to: "/category/men" },
      { label: "Women", to: "/category/women" },
      { label: "Kids", to: "/category/kids" },
    ],
  },
];

const SOCIALS = [
  { label: "Facebook", to: "https://facebook.com" },
  { label: "Instagram", to: "https://instagram.com" },
  { label: "Twitter", to: "https://twitter.com" },
  { label: "YouTube", to: "https://youtube.com" },
];

export default function Footer() {
  return (
    <footer className="bg-ink px-[6vw] pb-8 pt-20 text-gray-light">
      <div className="grid grid-cols-1 gap-10 border-b border-[#3a332a] pb-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-serif text-2xl font-semibold text-ivory">Divishaa</p>
          <p className="mt-1 text-[11px] tracking-[0.3em] text-gold">.couture</p>
          <p className="mt-4 max-w-xs text-[13px] leading-7">
            Contemporary couture rooted in craft — considered silhouettes, hand-finished details, made to be worn
            and remembered.
          </p>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-[18px] text-xs font-medium uppercase tracking-widest text-ivory">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-[13.5px] transition hover:text-gold-soft">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 text-[12.5px]">
        <span>© 2026 Divishaa.couture. All Rights Reserved.</span>
        <div className="flex gap-4">
          {SOCIALS.map((social) => (
            <a
              key={social.label}
              href={social.to}
              target="_blank"
              rel="noreferrer"
              aria-label={social.label}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-[#4a4237] transition hover:border-gold hover:bg-gold hover:text-ink"
            >
              {social.label[0]}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

