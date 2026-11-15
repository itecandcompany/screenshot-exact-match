const clients = [
  {
    name: "E3 Empower",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRt4sCldW4IT1_r4D4IiFgkoMedUBX6Ept5JmfpKuYkVQ&s=10",
  },
];

function ClientLogos({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div className="client-marquee-group" aria-hidden={duplicate || undefined}>
      {clients.map((client) => (
        <div className="client-logo-card" key={client.name}>
          <img src={client.logo} alt={duplicate ? "" : `${client.name} logo`} loading="lazy" />
        </div>
      ))}
    </div>
  );
}

export function ClientShowcase() {
  return (
    <section className="client-showcase" aria-label="Our clients">
      <div className="container">
        <div className="client-showcase-heading">
          <div>
            <div className="eyebrow">Our growing network</div>
            <h2 className="client-showcase-title">Good people. <span>Great partnerships.</span></h2>
          </div>
          <p className="client-showcase-copy">
            We’re proud to support organisations making a difference. More client stories are on the way.
          </p>
        </div>
      </div>
      <div className="client-marquee" aria-label="Client logos">
        <div className="client-marquee-track">
          <ClientLogos />
          <ClientLogos duplicate />
        </div>
      </div>
    </section>
  );
}
