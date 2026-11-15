const clientLogos = [
  {
    name: "E3 Empower",
    src: "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=100037757807912",
  },
  {
    name: "Nexora",
    // Replace this text treatment with the supplied client logo when its images are uploaded.
    src: null,
  },
];

function LogoGroup({ copy = false }: { copy?: boolean }) {
  return (
    <div className="client-logo-group" aria-hidden={copy || undefined}>
      {clientLogos.map((client) => (
        <div className="client-logo-item" key={client.name}>
          {client.src ? (
            <img src={client.src} alt={copy ? "" : client.name} loading="lazy" />
          ) : (
            <span className="client-logo-wordmark" aria-label={copy ? undefined : client.name}>
              {client.name}
            </span>
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
