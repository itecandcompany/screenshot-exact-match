const clientLogos = [
  {
    name: "Kijuu Gas",
    src: "https://cdn.jsdelivr.net/gh/itecandcompany/screenshot-exact-match@ec93810d1c93601e236f7890a8235a306e49c886/kijuu%20gas%20.png",
  },
  {
    name: "NEXTDOOR ADS",
    src: "https://cdn.jsdelivr.net/gh/itecandcompany/screenshot-exact-match@ec93810d1c93601e236f7890a8235a306e49c886/nextdor%20adds.png",
  },
  {
    name: "Nexora",
    src: "https://cdn.jsdelivr.net/gh/itecandcompany/screenshot-exact-match@ec93810d1c93601e236f7890a8235a306e49c886/nextora%20logo.png",
  },
  {
    name: "Elimu Tech",
    src: "https://cdn.jsdelivr.net/gh/itecandcompany/screenshot-exact-match@ec93810d1c93601e236f7890a8235a306e49c886/elimu%20tech.png",
  },
  {
    name: "E3 Empower",
    src: "https://cdn.jsdelivr.net/gh/itecandcompany/screenshot-exact-match@ec93810d1c93601e236f7890a8235a306e49c886/e3%20empower%20logo%20.png",
  },
  {
    name: "Genesis Venace Fukuru Co.",
    src: "https://cdn.jsdelivr.net/gh/itecandcompany/screenshot-exact-match@ec93810d1c93601e236f7890a8235a306e49c886/genesis-venace-fukuru%20co.png",
  },
];

function LogoGroup({ copy = false }: { copy?: boolean }) {
  return (
    <div className="client-logo-group" aria-hidden={copy || undefined}>
      {clientLogos.map((client) => (
        <div className="client-logo-item" key={client.name}>
          <img
            src={client.src}
            alt={copy ? "" : client.name}
            loading="eager"
            decoding="async"
            width="190"
            height="66"
          />
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
