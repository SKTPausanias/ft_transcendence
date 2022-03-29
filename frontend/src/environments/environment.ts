// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const loc = {
  ftAuthUrl: "[your 42 api url]",
};

export const pub = {
	ftAuthUrl: ""
  };
export const loc_ip = {
	ftAuthUrl: ""
};

export const environment = {
  env: loc,
  production: false,
  inactivity_time: 6000,			// 10 min
  renew_session_margin: 1800,	// 30 min before session expires in backend
  //server_ws_uri: 'ws://ph.noip.me:3000',
  server_ws_uri: 'ws://localhost:3000',
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
