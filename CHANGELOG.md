# Changelog

## [2.0.1](https://github.com/seventwo-studio/expo-passkite/compare/v2.0.0...v2.0.1) (2026-05-11)


### Bug Fixes

* align Expo wallet platform APIs ([#26](https://github.com/seventwo-studio/expo-passkite/issues/26)) ([48947d3](https://github.com/seventwo-studio/expo-passkite/commit/48947d3ab76163f33521243d6bb1e14255ca2206))

## [2.0.0](https://github.com/seventwo-studio/expo-passkite/compare/v1.0.3...v2.0.0) (2026-05-06)


### ⚠ BREAKING CHANGES

* `Pass`, `PassBuilder`, `createPass`, `createPassBuilder`, `loadCredentialsFromEnv`, `loadPassIdentityFromEnv`, `hasCredentialsInEnv`, `hasPassIdentityInEnv`, `CREDENTIAL_ENV_VARS`, `PassIdentity`, `APPLE_WWDR_G4_CERTIFICATE`, and `getWWDRCertificate` must now be imported from `expo-passkite/server` instead of `expo-passkite`.

### Features

* split client and server entry points ([#22](https://github.com/seventwo-studio/expo-passkite/issues/22)) ([786131f](https://github.com/seventwo-studio/expo-passkite/commit/786131f9992d6751b300356ce79daa8716357071))

## [1.0.3](https://github.com/seventwo-studio/expo-passkite/compare/v1.0.2...v1.0.3) (2026-05-06)


### Bug Fixes

* **deps:** pin dependencies ([74934d6](https://github.com/seventwo-studio/expo-passkite/commit/74934d66b5540fd974f6833ed9535adfc459aff6))
* **deps:** pin dependencies ([b5da26b](https://github.com/seventwo-studio/expo-passkite/commit/b5da26bfe8e18f595f6479bf4157460c481813f4))
* **deps:** pin dependencies ([#16](https://github.com/seventwo-studio/expo-passkite/issues/16)) ([34ed5f3](https://github.com/seventwo-studio/expo-passkite/commit/34ed5f3643a00c452a277d1f093b8878b1e8e186))
* **deps:** update dependency @astrojs/starlight to ^0.38.0 ([dc5fbe0](https://github.com/seventwo-studio/expo-passkite/commit/dc5fbe08c40bc358b7385b1148b82488300b781e))
* **deps:** update dependency @astrojs/starlight to ^0.38.0 ([e6fa3be](https://github.com/seventwo-studio/expo-passkite/commit/e6fa3be3c2245f86e072881dc03558305715ac7e))
* **deps:** update dependency astro to v6 [security] ([#7](https://github.com/seventwo-studio/expo-passkite/issues/7)) ([8170987](https://github.com/seventwo-studio/expo-passkite/commit/8170987cbec7f32a41f60b85297b2d1900d17bff))
* **deps:** update dependency node-forge to v1.4.0 [security] ([f7d406f](https://github.com/seventwo-studio/expo-passkite/commit/f7d406fa514070da5a7e556a26ccef875e4f4e0f))
* **deps:** update dependency node-forge to v1.4.0 [security] ([41839fa](https://github.com/seventwo-studio/expo-passkite/commit/41839faba781c07ad28b3d1abe37fa1df3770435))
* prep repo for public release ([#15](https://github.com/seventwo-studio/expo-passkite/issues/15)) ([0449dbb](https://github.com/seventwo-studio/expo-passkite/commit/0449dbbd2809c1b0b0ea924e3f8c3b9fc2f48906))

## [1.0.2](https://github.com/seventwo-studio/expo-passkite/compare/v1.0.1...v1.0.2) (2026-01-24)


### Bug Fixes

* add .npmignore to reduce package size ([ff336be](https://github.com/seventwo-studio/expo-passkite/commit/ff336be4ccad7552482fd938555312c9f66eee82))

## [1.0.1](https://github.com/seventwo-studio/expo-passkite/compare/v1.0.0...v1.0.1) (2026-01-24)


### Bug Fixes

* add @types/bun to fix CI build ([762d5ee](https://github.com/seventwo-studio/expo-passkite/commit/762d5ee147f442d47308cf0a18c97218584116b9))

## 1.0.0 (2026-01-24)


### Features

* add iOS 18+ flexible pass support and embedded WWDR certificate ([a585aa9](https://github.com/seventwo-studio/expo-passkite/commit/a585aa960657f2f69e7b1543d8bd7b88085ae666))
