// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const loc = {
  ftAuthUrl: "https://api.intra.42.fr/oauth/authorize?client_id=54468a192544b06fef8e25a40d1e3d1febb65e21f600d6b57e1068e5aeba9823&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Fauth&response_type=code"
};

export const pub = {
  ftAuthUrl: "https://api.intra.42.fr/oauth/authorize?client_id=4f391c47a84fdc6865abb82d2f385e60a7ace38404a76d2f00b88283ce497795&redirect_uri=http%3A%2F%2Fwww.ecodtp.com%3A4200%2Fauth&response_type=code"
};

export const environment = {
  env: loc,
  production: false
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
