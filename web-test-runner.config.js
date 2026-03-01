import { playwrightLauncher } from '@web/test-runner-playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function mockPlugin() {
  return {
    name: 'mock-firebase',
    resolveImport({ source }) {
      if (source === 'firebase/firestore') {
        return '/test/mocks/firebase-firestore.js';
      }
      if (source === 'firebase/functions') {
        return '/test/mocks/firebase-functions.js';
      }
    },
    serve(context) {
      if (context.path === '/src/services/firebase.js') {
        return fs.readFileSync(path.join(__dirname, 'test/mocks/firebase.js'), 'utf-8');
      }
      if (context.path === '/src/services/auth-service.js') {
        return fs.readFileSync(path.join(__dirname, 'test/mocks/auth-service.js'), 'utf-8');
      }
      if (context.path === '/src/services/connection-service.js') {
        return fs.readFileSync(path.join(__dirname, 'test/mocks/connection-service.js'), 'utf-8');
      }
    },
  };
}

export default {
  files: 'test/**/*.test.js',
  nodeResolve: true,
  browsers: [playwrightLauncher({ product: 'chromium' })],
  plugins: [mockPlugin()],
  testFramework: {
    config: {
      timeout: 5000,
    },
  },
};
