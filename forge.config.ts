import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import PublisherGithub from '@electron-forge/publisher-github';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import path from 'node:path';

const iconPath = path.resolve(process.cwd(), 'assets', 'icons', 'icon');
const macAppBundleId = 'com.tomcerdeira.ecenvs';
const isTruthyEnv = (value: string | undefined) =>
  typeof value === 'string' && ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());

const shouldSignMacApp =
  process.platform === 'darwin' &&
  Boolean(
    isTruthyEnv(process.env.APPLE_SIGN) ||
    process.env.CSC_LINK ||
    process.env.CSC_NAME ||
    process.env.APPLE_SIGN_IDENTITY
  );

const macNotarizeConfig = (() => {
  if (!shouldSignMacApp) {
    return undefined;
  }

  const appleId = process.env.APPLE_ID;
  const appleIdPassword = process.env.APPLE_APP_SPECIFIC_PASSWORD ?? process.env.APPLE_PASSWORD;
  const teamId = process.env.APPLE_TEAM_ID;

  if (appleId && appleIdPassword && teamId) {
    return {
      appleId,
      appleIdPassword,
      teamId,
    };
  }

  const appleApiKey = process.env.APPLE_API_KEY;
  const appleApiKeyId = process.env.APPLE_API_KEY_ID;
  const appleApiIssuer = process.env.APPLE_API_ISSUER;

  if (appleApiKey && appleApiKeyId && appleApiIssuer) {
    return {
      appleApiKey,
      appleApiKeyId,
      appleApiIssuer,
    };
  }

  const keychainProfile = process.env.APPLE_KEYCHAIN_PROFILE;
  const keychain = process.env.APPLE_KEYCHAIN;

  if (keychainProfile) {
    return keychain ? { keychainProfile, keychain } : { keychainProfile };
  }

  return undefined;
})();

if (shouldSignMacApp && process.env.CI && !macNotarizeConfig) {
  throw new Error(
    'macOS signing is enabled, but notarization credentials are missing. Configure Apple ID, API key, or keychain notarization settings before publishing a release.'
  );
}

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: iconPath,
    appBundleId: macAppBundleId,
    appCategoryType: 'public.app-category.developer-tools',
    osxSign: shouldSignMacApp ? true : undefined,
    osxNotarize: macNotarizeConfig,
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerDMG({}),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  publishers: [
    new PublisherGithub({
      repository: {
        owner: 'tomcerdeira',
        name: 'ecenvs',
      },
      authToken: process.env.GITHUB_TOKEN,
    }),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
