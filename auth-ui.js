// Injects logout button into navbar if user is authenticated
(function () {
  fetch("/api/auth/me")
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (!data.user) return;
      var cta = document.querySelector(".nav-cta");
      if (!cta) return;
      var btn = document.createElement("a");
      btn.href = "/api/auth/logout";
      btn.className = "btn-nav btn-nav-outline";
      btn.textContent = "Logout";
      btn.style.cssText = "margin-left:0.5rem;border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:0.5rem 1rem;color:#fff;text-decoration:none;font-size:0.875rem;";
      cta.appendChild(btn);

      // Also add to mobile menu
      var mobile = document.querySelector(".nav-mobile");
      if (mobile) {
        var mBtn = document.createElement("a");
        mBtn.href = "/api/auth/logout";
        mBtn.textContent = "Logout";
        mBtn.style.cssText = "margin-top:0.5rem;color:#f44;";
        mobile.appendChild(mBtn);
      }
    })
    .catch(function () { /* not logged in or error */ });
})();
