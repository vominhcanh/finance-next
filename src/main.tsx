import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { ConfigProvider } from 'antd-mobile';
import viVN from 'antd-mobile/es/locales/vi-VN';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'sonner';
import { routeTree } from './routeTree.gen';
import './styles/global.scss';

// Cấu hình Theme tập trung
const theme = {
  '--adm-color-primary': '#163f2a',
  '--adm-font-size-main': '14px',
  '--adm-border-radius-main': '8px',
};

// Create router instance
const router = createRouter({ routeTree });

// Create QueryClient instance
const queryClient = new QueryClient();

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root')!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ConfigProvider locale={viVN}>
        <div style={theme as React.CSSProperties}>
          <Toaster position="top-center" richColors duration={2000} />
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </div>
      </ConfigProvider>
    </StrictMode>
  );
}
