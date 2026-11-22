import { useEffect } from "react";
import { Braces } from "lucide-react";
import { Eyebrow } from "../components/eyebrow";
import { messages } from "../locales";
import type { HomePageProps } from "./home-page.types";

export function HomePage({ locale, navigate }: HomePageProps) {
  const t = messages[locale].home;

  useEffect(() => {
    document.title = t.documentTitle;
  }, [t.documentTitle]);

  return (
    <section className="relative mx-auto mt-[7vh] mb-[6vh] flex min-h-[440px] w-full max-w-[1120px] flex-1 items-center overflow-hidden rounded-[17px] border border-line bg-surface shadow-card max-[800px]:mt-[5vh] max-[800px]:min-h-[410px] max-[520px]:min-h-[390px] max-[520px]:rounded-xl">
      <div className="pointer-events-none absolute top-[5%] right-[5%] size-[210px] rounded-full bg-accent/9 blur-[70px]" />
      <div className="pointer-events-none absolute right-[28%] bottom-[2%] size-[140px] rounded-full bg-[#779dda]/5 blur-[70px]" />
      <div className="relative z-10 max-w-[680px] px-[7.2%] py-16 max-[800px]:px-[8%] max-[800px]:py-[55px] max-[520px]:px-[7%] max-[520px]:py-[42px]">
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h1 className="mt-[27px] mb-2.5 text-[clamp(42px,5.1vw,65px)] font-semibold leading-[1.05] tracking-[-3.5px] max-[520px]:text-[42px] max-[520px]:tracking-[-2px]">
          {t.title}<span className="text-accent">.</span>
        </h1>
        <p className="m-0 text-base tracking-[-0.2px] text-muted max-[520px]:text-sm">{t.description}</p>
        <div className="mt-[38px] mb-6 h-px w-16 bg-line" />
        <p className="mb-2 text-[13px] font-medium">{t.ready}</p>
        <a
          className="mt-[18px] mb-3.5 inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3.5 text-xs font-semibold text-ink no-underline transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-foreground"
          href="/json-formatter"
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
            event.preventDefault();
            navigate("/json-formatter");
          }}
        >
          <Braces size={15} strokeWidth={2.4} />
          {t.open}
        </a>
        <p className="m-0 text-[11px] leading-[1.7] text-muted">{t.next}</p>
      </div>
      <div className="pointer-events-none absolute top-1/2 right-[8%] grid aspect-square w-[310px] -translate-y-1/2 place-items-center opacity-90 max-[800px]:right-[-54px] max-[800px]:opacity-25" aria-hidden="true">
        <div className="absolute inset-[9%] animate-spin-slow rounded-full border border-dashed border-line opacity-85" />
        <div className="absolute inset-[23%] rounded-full border border-ring-mix" />
        <div className="grid size-[74px] place-items-center rounded-[22px] border border-center-line bg-accent-soft text-accent shadow-center">
          <Braces size={31} />
        </div>
        <span className="absolute top-[17%] left-[41%] size-[9px] rounded-full bg-accent shadow-dot" />
        <span className="absolute top-[54%] right-[13%] size-1.5 rounded-full bg-accent opacity-60 shadow-dot" />
        <span className="absolute bottom-[17%] left-[24%] size-[5px] rounded-full bg-accent opacity-40 shadow-dot" />
      </div>
    </section>
  );
}
