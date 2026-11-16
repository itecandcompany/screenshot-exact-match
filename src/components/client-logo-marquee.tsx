const clientLogos = [
  { name: "Kijuu Gas", src: "/images/kijuu-gas.png" },
  { name: "NEXTDOOR ADS", src: "/images/nextdoor-ads.png" },
  { name: "Nexora", src: "/images/nexora.png" },
  { name: "Elimu Tech", src: "/images/elimu-tech.png" },
  { name: "E3 Empower", src: "/images/e3-empower.png" },
  { name: "Index Tanzania", src: "/images/index-tanzania.svg", href: "https://index.tz/" },
  { name: "Genesis Venace Fukuru Co.", src: "/images/genesis-venace-fukuru.png" },
];

function LogoGroup({ copy = false }: { copy?: boolean }) {
  return (
    <div className="client-logo-group" aria-hidden={copy || undefined}>
      {clientLogos.map((client) => (
        <div className="client-logo-item" key={client.name}>
          {client.href ? (
            <a href={client.href} target="_blank" rel="noopener noreferrer" aria-label={copy ? undefined : `Visit ${client.name}`} tabIndex={copy ? -1 : 0}>
              <img src={client.src} alt={copy ? "" : client.name} loading="eager" decoding="async" width="190" height="66" />
            </a>
          ) : (
            <img src={client.src} alt={copy ? "" : client.name} loading="eager" decoding="async" width="190" height="66" />
          )}
        </div>
      ))}
    </div>
  );
}

export function ClientLogoMarquee() {
  return (
    <section className="client-logo-section" aria-label="Our clients">
      <div className="container client-logo-heading">
        <span className="eyebrow">Trusted partnerships</span>
        <p>Some of the people and organisations we’re proud to work with.</p>
      </div>
      <div className="client-logo-marquee">
        <div className="client-logo-track">
          <LogoGroup />
          <LogoGroup copy />
        </div>
      </div>
    </section>
  );
}
