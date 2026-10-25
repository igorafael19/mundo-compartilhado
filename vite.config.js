import { defineConfig } from 'vite';

// OneDrive atrapalha o file-watcher padrão do Vite.
// usePolling força o Vite a checar os arquivos periodicamente,
// garantindo que o hot-reload funcione dentro da pasta do OneDrive.
export default defineConfig({
  server: {
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
});
