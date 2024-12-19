import { version } from '../package.json';

/* Amplitude Browser 2 SDK + SR begin */
(function (e, t) {
  var n = e.amplitude || { _q: [], _iq: {} };

  // Injecting Analytics script
  var r = t.createElement('script');
  r.type = 'text/javascript';
  r.integrity = 'sha384-VuGgAcmMrGHihvjXxxBVMIqoDFXc8/PO9q/08kCgq4Wn1iPnSmUbI3xhXaFozVFv';
  r.crossOrigin = 'anonymous';
  r.async = true;
  r.src = 'https://cdn.amplitude.com/libs/amplitude-8.18.1-min.gz.js';
  r.onload = function () {
    if (!e.amplitude.runQueuedFunctions) {
      console.log('[Amplitude] Error: could not load Browser SDK');
    }
  };
  var s = t.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(r, s);

  //Injecting Session Replay script
  var r = t.createElement('script');
  r.type = 'text/javascript';
  r.integrity = 'sha384-/yc1G+Og4ohl368OLZtdt/iP9FEqMvb07kBNPH5nJJV7/CJmsQtpgBYB4CaySPxg';
  r.crossOrigin = 'anonymous';
  r.async = true;
  r.src = 'https://cdn.amplitude.com/libs/plugin-session-replay-browser-1.4.0-min.js.gz';
  r.onload = function () {
    if (!e.amplitude.runQueuedFunctions) {
      console.log('[Amplitude] Error: could not load Session Replay SDK');
    }
  };
  var s = t.getElementsByTagName('script')[1];
  s.parentNode.insertBefore(r, s);

  function i(e, t) {
    e.prototype[t] = function () {
      this._q.push([t].concat(Array.prototype.slice.call(arguments, 0)));
      return this;
    };
  }
  var o = function () {
    this._q = [];
    return this;
  };
  var a = ['add', 'append', 'clearAll', 'prepend', 'set', 'setOnce', 'unset', 'preInsert', 'postInsert', 'remove'];
  for (var c = 0; c < a.length; c++) {
    i(o, a[c]);
  }
  n.Identify = o;
  var u = function () {
    this._q = [];
    return this;
  };
  var l = ['setProductId', 'setQuantity', 'setPrice', 'setRevenueType', 'setEventProperties'];
  for (var p = 0; p < l.length; p++) {
    i(u, l[p]);
  }
  n.Revenue = u;
  var d = [
    'init',
    'logEvent',
    'logRevenue',
    'setUserId',
    'setUserProperties',
    'setOptOut',
    'setVersionName',
    'setDomain',
    'setDeviceId',
    'enableTracking',
    'setGlobalUserProperties',
    'identify',
    'clearUserProperties',
    'setGroup',
    'logRevenueV2',
    'regenerateDeviceId',
    'groupIdentify',
    'onInit',
    'logEventWithTimestamp',
    'logEventWithGroups',
    'setSessionId',
    'resetSessionId',
    'setLibrary',
  ];
  function v(e) {
    function t(t) {
      e[t] = function () {
        e._q.push([t].concat(Array.prototype.slice.call(arguments, 0)));
      };
    }
    for (var n = 0; n < d.length; n++) {
      t(d[n]);
    }
  }
  v(n);
  n.getInstance = function (e) {
    e = (!e || e.length === 0 ? '$default_instance' : e).toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(n._iq, e)) {
      n._iq[e] = { _q: [] };
      v(n._iq[e]);
    }
    return n._iq[e];
  };
  e.amplitude = n;
})(window, document);
/* Amplitude JavaScript SDK end */

/* Amplitude Wrapper begin */
(function (a, p) {
  // If window.amplitude doesn't exist, return
  if (!a.amplitude || typeof a.amplitude.getInstance !== 'function') return;

  a.amplitude.getInstance().setLibrary('amplitude-js-gtm', version);

  // Enumerate available events
  var eventEnum = [
    'init',
    'setOptOut',
    'isNewSession',
    'getSessionId',
    'setSessionId',
    'setUserId',
    'setUserProperties',
    'clearUserProperties',
    'setGroup',
    'regenerateDeviceId',
    'setDeviceId',
    'setVersionName',
    'logEvent',
    'logEventWithTimestamp',
    'logEventWithGroups',
    'revenue',
    'identify',
  ];

  var identifyEnum = ['add', 'append', 'prepend', 'set', 'setOnce', 'unset', 'preInsert'];

  /* To work with the identify API, pass an array of identify operation (each an array in itself)
   * with the command and parameters included.
   *
   * window._amplitude('<instanceName.>identify', [
   *     ['add', 'someUserProp', 1],
   *     ['add', 'someOtherUserProp', 2],
   *     ['prepend', 'anotherUserProp', 'someValue']
   * ]);
   *
   */
  var identify = function (amplitudeInstance, args) {
    var identifyInstance = new a.amplitude.Identify();

    // Validate identify args
    if (!Array.isArray(args) || args.length === 0) return;

    // Loop through the commands array and execute each
    args[0].forEach(function (identifyParams) {
      var cmd = identifyParams.shift();

      // If not a valid "identify" command, return
      if (identifyEnum.indexOf(cmd) === -1) return;

      identifyInstance[cmd].apply(identifyInstance, identifyParams);
    });

    amplitudeInstance.identify(identifyInstance);
  };

  /* To send revenue, you need to pass an object to the command:
   *
   * {
   *   id: 'product_id', // required
   *   price: 10.88, // required
   *   quantity: 1,
   *   revenueType: 'purchase',
   *   eventProperties: {'someKey': 'someValue}
   * }
   *
   */
  var revenue = function (amplitudeInstance, args) {
    args = args.shift();
    // Validate revenue args
    if (!args.price || !args.id) return;

    var revenue = new a.amplitude.Revenue()
      .setProductId(args.id)
      .setQuantity(args.quantity || 1)
      .setPrice(args.price)
      .setRevenueType(args.revenueType || '')
      .setEventProperties(args.eventProperties || {});

    amplitudeInstance.logRevenueV2(revenue);
  };

  // Build the command wrapper logic
  a[p] =
    a[p] ||
    function () {
      // Build array out of arguments
      var args = [].slice.call(arguments, 0);

      // Pick the first argument as the command
      var cmd = args.shift();

      /* Commands can be passed to instances with syntax:
       * window._amplitude('instanceName.command', arguments)
       */
      var instanceName = null;
      var cmdParts = cmd.match(/^(.+)\.(.+)$/);
      if (cmdParts && cmdParts.length === 3) {
        instanceName = cmdParts[1];
        cmd = cmdParts[2];
      }

      // If cmd is not one of the available ones, return
      if (eventEnum.indexOf(cmd) === -1) return;

      // Fetch reference to instance
      var amplitudeInstance = a.amplitude.getInstance(instanceName);

      // Handle Revenue separately
      if (cmd === 'revenue') return revenue(amplitudeInstance, args);

      // Handle Identify separately
      if (cmd === 'identify') return identify(amplitudeInstance, args);

      // Otherwise call the method and pass the arguments
      if (cmd === 'init' && args.length === 6){
        // SR must be initilised and used
        console.log('[Amplitude] Info: Initiliasing Session Replay and Analytics Broswer for GTM');

        // If window.sessionReplay doesn't exist, return
        if (!a.sessionReplay || typeof a.sessionReplay.getInstance !== 'function') {
          console.log('[Amplitude] Error: Session Replay has not been initialised, not using it');
          return amplitudeInstance[cmd].apply(amplitudeInstance, args);
        } else {
          const sessionReplayTracking = a.sessionReplay.plugin();
          a.amplitude.add(sessionReplayTracking);
          return amplitudeInstance[cmd].apply(amplitudeInstance, args);
        }

      } else {
        console.log('[Amplitude] Info: Initiliasing Analytics Broswer for GTM');
        return amplitudeInstance[cmd].apply(amplitudeInstance, args);
      }
      
    };
})(window, '_amplitude');
/* Amplitude wrapper end */
