/* drive-client.js — shared by POS (index.html), Finance (Finance.html) and Phone Repair (Phone.html).
 *
 * Google Drive runs directly from the GitHub Pages pages again (Google sign-in + Drive API in the browser).
 * This file only holds the subscription restriction for Drive: a device on a free trial, or with an expired
 * subscription, cannot connect Google Drive or use backup / restore / FIND. It makes NO network requests and holds NO credentials.
 * (Because Drive no longer passes through Apps Script, this restriction is enforced in the browser, not on the server.)
 */
(function () {
  'use strict';
  var TRIAL_MSG = 'Subscribe now to unlock Google Drive connection and backup. Renew your subscription to protect your data.';
  var EXPIRED_MSG = 'Your subscription has expired. Renew your subscription to use Google Drive connection and backup.';
  var SUB_KEY = 'ekambani_pos_sub_state_v2', ID_KEY = 'ekambani_pos_device_id_v1';
  var handler = null, lastToastAt = 0;

  function deviceId() {
    var id = '';
    try { id = String(window.EKAMBANI_DEVICE_ID || ''); } catch (e) {}
    if (!id) { try { id = String(window.parent && window.parent.EKAMBANI_DEVICE_ID || ''); } catch (e) {} }
    if (!id) { try { id = localStorage.getItem(ID_KEY) || ''; } catch (e) {} }
    return id.trim();
  }
  function ymd(d) { var p = function (n) { return ('0' + n).slice(-2); }; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
  function localState() {
    try {
      var o = JSON.parse(localStorage.getItem(SUB_KEY) || 'null');
      if (!o || o.deviceId !== deviceId()) return { allowed: false, code: 'UNVERIFIED' };
      var now = Math.max(Date.now(), Number(o.maxSeen) || 0), today = ymd(new Date(now));
      if (!o.startDate || !o.endDate || o.startDate === o.endDate || o.endDate < today) return { allowed: false, code: 'SUBSCRIPTION_EXPIRED' };
      if (o.plan === 'trial') return { allowed: false, code: 'TRIAL' };
      return { allowed: true, code: '' };
    } catch (e) { return { allowed: false, code: 'UNVERIFIED' }; }
  }
  function messageFor(code) { return code === 'SUBSCRIPTION_EXPIRED' ? EXPIRED_MSG : TRIAL_MSG; }
  function notify(msg) {
    var now = Date.now(); if (now - lastToastAt < 2500) return; lastToastAt = now;
    if (handler) { try { handler(msg); return; } catch (e) {} }
  }
  window.EkbDrive = { deviceId: deviceId, localState: localState, messageFor: messageFor, notify: notify,
    setNotifier: function (fn) { handler = fn; }, TRIAL_MESSAGE: TRIAL_MSG, EXPIRED_MESSAGE: EXPIRED_MSG };
})();
