const clientLogos = [
  {
    name: "E3 Empower",
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRt4sCldW4IT1_r4D4IiFgkoMedUBX6Ept5JmfpKuYkVQ&s=10",
  },
];

function LogoGroup({ copy = false }: { copy?: boolean }) {
  return (
    <div className="client-logo-group" aria-hidden={copy || undefined}>
      {clientLogos.map((client) => (
        <div className="client-logo-item" key={client.name}>
          <img src={client.src} alt={copy ? "" : client.name} loading="lazy" />
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
