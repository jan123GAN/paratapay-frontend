import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query.provider";
import RoutesProvider from "./routes.provider";

const AppProviders = () => {
  return (
    <ThemeProvider defaultTheme="system">
      <QueryProvider>
        <RoutesProvider />
      </QueryProvider>
    </ThemeProvider>
  );
};

export default AppProviders;
