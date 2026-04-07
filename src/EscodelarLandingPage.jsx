import React, { useEffect, useMemo, useState } from "react";

const eventConfig = {
  title: "Reunião Geral do Grupo Escodelar",
  subtitle:
    "Um encontro estratégico para reconhecer resultados, alinhar direções e preparar o grupo para um novo ciclo de crescimento.",
  dateLabel: "Quarta-feira, 14/01",
  timeLabel: "8h30",
  breakfastLabel: "7h30 às 8h20",
  formatLabel: "100% presencial",
  locationLabel: "Auditório Spazio JK",
  addressLabel:
    "Av. Pres. Juscelino Kubitschek, 1726 – Vila Nova Conceição, São Paulo – SP",
  announcedSeats: 20
};

const aboutCards = [
  {
    title: "Reconhecimento",
    description:
      "Premiação dos profissionais que se destacaram em performance, consistência e postura."
  },
  {
    title: "Alinhamento estratégico",
    description:
      "Direcionamentos claros de marca, marketing, operação e visão comercial para 2026."
  },
  {
    title: "Crescimento sustentável",
    description:
      "Decisões orientadas por processo, eficiência e protagonismo com visão de longo prazo."
  }
];

const agendaItems = [
  {
    title: "Reconhecimento dos Campeões do Trimestre",
    description:
      "Premiação dos profissionais que mais se destacaram em resultado, consistência e postura no último ciclo."
  },
  {
    title: "Perspectivas e projeções para 2026",
    description:
      "Visão estratégica sobre o mercado, oportunidades e direcionamentos para o próximo ciclo."
  },
  {
    title: "Estratégias para um ano de recordes",
    description:
      "Apresentação das estratégias que conduzirão o grupo a um novo patamar de vendas e faturamento."
  }
];

const eventInfoCards = [
  { label: "Data", value: "Quarta-feira, 14/01" },
  { label: "Horário", value: "8h30" },
  { label: "Café da manhã", value: "7h30 às 8h20" },
  { label: "Local", value: "Auditório Spazio JK" }
];

const sectionContainerClass = "mx-auto w-full max-w-[1140px] px-6 lg:px-8";

const nextEventDate = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  let date = new Date(currentYear, 0, 14, 8, 30, 0, 0);
  if (date.getTime() <= now.getTime()) {
    date = new Date(currentYear + 1, 0, 14, 8, 30, 0, 0);
  }
  return date;
};

const formatCountdown = (targetDate) => {
  const now = new Date().getTime();
  const diff = targetDate.getTime() - now;
  if (diff <= 0) {
    return "Evento em andamento";
  }
  const day = 1000 * 60 * 60 * 24;
  const hour = 1000 * 60 * 60;
  const minute = 1000 * 60;
  const days = Math.floor(diff / day);
  const hours = Math.floor((diff % day) / hour);
  const minutes = Math.floor((diff % hour) / minute);
  return `${days}d • ${hours}h • ${minutes}min`;
};

const PrimaryButton = ({ href, children, type = "button", onClick, className = "" }) => {
  const baseClass =
    "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#C8A96A] to-[#E3C184] px-6 py-3 text-sm font-bold uppercase tracking-[0.08em] text-[#0A0A0A] shadow-[0_10px_30px_rgba(200,169,106,0.30)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_34px_rgba(200,169,106,0.45)]";
  if (href) {
    return (
      <a href={href} className={`${baseClass} ${className}`}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} className={`${baseClass} ${className}`}>
      {children}
    </button>
  );
};

const OutlineButton = ({ href, children }) => (
  <a
    href={href}
    className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold tracking-[0.04em] text-white transition-all duration-300 hover:border-white/45 hover:bg-white/10"
  >
    {children}
  </a>
);

const Header = ({ countdown }) => (
  <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl">
    <div className="border-b border-white/10 bg-[#C8A96A]/10">
      <div className={`${sectionContainerClass} py-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-[#E7D0A0]`}>
        Evento presencial • Presença obrigatória • Grupo Escodelar
      </div>
    </div>
    <div className={`${sectionContainerClass} flex h-[72px] items-center justify-between gap-6`}>
      <div className="flex items-center gap-2 text-sm font-bold tracking-[0.1em] text-white">
        <span className="h-2.5 w-2.5 rounded-full bg-[#C8A96A] shadow-[0_0_18px_rgba(200,169,106,0.85)]" />
        ESCODELAR
      </div>
      <div className="hidden items-center gap-8 text-sm text-[#F3F3F3]/80 md:flex">
        <a href="#sobre" className="transition hover:text-white">Sobre</a>
        <a href="#pauta" className="transition hover:text-white">Pauta</a>
        <a href="#info" className="transition hover:text-white">Informações</a>
        <a href="#local" className="transition hover:text-white">Local</a>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden text-sm font-semibold text-[#F3F3F3]/70 lg:inline">{countdown}</span>
        <PrimaryButton href="#confirmacao" className="px-4 py-2.5 text-xs">
          Confirmar presença
        </PrimaryButton>
      </div>
    </div>
  </header>
);

const HeroSection = ({ countdown, confirmedSeats, seatProgress }) => (
  <section className="relative overflow-hidden bg-[#0A0A0A] pb-24 pt-[170px] md:pb-28 md:pt-[190px]">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-0 top-0 h-[520px] w-[520px] rounded-full bg-[#1B2C48]/30 blur-[120px]" />
      <div className="absolute right-[-140px] top-[120px] h-[440px] w-[440px] rounded-full bg-[#C8A96A]/15 blur-[130px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.08),transparent_55%)]" />
    </div>
    <div className={`${sectionContainerClass} relative z-10`}>
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="animate-fade-up rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-md md:p-10">
          <span className="mb-6 inline-flex rounded-full border border-[#C8A96A]/40 bg-[#C8A96A]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#E7D0A0]">
            Reunião Geral do Grupo Escodelar
          </span>
          <h1 className="max-w-[15ch] text-[40px] font-bold leading-[1.02] text-white md:text-[64px]">
            Reunião Geral do Grupo Escodelar
          </h1>
          <p className="mt-6 max-w-[62ch] text-[18px] leading-relaxed text-[#F3F3F3]/78">
            {eventConfig.subtitle}
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-[#E5E5E5]">
              100% presencial
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-[#E5E5E5]">
              Café da manhã antes da reunião
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-[#E5E5E5]">
              Auditório Spazio JK
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-[#E5E5E5]">
              Presença e pontualidade fundamentais
            </span>
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <PrimaryButton href="#confirmacao">Confirmar presença</PrimaryButton>
            <OutlineButton href="#pauta">Ver pauta</OutlineButton>
          </div>
        </div>

        <div className="animate-fade-up animation-delay-120 rounded-3xl border border-white/10 bg-gradient-to-br from-[#1A2438] to-[#111724] p-7 shadow-[0_18px_45px_rgba(0,0,0,0.45)]">
          <div className="grid gap-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E7D0A0]">Contagem</span>
              <p className="mt-2 text-[34px] font-bold leading-tight text-white">{countdown}</p>
              <p className="mt-2 text-sm text-[#D5D9E6]/72">Até o início do encontro estratégico.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E7D0A0]">Bloco do evento</span>
              <div className="mt-3 grid gap-3 text-sm text-[#E6E9F2]">
                <p className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span>Data</span>
                  <strong>{eventConfig.dateLabel}</strong>
                </p>
                <p className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span>Horário</span>
                  <strong>{eventConfig.timeLabel}</strong>
                </p>
                <p className="flex items-center justify-between">
                  <span>Local</span>
                  <strong>{eventConfig.locationLabel}</strong>
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0F1728] p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D9E6FF]">
                  Vagas externas
                </span>
                <span className="rounded-full border border-white/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#D9E6FF]">
                  {confirmedSeats >= eventConfig.announcedSeats ? "Lista extra ativa" : "Abertas"}
                </span>
              </div>
              <p className="mt-2 text-4xl font-bold text-white">
                {confirmedSeats}
                <span className="text-[#A5B6D4]">/{eventConfig.announcedSeats}</span>
              </p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-[#C8A96A] to-[#DAB979]" style={{ width: `${seatProgress}%` }} />
              </div>
              <p className="mt-3 text-xs text-[#D5D9E6]/75">
                20 vagas anunciadas. Se exceder, acomodaremos participantes adicionais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const AboutSection = () => (
  <section id="sobre" className="bg-white py-[110px]">
    <div className={sectionContainerClass}>
      <div className="mx-auto max-w-[860px] text-center">
        <h2 className="text-[36px] font-semibold leading-tight text-[#111111] md:text-[40px]">Sobre o encontro</h2>
        <div className="mt-7 space-y-5 text-[18px] leading-relaxed text-[#333333]">
          <p>
            Encerrando o último trimestre, o Grupo Escodelar realizou uma reunião estratégica que marcou um importante
            momento de reconhecimento, alinhamento e planejamento para o próximo ciclo.
          </p>
          <p>
            O encontro foi dedicado à premiação dos corretores e gerentes que se destacaram no último trimestre,
            valorizando resultados, consistência, comprometimento e postura profissional ao longo do período.
          </p>
          <p>
            Mais do que números, o momento reforçou a cultura de mérito e crescimento sustentável que move o grupo.
          </p>
          <p>
            Além do reconhecimento, a reunião teve como foco o alinhamento das novas estratégias para 2026, com
            direcionamentos claros sobre posicionamento de marca, processos comerciais, marketing, uso de tecnologia,
            geração de demanda e fortalecimento da operação.
          </p>
          <p>
            As decisões e trocas realizadas visam preparar o time para um novo ciclo de crescimento, com mais eficiência,
            protagonismo e visão de longo prazo.
          </p>
        </div>
        <p className="mt-8 text-xl font-semibold text-[#111111]">
          Resultado é consequência de processo, estratégia e pessoas alinhadas em um mesmo propósito.
        </p>
      </div>
      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {aboutCards.map((card, index) => (
          <div
            key={card.title}
            className={`animate-fade-up rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-[0_10px_30px_rgba(10,10,10,0.06)] animation-delay-${(index + 1) * 90}`}
          >
            <h3 className="text-[24px] font-semibold text-[#111111]">{card.title}</h3>
            <p className="mt-3 text-[16px] leading-relaxed text-[#4C4C4C]">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const AgendaSection = () => (
  <section id="pauta" className="bg-[#F3F3F3] py-[120px]">
    <div className={sectionContainerClass}>
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8B6E39]">Pauta da reunião</p>
          <h2 className="mt-3 text-[40px] font-semibold leading-tight text-[#101010]">O que será apresentado nesta reunião</h2>
          <p className="mt-5 text-[18px] leading-relaxed text-[#3F3F3F]">
            Conteúdo objetivo para reconhecer resultados, projetar oportunidades e alinhar a execução de um novo ciclo.
          </p>
        </div>
        <div className="space-y-4">
          {agendaItems.map((item, index) => (
            <article
              key={item.title}
              className={`animate-fade-up rounded-2xl border border-[#DDDDDD] bg-white p-6 shadow-[0_10px_25px_rgba(0,0,0,0.06)] animation-delay-${(index + 1) * 80}`}
            >
              <div className="flex items-start gap-4">
                <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111111] text-lg text-[#C8A96A]">
                  ✦
                </span>
                <div>
                  <h3 className="text-[24px] font-semibold text-[#101010]">{item.title}</h3>
                  <p className="mt-2 text-[16px] leading-relaxed text-[#4A4A4A]">{item.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const InfoCardsSection = () => (
  <section id="info" className="bg-[#0A0A0A] py-[115px]">
    <div className={sectionContainerClass}>
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#E7D0A0]">Informações do evento</p>
        <h2 className="mt-3 text-[40px] font-semibold leading-tight text-white">Tudo o que você precisa saber</h2>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {eventInfoCards.map((card, index) => (
          <div
            key={card.label}
            className={`animate-fade-up rounded-2xl border border-white/15 bg-white/[0.04] p-6 shadow-[0_12px_35px_rgba(0,0,0,0.35)] backdrop-blur-md animation-delay-${(index + 1) * 90}`}
          >
            <span className="text-sm uppercase tracking-[0.14em] text-[#B8C6E8]">{card.label}</span>
            <p className="mt-3 text-[28px] font-semibold leading-tight text-white">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const LocationSection = () => (
  <section id="local" className="bg-white py-[110px]">
    <div className={sectionContainerClass}>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="animate-fade-up rounded-2xl border border-[#E4E4E4] bg-[#FAFAFA] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
          <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-xl border border-[#E5E5E5] bg-[radial-gradient(circle_at_30%_20%,rgba(200,169,106,0.20),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(15,42,68,0.20),transparent_50%),#F5F5F5]">
            <div className="text-center">
              <span className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-[#C8A96A]/50 bg-white text-2xl text-[#8B6E39]">
                📍
              </span>
              <p className="text-sm uppercase tracking-[0.16em] text-[#8B6E39]">Área reservada para mapa</p>
              <p className="mt-2 text-base text-[#333333]">Visual de localização do Auditório Spazio JK</p>
            </div>
          </div>
        </div>
        <div className="animate-fade-up animation-delay-120 rounded-2xl border border-[#E5E5E5] bg-white p-8 shadow-[0_12px_30px_rgba(0,0,0,0.07)]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8B6E39]">Onde será o encontro</p>
          <h2 className="mt-3 text-[40px] font-semibold leading-tight text-[#101010]">Auditório Spazio JK</h2>
          <p className="mt-5 text-[18px] leading-relaxed text-[#383838]">
            Av. Pres. Juscelino Kubitschek, 1726
            <br />
            Vila Nova Conceição
            <br />
            São Paulo – SP
          </p>
          <p className="mt-4 text-base text-[#5A5A5A]">
            Café da manhã servido das 7h30 às 8h20 para recepção e networking inicial.
          </p>
          <PrimaryButton href="https://maps.google.com/?q=Av.+Pres.+Juscelino+Kubitschek,+1726,+Sao+Paulo" className="mt-8 w-fit">
            Ver local
          </PrimaryButton>
        </div>
      </div>
    </div>
  </section>
);

const FinalCTASection = ({ formData, onChange, onSubmit, status, confirmedSeats, seatProgress }) => (
  <section id="confirmacao" className="bg-[#0A0A0A] py-[120px]">
    <div className={sectionContainerClass}>
      <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-[#111827] via-[#101521] to-[#0A0A0A] p-8 shadow-[0_24px_50px_rgba(0,0,0,0.45)] md:p-10">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <h2 className="text-[40px] font-semibold leading-tight text-white">Sua presença é fundamental.</h2>
            <p className="mt-5 text-[18px] leading-relaxed text-[#D4D9E6]">
              Este encontro marca o alinhamento de um novo ciclo. Estar presente é fazer parte das decisões, da visão e
              do crescimento do Grupo Escodelar.
            </p>
            <div className="mt-6 inline-flex rounded-full border border-[#C8A96A]/40 bg-[#C8A96A]/12 px-4 py-2 text-sm font-semibold text-[#E7D0A0]">
              A sua presença e pontualidade são fundamentais.
            </div>

            <div className="mt-10 rounded-2xl border border-white/15 bg-white/[0.04] p-5">
              <div className="flex items-center justify-between text-sm text-[#D4D9E6]">
                <span>Confirmações externas</span>
                <span>{confirmedSeats}/{eventConfig.announcedSeats}</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-[#C8A96A] to-[#E3C184]" style={{ width: `${seatProgress}%` }} />
              </div>
              <p className="mt-3 text-xs text-[#D0D7E8]/75">
                Vagas anunciadas: 20. Havendo demanda superior, seguimos com acomodação adicional.
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="rounded-2xl border border-white/15 bg-white/[0.03] p-6">
            <h3 className="text-[28px] font-semibold text-white">Enviar confirmação</h3>
            <div className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-[#E8ECF8]">
                Nome completo
                <input
                  className="h-12 rounded-xl border border-white/20 bg-[#0A0F19] px-4 text-white outline-none transition focus:border-[#C8A96A] focus:ring-2 focus:ring-[#C8A96A]/30"
                  name="fullName"
                  value={formData.fullName}
                  onChange={onChange}
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#E8ECF8]">
                E-mail
                <input
                  type="email"
                  className="h-12 rounded-xl border border-white/20 bg-[#0A0F19] px-4 text-white outline-none transition focus:border-[#C8A96A] focus:ring-2 focus:ring-[#C8A96A]/30"
                  name="email"
                  value={formData.email}
                  onChange={onChange}
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#E8ECF8]">
                WhatsApp
                <input
                  className="h-12 rounded-xl border border-white/20 bg-[#0A0F19] px-4 text-white outline-none transition focus:border-[#C8A96A] focus:ring-2 focus:ring-[#C8A96A]/30"
                  name="whatsApp"
                  value={formData.whatsApp}
                  onChange={onChange}
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#E8ECF8]">
                Unidade / equipe
                <input
                  className="h-12 rounded-xl border border-white/20 bg-[#0A0F19] px-4 text-white outline-none transition focus:border-[#C8A96A] focus:ring-2 focus:ring-[#C8A96A]/30"
                  name="team"
                  value={formData.team}
                  onChange={onChange}
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#E8ECF8]">
                Observações
                <textarea
                  className="min-h-[110px] rounded-xl border border-white/20 bg-[#0A0F19] px-4 py-3 text-white outline-none transition focus:border-[#C8A96A] focus:ring-2 focus:ring-[#C8A96A]/30"
                  name="notes"
                  value={formData.notes}
                  onChange={onChange}
                />
              </label>
              <PrimaryButton type="submit" className="mt-2 w-full">
                Enviar confirmação
              </PrimaryButton>
              {status ? (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    status.type === "success"
                      ? "border-[#7EF1D1]/35 bg-[#7EF1D1]/10 text-[#7EF1D1]"
                      : "border-[#FFA0B5]/35 bg-[#FFA0B5]/10 text-[#FFD3DE]"
                  }`}
                >
                  {status.message}
                </div>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-white/10 bg-[#08090E] py-10">
    <div className={`${sectionContainerClass} text-center`}>
      <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#E7D0A0]">Grupo Escodelar</p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-5 text-sm text-[#D6DCEA]">
        <span>#GrupoEscodelar</span>
        <span>#GoEscodelar</span>
      </div>
      <p className="mx-auto mt-5 max-w-[760px] text-sm leading-relaxed text-[#A9B7D6]">
        “Significado e importância para sua carreira são fundamentos para grandes realizações.”
      </p>
    </div>
  </footer>
);

const FloatingPopup = ({ onClose, onGo }) => (
  <div className="fixed bottom-4 right-4 z-40 w-[min(360px,calc(100vw-24px))] rounded-2xl border border-white/15 bg-[#121826]/95 p-4 shadow-[0_14px_34px_rgba(0,0,0,0.45)] backdrop-blur-md animate-fade-up">
    <p className="text-sm font-semibold uppercase tracking-[0.1em] text-[#E7D0A0]">Convite aberto</p>
    <p className="mt-1 text-sm leading-relaxed text-[#D5DCEA]">
      Evento presencial no Spazio JK. Garanta sua confirmação para o encontro estratégico.
    </p>
    <div className="mt-4 flex justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-white/10"
      >
        Fechar
      </button>
      <PrimaryButton onClick={onGo} className="px-3 py-2 text-xs">
        Confirmar presença
      </PrimaryButton>
    </div>
  </div>
);

export default function EscodelarLandingPage() {
  const [countdown, setCountdown] = useState("");
  const [confirmedSeats, setConfirmedSeats] = useState(0);
  const [status, setStatus] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    whatsApp: "",
    team: "",
    notes: ""
  });

  const seatProgress = useMemo(
    () => Math.min((confirmedSeats / eventConfig.announcedSeats) * 100, 100),
    [confirmedSeats]
  );

  useEffect(() => {
    const storageKey = "escodelar-premium-confirmed-seats";
    const saved = Number(window.localStorage.getItem(storageKey) || 0);
    if (Number.isFinite(saved) && saved >= 0) {
      setConfirmedSeats(saved);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("escodelar-premium-confirmed-seats", String(confirmedSeats));
  }, [confirmedSeats]);

  useEffect(() => {
    const targetDate = nextEventDate();
    setCountdown(formatCountdown(targetDate));
    const interval = window.setInterval(() => {
      setCountdown(formatCountdown(targetDate));
    }, 1000 * 30);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const popupSeen = window.sessionStorage.getItem("escodelar-premium-popup-seen");
    if (popupSeen === "1") {
      return;
    }
    const onScroll = () => {
      const trigger = document.documentElement.scrollHeight * 0.2;
      if (window.scrollY > trigger) {
        setShowPopup(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const values = Object.values(formData).map((item) => item.trim());
    if (!values[0] || !values[1] || !values[2] || !values[3]) {
      setStatus({
        type: "error",
        message: "Preencha todos os campos obrigatórios para enviar a confirmação."
      });
      return;
    }
    setConfirmedSeats((previous) => previous + 1);
    setStatus({
      type: "success",
      message: "Confirmação enviada com sucesso. Sua presença foi registrada."
    });
    setFormData({
      fullName: "",
      email: "",
      whatsApp: "",
      team: "",
      notes: ""
    });
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    window.sessionStorage.setItem("escodelar-premium-popup-seen", "1");
  };

  const handlePopupGo = () => {
    const section = document.getElementById("confirmacao");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    handlePopupClose();
  };

  return (
    <div className="bg-[#0A0A0A] text-white">
      <style>{`
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeUp .75s cubic-bezier(0.23, 1, 0.32, 1) both;
        }
        .animation-delay-80 { animation-delay: .08s; }
        .animation-delay-90 { animation-delay: .09s; }
        .animation-delay-120 { animation-delay: .12s; }
        .animation-delay-160 { animation-delay: .16s; }
        .animation-delay-180 { animation-delay: .18s; }
        .animation-delay-240 { animation-delay: .24s; }
        .animation-delay-270 { animation-delay: .27s; }
      `}</style>

      <Header countdown={countdown} />
      <HeroSection countdown={countdown} confirmedSeats={confirmedSeats} seatProgress={seatProgress} />
      <AboutSection />
      <AgendaSection />
      <InfoCardsSection />
      <LocationSection />
      <FinalCTASection
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        status={status}
        confirmedSeats={confirmedSeats}
        seatProgress={seatProgress}
      />
      <Footer />

      {showPopup ? <FloatingPopup onClose={handlePopupClose} onGo={handlePopupGo} /> : null}
    </div>
  );
}
