import { defineConfig, type Options } from 'tsup';

const config: Options = {
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  tsconfig: 'tsconfig.json',
  target: 'node18',
  dts: true,
  sourcemap: true,
  minify: true,
  clean: true,  
  outDir: 'dist',
  treeshake: true,
  splitting: false,
};

export default defineConfig(config);