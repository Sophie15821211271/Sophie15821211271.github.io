(() => {
  if (window.blogVisitsInitialized) return;
  window.blogVisitsInitialized = true;

  const timeZone = "Asia/Shanghai";
  const dateKey = date => new Intl.DateTimeFormat("sv-SE", {timeZone}).format(date);
  let request;
  let session;

  function sessionId() {
    if (session) return session;
    try {
      session = sessionStorage.getItem("escape-velocity-visit") || crypto.randomUUID();
      sessionStorage.setItem("escape-velocity-visit", session);
    } catch {
      session ||= crypto.randomUUID();
    }
    return session;
  }

  function drawCalendar(today, counts) {
    const grid = document.querySelector("[data-calendar]");
    if (!grid) return;
    const [year, month, day] = today.split("-").map(Number);
    document.querySelector("[data-calendar-month]").textContent = `${year} 年 ${month} 月`;
    grid.replaceChildren();
    for (const label of "一二三四五六日") {
      const heading = document.createElement("span");
      heading.className = "visit-weekday";
      heading.textContent = label;
      grid.append(heading);
    }
    const offset = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
    for (let index = 0; index < offset; index++) grid.append(document.createElement("span"));
    const length = new Date(Date.UTC(year, month, 0)).getUTCDate();
    for (let date = 1; date <= length; date++) {
      const key = `${year}-${String(month).padStart(2,"0")}-${String(date).padStart(2,"0")}`;
      const count = counts?.[key] ?? 0;
      const cell = document.createElement("span");
      cell.textContent = date;
      cell.className = "visit-day";
      if (date <= day && counts) cell.dataset.level = Math.min(4, count ? 1 + Math.floor(Math.log2(count)) : 0);
      if (date === day) cell.setAttribute("aria-current", "date");
      cell.title = `${key} · ${date > day ? "未来日期" : counts ? count + " 次访问" : "暂无统计数据"}`;
      cell.setAttribute("aria-label", cell.title);
      grid.append(cell);
    }
  }

  async function update() {
    const today = dateKey(new Date());
    drawCalendar(today);
    const endpoint = document.body.dataset.visitsEndpoint;
    if (!endpoint || !/^https:\/\//i.test(endpoint) || !["http:","https:"].includes(location.protocol)) return;
    try {
      request ||= fetch(endpoint, {
        method: "POST", body: sessionId(), headers: {"Content-Type":"text/plain"}, cache:"no-store"
      }).then(response => {
        if (!response.ok) throw Error("统计请求失败");
        return response.json();
      }).catch(error => { request = undefined; throw error; });
      const data = await request;
      if (!Number.isSafeInteger(data.total) || !/^\d{4}-\d\d-\d\d$/.test(data.today)) throw Error("统计数据无效");
      drawCalendar(data.today, data.days);
      const total = document.querySelector("[data-visit-total]");
      const status = document.querySelector("[data-visit-status]");
      if (total) total.textContent = data.total.toLocaleString("zh-CN");
      if (status) status.textContent = "浅 → 深 · 当天访问量";
    } catch {
      const status = document.querySelector("[data-visit-status]");
      if (status) status.textContent = "暂时无法读取访客统计";
    }
  }

  document.addEventListener("astro:page-load", update);
  update();
})();
