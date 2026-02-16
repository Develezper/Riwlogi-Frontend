import { beforeEach } from "vitest";

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.location.hash = "#/";
  document.body.innerHTML = '<div id="toast-container"></div><main id="main"></main><nav id="navbar"></nav>';
});
