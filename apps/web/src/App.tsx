import { AppShell } from "./components/app-shell";
import { useResolvedLocale } from "./hooks/use-resolved-locale";
import { useRoute } from "./hooks/use-route";
import { HomePage } from "./pages/home-page";
import { JsonFormatterPage } from "./pages/json-formatter-page";

export default function App() {
  const locale = useResolvedLocale();
  const { path, navigate } = useRoute();

  return (
    <AppShell locale={locale} navigate={navigate}>
      {path === "/json-formatter" ? <JsonFormatterPage locale={locale} /> : <HomePage locale={locale} navigate={navigate} />}
    </AppShell>
  );
}
