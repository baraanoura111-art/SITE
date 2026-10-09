(function(){
  var WA = "971521325215";
  var $ = function(id){ return document.getElementById(id) || document.createElement("div"); };
  function num(v){ var n = parseFloat(String(v||"").replace(/[^0-9.]/g,"")); return isFinite(n) ? n : 0; }
  function aed(n){ return "AED " + Math.round(n).toLocaleString("en-US"); }
  function fmtInput(el){
    var n = num(el.value);
    el.value = n ? Math.round(n).toLocaleString("en-US") : "";
  }
  ["cPrice","cOrig"].forEach(function(id){
    $(id).addEventListener("blur", function(){ fmtInput(this); calc(); });
  });

  var lastMsg = "";
  function calc(){
    var price = num($("cPrice").value);
    var offplan = (document.querySelector('input[name="cType"]:checked') || {}).value === "offplan";
    $("offplanBox").hidden = !offplan;
    if (!price){ $("cResult").hidden = true; $("cEmpty").hidden = false; return; }
    $("cResult").hidden = false; $("cEmpty").hidden = true;

    var dld = price * 0.04;
    var admin = offplan ? 40 : 580, adminLbl = offplan ? "Oqood registration fee" : "Title deed fee";
    var trustee = offplan ? 5250 : 4200;
    var agency = price * 0.021;
    var fees = dld + admin + trustee + agency;

    $("rPrice").textContent = aed(price);
    $("rDld").textContent = aed(dld);
    $("rAdminLbl").textContent = adminLbl;
    $("rAdmin").textContent = aed(admin);
    $("rTrustee").textContent = aed(trustee);
    $("rAgency").textContent = aed(agency);
    $("rFees").textContent = aed(fees);
    $("rTotal").textContent = aed(price + fees);

    var lines = ["Property: " + (offplan ? "Off-plan resale" : "Ready"), "Purchase price: " + aed(price), "DLD transfer fee (4%): " + aed(dld), adminLbl + ": " + aed(admin),
      "Trustee office fee: " + aed(trustee), "Agency fee (2% + VAT): " + aed(agency),
      "Total fees: " + aed(fees), "Total cost: " + aed(price + fees)];

    var orig = num($("cOrig").value), paid = num($("cPaid").value), warn = "";
    var showSettle = offplan && orig > 0 && $("cPaid").value.trim() !== "";
    if (showSettle){
      if (paid > 100){ warn = "Amount paid can't be more than 100%."; showSettle = false; }
      else {
        var remaining = orig * (1 - paid/100);
        var seller = price - remaining;
        if (seller < 0){ warn = "The remaining developer balance is higher than the purchase price. Check the figures."; showSettle = false; }
        else {
          $("rSeller").textContent = aed(seller);
          $("rDev").textContent = aed(remaining);
          $("rCash").textContent = aed(seller + fees);
          lines.push("", "Settlement at transfer", "Due to seller: " + aed(seller), "Remaining to developer: " + aed(remaining), "Cash needed at transfer: " + aed(seller + fees));
        }
      }
    }
    $("settle").hidden = !showSettle;
    $("cWarn").hidden = !warn; $("cWarn").textContent = warn;

    lastMsg = "Hi Baraa, here's the purchase breakdown I calculated on your site:\n" + lines.join("\n");
  }
  document.querySelectorAll("#fees input").forEach(function(el){ el.addEventListener("input", calc); el.addEventListener("change", calc); });
  calc();


  // menu
  var menu = $("menu"), mbtn = $("menuBtn");
  function setMenu(open){
    menu.hidden = !open; mbtn.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
    mbtn.querySelector(".menu-lbl").textContent = open ? "Close" : "Menu";
    if (open) menu.querySelector("a").focus();
  }
  mbtn.addEventListener("click", function(){ setMenu(menu.hidden); });
  menu.addEventListener("click", function(e){ if (e.target.closest("a") || e.target === menu) setMenu(false); });
  menu.addEventListener("keydown", function(e){ if (e.key === "Escape"){ setMenu(false); mbtn.focus(); } });


  // scroll spy for section links
  var spyObs = null;
  function spy(pg){
    if (spyObs) spyObs.disconnect();
    var links = $("subnav").querySelectorAll("a");
    if (!pg.sub || !("IntersectionObserver" in window)) return;
    function setActive(id){
      links.forEach(function(a){
        var on = a.getAttribute("href") === "#" + id;
        a.classList.toggle("on", on);
        if (on){ a.setAttribute("aria-current", "true"); var sn = $("subnav"); sn.scrollTo({left: Math.max(0, a.offsetLeft - sn.offsetLeft - 12), behavior: "smooth"}); }
        else a.removeAttribute("aria-current");
      });
    }
    setActive(pg.s[0]);
    spyObs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if (e.isIntersecting) setActive(e.target.id); });
    }, {rootMargin: "-30% 0px -60% 0px"});
    pg.s.forEach(function(id){ var el = document.getElementById(id); if (el) spyObs.observe(el); });
  }

  // hide header on scroll down, show on scroll up
  var lastY = 0, ticking = false;
  window.addEventListener("scroll", function(){
    if (ticking) return; ticking = true;
    requestAnimationFrame(function(){
      var y = window.scrollY;
      if (!menu.hidden) { ticking = false; return; }
      document.body.classList.toggle("hdr-hide", y > 140 && y > lastY + 4);
      if (y < lastY - 4 || y < 140) document.body.classList.remove("hdr-hide");
      lastY = y; ticking = false;
    });
  }, {passive: true});


  // unit finder: filters -> inquiry (no public table)
  (function(){
    var D = window.OASIS_UNITS, U = D.u;
    var selC = $("ufC"), selS = $("ufS");
    var o = document.createElement("option"); o.value = ""; o.textContent = "All clusters"; selC.appendChild(o);
    [["0,1,2,3","Palmiera (all phases)"],["6,7","Marèva (both phases)"]].forEach(function(g){ var x = document.createElement("option"); x.value = g[0]; x.textContent = g[1]; selC.appendChild(x); });
    D.c.forEach(function(n, i){ var x = document.createElement("option"); x.value = i; x.textContent = n; selC.appendChild(x); });
    function inC(c, v){ c = c == null ? "" : String(c); return c === "" || c.split(",").indexOf(String(v)) > -1; }
    function cName(c){ var o = selC.querySelector('option[value="' + c + '"]'); return o ? o.textContent : ""; }
    function fillStyles(){
      var c = selC.value, cur = selS.value, set = {};
      U.forEach(function(r){ if (inC(c, r[0])) set[r[4]] = 1; });
      selS.innerHTML = '<option value="">Any</option>';
      Object.keys(set).sort(function(a,b){return a-b;}).forEach(function(i){ var x = document.createElement("option"); x.value = i; x.textContent = D.s[i]; selS.appendChild(x); });
      if (set[cur]) selS.value = cur;
    }
    function f(n){ return n ? n.toLocaleString("en-US") : "–"; }
    function crit(){
      var c = [];
      if (selC.value !== "") c.push("Cluster: " + cName(selC.value));
      if ($("ufB").value) c.push("Bedrooms: " + $("ufB").value);
      if (selS.value !== "") c.push("Style: " + D.s[selS.value]);
      if ($("ufBs").value !== "") c.push("Basement: " + ($("ufBs").value === "1" ? "with" : "without"));
      if ($("ufF").value) c.push("Floors: " + $("ufF").value);
      if (num($("ufP").value)) c.push("Minimum plot: " + f(num($("ufP").value)) + " sq ft");
      if ($("ufPos").value) c.push("Position: " + $("ufPos").value);
      if ($("ufV").value) c.push("View: " + $("ufV").value);
      var dr = [].slice.call(document.querySelectorAll('input[name="ufDir"]:checked')).map(function(x){ return x.value; });
      if (dr.length) c.push("Compass: " + dr.join(", "));
      return c;
    }
    function sendInq(){
      var u = need("ufName","ufPhone","ufHint"); if (!u) return;
      var c = crit();
      saveLead("Villa Finder inquiry", u.name, u.phone, c.length ? c.join("; ") : "No filters (open search)");
      wa("Hi Baraa, I used the Oasis Villa Finder on your site.\n\nName: " + u.name + "\nPhone: " + u.phone + "\n\n" + (c.length ? "My requirements:\n" + c.map(function(x){ return "• " + x; }).join("\n") : "My requirements: open search, no filters") + "\n\nPlease send me the available units for sale matching this.");
    }
    $("ufSend").addEventListener("click", sendInq);
    $("ufP").addEventListener("blur", function(){ fmtInput(this); });
    selC.addEventListener("change", fillStyles);
    fillStyles();
    // public helpers for quick search and cluster pages
    window.ufApply = function(f){
      selC.value = f.c || ""; fillStyles();
      $("ufB").value = f.b || ""; selS.value = f.s || ""; $("ufBs").value = ""; $("ufF").value = ""; $("ufP").value = "";
      $("ufPos").value = ""; $("ufV").value = ""; [].forEach.call(document.querySelectorAll('input[name="ufDir"]'), function(x){ x.checked = false; });
    };
    window.ufCount = function(f){
      return U.filter(function(u){ return inC(f.c || "", u[0]) && (!f.b || u[2] == f.b) && (!f.s || u[4] == f.s); }).length;
    };
  })();

  // quick "Find your villa" (home)
  (function(){
    var bed = "", chips = document.querySelectorAll("#qf .qf-chip");
    function f(){ return {b: bed, c: $("qfC").value, s: $("qfS").value}; }
    function upd(){ var n = window.ufCount(f()); $("qfCount").textContent = n ? n.toLocaleString("en-US") + (n === 1 ? " villa matches" : " villas match") : "No villas match. Try another combination."; $("qfGo").disabled = !n; }
    chips.forEach(function(ch){ ch.addEventListener("click", function(){
      bed = bed === ch.getAttribute("data-b") ? "" : ch.getAttribute("data-b");
      chips.forEach(function(x){ x.setAttribute("aria-pressed", x.getAttribute("data-b") === bed ? "true" : "false"); }); upd(); }); });
    $("qfC").addEventListener("change", upd); $("qfS").addEventListener("change", upd);
    $("qfGo").addEventListener("click", function(){ if (document.getElementById("finder")){ window.ufApply(f()); location.hash = "finder"; } else { try { sessionStorage.setItem("ufPending", JSON.stringify(f())); } catch(e){} location.href = "/tools/villa-finder/"; } });
    upd();
  })();



  // ===== PDF reports (dark theme, Jost, logo) =====
// Shared PDF builder for The Oasis Specialist (browser + node)
function OasisPDF(jsPDF, A, spec){
  var J = new jsPDF({unit:"pt", format:"a4"}), W = 595.28, H = 841.89, M = 56;
  J.addFileToVFS("Jost-Light.ttf", A.light); J.addFont("Jost-Light.ttf", "Jost", "light");
  J.addFileToVFS("Jost-Regular.ttf", A.regular); J.addFont("Jost-Regular.ttf", "Jost", "normal");
  J.addFileToVFS("Jost-Medium.ttf", A.medium); J.addFont("Jost-Medium.ttf", "Jost", "medium");
  var light = spec.theme === "light";
  var BG=light?[255,255,255]:[13,12,11], PANEL=light?[244,242,238]:[22,20,18], INK=light?[22,19,15]:[239,231,219], MUTED=light?[107,98,88]:[184,174,159], LINE=light?[227,221,211]:[46,40,34], SAGE=light?[47,75,63]:[175,194,171], SAGE2=light?[47,75,63]:[195,207,190];
  function col(c){ J.setTextColor(c[0],c[1],c[2]); }
  function f(w, s){ J.setFont("Jost", w); J.setFontSize(s); }
  function spaced(t, x, y, sp, align){ J.setCharSpace(sp); J.text(t, x, y, {align: align || "left"}); J.setCharSpace(0); }
  // page
  J.setFillColor(BG[0],BG[1],BG[2]); J.rect(0,0,W,H,"F");
  // logo
  var lw = 150, lh = lw * A.logoRatio; J.addImage(light ? A.logoDark : A.logo, "PNG", (W-lw)/2, 44, lw, lh);
  var y = 44 + lh + 30;
  // wave divider
  J.setDrawColor(SAGE[0],SAGE[1],SAGE[2]); J.setLineWidth(0.8);
  var cx = W/2; J.lines([[14,-5,26,5,40,0],[14,-5,26,5,40,0]], cx-40, y, [1,1], "S");
  y += 30;
  f("light", 24); col(INK); J.text(spec.title, W/2, y, {align:"center"}); y += 20;
  f("normal", 9.5); col(MUTED); spaced(spec.subtitle.toUpperCase(), W/2, y, 1.4, "center"); y += 26;
  if (spec.client){ f("normal", 10); col(MUTED); J.text("Prepared for " + spec.client, W/2, y, {align:"center"}); y += 26; }
  // highlight boxes
  if (spec.highlights){
    var n = spec.highlights.length, gap = 12, bw = (W - 2*M - gap*(n-1)) / n, bh = 74;
    spec.highlights.forEach(function(h, i){
      var x = M + i*(bw+gap);
      J.setFillColor(PANEL[0],PANEL[1],PANEL[2]); J.rect(x, y, bw, bh, "F");
      J.setDrawColor(SAGE[0],SAGE[1],SAGE[2]); J.setLineWidth(1); J.line(x, y, x+bw, y);
      f("light", 26); col(SAGE); J.text(h[1], x+bw/2, y+40, {align:"center"});
      f("normal", 8.5); col(MUTED); spaced(h[0].toUpperCase(), x+bw/2, y+58, 1.2, "center");
    });
    y += bh + 22;
  }
  // sections
  spec.sections.forEach(function(sec){
    y += 8; f("medium", 8.5); col(SAGE); spaced(sec.heading.toUpperCase(), M, y, 1.6); y += 8;
    J.setDrawColor(SAGE[0],SAGE[1],SAGE[2]); J.setLineWidth(0.6); J.line(M, y, W-M, y); y += 20;
    sec.rows.forEach(function(r){
      var kind = r[2] || "";
      if (kind === "grand"){ f("light", 15); col(INK); J.text(r[0], M, y); f("normal", 15); col(SAGE2); J.text(r[1], W-M, y, {align:"right"}); y += 10; }
      else if (kind === "total"){ f("medium", 11); col(INK); J.text(r[0], M, y); J.text(r[1], W-M, y, {align:"right"}); y += 9; }
      else { f("light", 11); col(INK); J.text(r[0], M, y); f("normal", 11); J.text(r[1], W-M, y, {align:"right"}); y += 9; }
      J.setDrawColor(LINE[0],LINE[1],LINE[2]); J.setLineWidth(0.5); J.line(M, y, W-M, y); y += 19;
    });
    y += 6;
  });
  // disclaimer
  f("light", 8.5); col(MUTED); J.text(J.splitTextToSize(spec.disclaimer, W-2*M), M, y + 4);
  // footer
  var fy = H - 70;
  J.setDrawColor(LINE[0],LINE[1],LINE[2]); J.setLineWidth(0.6); J.line(M, fy, W-M, fy);
  f("normal", 10); col(INK); J.text("Baraa Noura  ·  The Oasis Specialist", W/2, fy + 22, {align:"center"});
  f("light", 9); col(MUTED); J.text("AX CAPITAL Real Estate  ·  BRN 70439", W/2, fy + 36, {align:"center"});
  col(SAGE2); J.text("+971 52 132 52 15   ·   oasis@baraanoura.com   ·   @baraa.oasis", W/2, fy + 50, {align:"center"});
  return J;
}


  // PDF engine + fonts are embedded in the page (no extra files to host)
  function pdfReady(){
    return new Promise(function(res, rej){
      try {
        var fonts = window.OASIS_PDF_ASSETS ? Promise.resolve() : fetch("/assets/pdf-assets.json").then(function(r){ return r.json(); }).then(function(j){ window.OASIS_PDF_ASSETS = j; });
        var engine = window.jspdf ? Promise.resolve() : new Promise(function(ok, no){
          var s = document.createElement("script"); s.src = "/assets/jspdf.umd.min.js";
          s.onload = function(){ window.jspdf ? ok() : no(new Error("PDF engine failed")); };
          s.onerror = function(){ no(new Error("PDF engine failed to load")); };
          document.head.appendChild(s);
        });
        Promise.all([fonts, engine]).then(function(){ res(); }, rej);
      } catch (e) { rej(e); }
    });
  }
  function today(){ return new Date().toLocaleDateString("en-GB", {day:"numeric", month:"long", year:"numeric"}); }
  function pdfFlow(p, make, fileBase){
    $(p + "Btn").addEventListener("click", function(){
      var u = need(p + "Name", p + "Phone", p + "Hint"); if (!u) return;
      saveLead(p === "pdf" ? "Purchase fee calculator PDF" : "Rental yield estimator PDF", u.name, u.phone,
        p === "pdf" ? "Purchase price: AED " + ($("cPrice").value || "–") : "Price: AED " + ($("yPrice").value || "–") + "; Annual rent: AED " + ($("yRent").value || "–"));
      var btn = $(p + "Btn"); btn.disabled = true; $(p + "Hint").textContent = "Preparing your PDF…";
      pdfReady().then(function(){
        var J = make(u); if (!J){ btn.disabled = false; return; }
        J.save(fileBase + " - " + u.name + ".pdf");
        $(p + "Hint").textContent = "Downloaded. Check your downloads folder.";
      }).catch(function(e){ if (window.console) console.error(e); $(p + "Hint").textContent = "Sorry, the PDF couldn't be created on this device. Please try another browser, or message me and I'll send it."; })
        .then(function(){ btn.disabled = false; });
    });
  }
  // purchase fees
  pdfFlow("pdf", function(u){
    if ($("cResult").hidden){ $("pdfHint").textContent = "Enter a purchase price first."; return null; }
    var offplan = (document.querySelector('input[name="cType"]:checked') || {}).value === "offplan";
    var secs = [{heading: "Fees", rows: []}], cur = secs[0];
    document.querySelectorAll("#cResult table.bd tbody").forEach(function(tb){
      if (tb.hidden) return;
      tb.querySelectorAll("tr").forEach(function(tr){
        var td = tr.querySelectorAll("td");
        if (tr.classList.contains("sub")){ var h = td[0].textContent.trim(); if (h.toLowerCase() !== "fees"){ cur = {heading: h, rows: []}; secs.push(cur); } return; }
        cur.rows.push([td[0].textContent, td[1].textContent, tr.classList.contains("grand") ? "grand" : tr.classList.contains("tot") ? "total" : ""]);
      });
    });
    return OasisPDF(window.jspdf.jsPDF, window.OASIS_PDF_ASSETS, {title: "Purchase cost breakdown",
      subtitle: "The Oasis by Emaar · " + (offplan ? "Off-plan resale" : "Ready villa") + " · " + today(), client: u.name + "  ·  " + u.phone, sections: secs,
      disclaimer: "Indicative figures. Agency and trustee fees shown VAT-inclusive. Exact amounts are confirmed per unit. Mortgage buyers pay additional registration and bank fees."});
  }, "Oasis purchase breakdown");
  // rental yield
  pdfFlow("ypdf", function(u){
    if ($("yResult").hidden){ $("ypdfHint").textContent = "Enter the price and expected rent first."; return null; }
    var rate = $("ySc").value.trim(), bua = $("yBua").value.trim(), mg = $("yMgmt").value.trim() || "0";
    var scLabel = "Service charges" + (rate && bua ? " (AED " + rate + " × " + bua + " sq ft)" : "");
    return OasisPDF(window.jspdf.jsPDF, window.OASIS_PDF_ASSETS, {title: "Rental yield estimate",
      subtitle: "The Oasis by Emaar · " + today(), client: u.name + "  ·  " + u.phone,
      highlights: [["Gross yield", $("yGross").textContent], ["Net yield", $("yNet").textContent]],
      sections: [
        {heading: "Income", rows: [["Expected annual rent", $("rRent").textContent], [scLabel, $("rSc").textContent], ["Property management (" + mg + "%)", $("rMgmt").textContent], ["Net annual income", $("rNetInc").textContent, "total"]]},
        {heading: "Investment", rows: [["Purchase price", $("rYPrice").textContent], ["Purchase fees (ready villa)", $("rYFees").textContent], ["Total investment", $("rYTotal").textContent, "grand"]]}],
      disclaimer: "Gross yield is annual rent over purchase price. Net yield deducts service charges and management, and divides by price plus purchase fees. Rents vary by cluster, size and finish. Indicative figures only."});
  }, "Oasis rental yield estimate");

  // villa finder: discourage copying the table
  (function(){
    var t = $("ufTbl"); if (!t) return;
    ["copy","cut","contextmenu","dragstart","selectstart"].forEach(function(ev){ t.addEventListener(ev, function(e){ e.preventDefault(); }); });
    document.addEventListener("copy", function(e){
      var s = window.getSelection(); if (s && s.rangeCount && t.contains(s.getRangeAt(0).commonAncestorContainer) || (s && s.containsNode && s.containsNode(t, true))){ e.preventDefault(); if (e.clipboardData) e.clipboardData.setData("text/plain", ""); }
    });
  })();


  // home film: sound toggle
  (function(){
    var v = document.querySelector("#heroVideo video"), btn = document.getElementById("hvSound");
    if (!v || !btn) return;
    btn.addEventListener("click", function(){
      v.muted = !v.muted; if (!v.muted) v.play();
      btn.setAttribute("aria-pressed", v.muted ? "false" : "true");
      btn.querySelector("span").textContent = v.muted ? "Sound on" : "Sound off";
    });
  })();

  // floor plans
  var FP = [
    {id:"p1", name:"Palmiera 1", bua:"5,843–8,689", note:"265 villas", types:[["4","Chamfered"],["4","Classical"],["4","Contemporary"],["5","Chamfered"],["5","Classical Type 1"],["5","Classical Type 2"],["5","Contemporary"]]},
    {id:"p2", name:"Palmiera 2", bua:"5,627–5,872", note:"56 villas", types:[["4","Chamfered",20],["4","Classical",18],["4","Contemporary",18]]},
    {id:"p3", name:"Palmiera 3", bua:"5,666–5,914", note:"59 villas", types:[["4","Chamfered",16],["4","Classical",20],["4","Contemporary",23]]},
    {id:"pc", name:"Palmiera Collective", bua:"7,879–8,099", note:"38 villas, all with basement", types:[["4","Chamfered",12],["4","Classical",13],["4","Contemporary",13]]},
    {id:"mi", name:"Mirage", bua:"10,225–12,967", note:"204 villas, all with basement", types:[["5","Chamfered",43],["5","Classical",36],["5","Contemporary",44],["6","Chamfered",40],["6","Contemporary",41]]},
    {id:"la", name:"Lavita", bua:"19,012–29,915", note:"49 mansions", types:[["6","Naya",16],["6","Faya",14],["7","Ayanna",10],["7","Aman",9]]},
    {id:"ma", name:"Marèva 1 & 2", bua:"7,254–12,986", note:"658 villas", types:[["4","Chamfered",133],["4","Classical",95],["4","Contemporary",105],["5","Chamfered",69],["5","Classical",46],["5","Contemporary",73],["6","Chamfered",69],["6","Contemporary",68]]},
    {id:"ti", name:"Address Villas – Tierra", bua:"7,269–12,959", note:"487 villas", types:[["4","Chamfered",70],["4","Classical",53],["4","Contemporary",55],["5","Chamfered",122],["5","Classical",38],["5","Contemporary",100],["6","Chamfered",24],["6","Contemporary",25]]},
    {id:"os", name:"Palace Villas – Ostra", bua:"7,269–12,959", note:"526 villas", types:[["4","Chamfered",78],["4","Classical",60],["4","Contemporary",75],["5","Chamfered",114],["5","Classical",37],["5","Contemporary",100],["6","Chamfered",29],["6","Contemporary",33]]}
  ];
  // floor plans: cluster -> bedrooms -> style, then download
  (function(){
    var P = window.OASIS_FLOORPLANS || [], sc = $("fpC"), sb = $("fpB"), ss = $("fpS"), dl = $("fpDl");
    if (!sc || !P.length) return;
    function opts(sel, list){ var cur = sel.value; sel.innerHTML = ""; list.forEach(function(o){ var x = document.createElement("option"); x.value = o[0]; x.textContent = o[1]; sel.appendChild(x); }); if (list.some(function(o){ return String(o[0]) === cur; })) sel.value = cur; }
    function uniq(a){ return a.filter(function(v, i){ return a.indexOf(v) === i; }); }
    opts(sc, uniq(P.map(function(p){ return p.c; })).map(function(c){ return [c, c]; }));
    function beds(){ opts(sb, uniq(P.filter(function(p){ return p.c === sc.value; }).map(function(p){ return p.b; })).map(function(b){ return [b, b + " bedrooms"]; })); styles(); }
    function styles(){ opts(ss, P.filter(function(p){ return p.c === sc.value && String(p.b) === sb.value; }).map(function(p){ return [p.s, p.s]; })); show(); }
    function show(){
      var p = P.filter(function(p){ return p.c === sc.value && String(p.b) === sb.value && p.s === ss.value; })[0]; if (!p) return;
      $("fpName").textContent = p.c + " · " + p.b + " BR · " + p.s;
      dl.href = p.f; dl.setAttribute("download", "The Oasis - " + p.c + " " + p.b + "BR " + p.s.replace(" · ", " ") + " - floor plan.pdf");
      dl.removeAttribute("target"); dl.textContent = "Download Floor Plan";
      $("fpNote").innerHTML = "";
      var a = document.createElement("a"); a.target = "_blank"; a.rel = "noopener";
      a.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent("Hi Baraa, I downloaded the floor plan for " + p.c + ", " + p.b + " BR " + p.s + ". Which units of this type are available?");
      a.textContent = "Ask which units of this type are available"; $("fpNote").appendChild(a);
    }
    sc.addEventListener("change", beds); sb.addEventListener("change", styles); ss.addEventListener("change", show);
    beds();
  })();



  // reuse already-embedded photos in the gallery (no extra file size)
  document.querySelectorAll("img[data-from]").forEach(function(im){
    var src = document.querySelector('img[alt="' + im.getAttribute("data-from") + '"]:not([data-from])');
    if (src) im.src = src.getAttribute("src");
  });

  // carousels (gallery + clusters)
  document.querySelectorAll(".car").forEach(function(car){
    var track = car.querySelector(".car-track"), sl = track.querySelectorAll(".slide"), cnt = car.querySelector(".car-count"), cur = 0, st;
    if (sl.length < 2) return;
    function go(k){ sl = track.querySelectorAll(".slide"); k = (k + sl.length) % sl.length; track.scrollTo({left: sl[k].offsetLeft - track.offsetLeft, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"}); }
    car.querySelectorAll(".car-btn").forEach(function(btn){ btn.addEventListener("click", function(){ go(cur + parseInt(btn.getAttribute("data-dir"), 10)); }); });
    track.addEventListener("keydown", function(e){ if (e.key === "ArrowRight"){ e.preventDefault(); go(cur + 1); } if (e.key === "ArrowLeft"){ e.preventDefault(); go(cur - 1); } });
    window.addEventListener("load", function(){ sl = track.querySelectorAll(".slide"); if (cnt) cnt.textContent = "1 / " + sl.length; });
    track.addEventListener("scroll", function(){ clearTimeout(st); st = setTimeout(function(){
      sl = track.querySelectorAll(".slide");
      cur = Math.max(0, Math.min(sl.length - 1, Math.round(track.scrollLeft / sl[0].offsetWidth)));
      if (cnt) cnt.textContent = (cur + 1) + " / " + sl.length; }, 60); });
  });

  // shared lead helpers
  function wa(msg){ window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(msg), "_blank", "noopener"); }
  function need(nameId, phoneId, hintId){
    var n = $(nameId).value.trim(), p = $(phoneId).value.trim();
    if (!n){ $(hintId).textContent = "Add your name to continue."; $(nameId).focus(); return null; }
    if (p.replace(/\D/g,"").length < 7){ $(hintId).textContent = "Add a phone number so I can reach you."; $(phoneId).focus(); return null; }
    $(hintId).textContent = ""; return {name:n, phone:p};
  }
  // record every name/phone entry in the Google Sheet (Leads tab)
  function saveLead(source, name, phone, details){
    try {
      if (!window.LEADS_ENDPOINT) return;
      var body = new URLSearchParams({type: "lead", source: source, name: name || "", phone: phone || "", details: details || "", page: location.pathname + location.hash});
      fetch(window.LEADS_ENDPOINT, {method: "POST", body: body, mode: "no-cors", keepalive: true}).catch(function(){});
    } catch (e) {}
  }
  window.saveLead = saveLead;

  // fact sheet: save lead to Google Sheet, then download the PDF
  var FS_PDF = "/factsheet/The-Oasis-Fact-Sheet-2026.pdf";
  $("fsForm").addEventListener("submit", function(e){
    e.preventDefault();
    var u = need("fsName","fsPhone","fsHint"); if (!u) return;
    saveLead("Buyer Guide download", u.name, u.phone, "");
    var a = document.createElement("a"); a.href = FS_PDF; a.download = "The-Oasis-Buyer-Guide-2026.pdf";
    document.body.appendChild(a); a.click(); a.remove();
    $("fsHint").innerHTML = 'Thanks, ' + u.name.replace(/[<>&"]/g, "") + '. Your Buyer Guide is downloading. If it doesn\u2019t start, <a href="' + FS_PDF + '" download>tap here</a>.';
  });

  // valoria waitlist
  if ($("wlForm")) $("wlForm").addEventListener("submit", function(e){
    e.preventDefault();
    var u = need("wlName","wlPhone","wlHint"); if (!u) return;
    saveLead("Valoria waitlist", u.name, u.phone, "Bedrooms: " + $("wlBeds").value + "; Budget: AED " + $("wlBudget").value + "; Buying as: " + $("wlType").value);
    wa("Hi Baraa, please add me to the Valoria waitlist.\nName: " + u.name + "\nPhone: " + u.phone +
      "\nBedrooms: " + $("wlBeds").value + "\nBudget: AED " + $("wlBudget").value + "\nBuying as: " + $("wlType").value);
    $("wlHint").textContent = "Opening WhatsApp. Send the message to confirm your place.";
  });

  // sell your villa
  $("sellForm").addEventListener("submit", function(e){
    e.preventDefault();
    var u = need("sName","sPhone","sHint"); if (!u) return;
    if (!$("sUnit").value.trim()){ $("sHint").textContent = "Add your unit number so I can pull comparable sales."; $("sUnit").focus(); return; }
    var lines = ["Hi Baraa, I'd like a valuation for my villa.", "Name: " + u.name, "Phone: " + u.phone,
      "Cluster: " + $("sCluster").value, "Type: " + $("sBeds").value + " " + $("sStyle").value];
    lines.push("Unit: " + $("sUnit").value.trim());
    if ($("sPaid").value.trim()) lines.push("Paid to developer: " + $("sPaid").value.trim() + "%");
    if ($("sAsk").value.trim()) lines.push("Price in mind: AED " + $("sAsk").value.trim());
    saveLead("Sell with me valuation", u.name, u.phone, lines.slice(3).join("; "));
    wa(lines.join("\n"));
    $("sHint").textContent = "Opening WhatsApp. Send the message and I'll prepare your valuation.";
  });

  // rental yield
  ["yPrice","yRent","yBua"].forEach(function(id){ $(id).addEventListener("blur", function(){ fmtInput(this); ycalc(); }); });
  function pct(n){ return (Math.round(n * 100) / 100).toFixed(2) + "%"; }
  function ycalc(){
    var price = num($("yPrice").value), rent = num($("yRent").value);
    if (!price || !rent){ $("yResult").hidden = true; $("yEmpty").hidden = false; return; }
    $("yResult").hidden = false; $("yEmpty").hidden = true;
    var sc = num($("ySc").value) * num($("yBua").value), mg = rent * num($("yMgmt").value) / 100;
    var netInc = rent - sc - mg, fees = price * 0.04 + 580 + 4200 + price * 0.021, total = price + fees;
    $("yGross").textContent = pct(rent / price * 100);
    $("yNet").textContent = pct(netInc / total * 100);
    $("rRent").textContent = aed(rent); $("rSc").textContent = sc ? "− " + aed(sc) : "Not entered";
    $("rMgmt").textContent = mg ? "− " + aed(mg) : "AED 0";
    $("rNetInc").textContent = aed(netInc); $("rYPrice").textContent = aed(price);
    $("rYFees").textContent = aed(fees); $("rYTotal").textContent = aed(total);
    $("yShare").href = "https://wa.me/" + WA + "?text=" + encodeURIComponent("Hi Baraa, I ran the yield estimator on your site:\nPrice: " + aed(price) + "\nAnnual rent: " + aed(rent) + "\nGross yield: " + $("yGross").textContent + "\nNet yield: " + $("yNet").textContent + "\nCan we discuss?");
  }
  document.querySelectorAll("#yield input").forEach(function(el){ el.addEventListener("input", ycalc); });
  ycalc();


  // mortgage calculator
  (function(){
    if (!$("mPrice")) return;
    var downTouched = false;
    ["mPrice"].forEach(function(id){ $(id).addEventListener("blur", function(){ fmtInput(this); mcalc(); }); });
    $("mDown").addEventListener("input", function(){ downTouched = this.value.trim() !== ""; });
    function minDown(price){ return price > 5000000 ? 30 : 20; }
    function mcalc(){
      var price = num($("mPrice").value);
      if (!price){ $("mResult").hidden = true; $("mEmpty").hidden = false; return; }
      $("mResult").hidden = false; $("mEmpty").hidden = true;
      var min = minDown(price);
      var down = downTouched ? num($("mDown").value) : min;
      if (!downTouched) $("mDown").placeholder = "Minimum " + min + "%";
      if (down < 0) down = 0; if (down > 100) down = 100;
      var loan = price * (1 - down / 100), r = num($("mRate").value) / 100 / 12, n = parseInt($("mTerm").value, 10) * 12;
      var pay = loan ? (r ? loan * r / (1 - Math.pow(1 + r, -n)) : loan / n) : 0;
      var interest = pay * n - loan;
      var dld = price * 0.04, reg = loan ? loan * 0.0025 + 290 : 0, arr = loan * 0.01 * 1.05, val = loan ? 3500 : 0, tr = 4200, ag = price * 0.021;
      var cash = price * down / 100 + dld + reg + arr + val + tr + ag;
      $("mMonthly").textContent = aed(pay); $("mCash").textContent = aed(cash);
      $("mrPrice").textContent = aed(price); $("mrDownLbl").textContent = "Down payment (" + (Math.round(down * 10) / 10) + "%)";
      $("mrDown").textContent = aed(price * down / 100); $("mrLoan").textContent = aed(loan); $("mrInt").textContent = aed(interest);
      $("mrDld").textContent = aed(dld); $("mrReg").textContent = aed(reg); $("mrArr").textContent = aed(arr); $("mrVal").textContent = aed(val);
      $("mrTr").textContent = aed(tr); $("mrAg").textContent = aed(ag); $("mrCash").textContent = aed(cash);
      $("mShare").href = "https://wa.me/" + WA + "?text=" + encodeURIComponent("Hi Baraa, I used the mortgage calculator on your site:\nPrice: " + aed(price) + "\nDown payment: " + (Math.round(down * 10) / 10) + "%\nLoan: " + aed(loan) + " over " + $("mTerm").value + " years\nMonthly repayment: " + aed(pay) + "\nCan you help me get pre-approved?");
    }
    document.querySelectorAll("#mortgage input, #mortgage select").forEach(function(el){ el.addEventListener("input", mcalc); el.addEventListener("change", mcalc); });
    mcalc();
  })();


  // swipeable cluster cards
  document.querySelectorAll(".cc-grid").forEach(function(g){
    var cards = g.querySelectorAll(".cc"); if (!cards.length) return;
    var ctl = document.createElement("div"); ctl.className = "cc-ctl";
    ctl.innerHTML = '<button type="button" class="car-btn" aria-label="Previous clusters"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor" stroke-width="1.3"/></svg></button><div class="cc-dots"></div><button type="button" class="car-btn" aria-label="Next clusters"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5 L16 12 L9 19" fill="none" stroke="currentColor" stroke-width="1.3"/></svg></button>';
    g.after(ctl);
    var dots = ctl.querySelector(".cc-dots"), btns = ctl.querySelectorAll(".car-btn");
    cards.forEach(function(c, i){
      var d = document.createElement("button"); d.type = "button";
      d.setAttribute("aria-label", "Show " + c.querySelector(".cc-name").textContent);
      d.addEventListener("click", function(){ go(i); }); dots.appendChild(d);
    });
    function step(){ return cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : g.clientWidth; }
    function cur(){ return Math.round(g.scrollLeft / step()); }
    function go(i){ i = Math.max(0, Math.min(cards.length - 1, i)); g.scrollTo({left: i * step(), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"}); }
    function upd(){
      var k = cur(), max = g.scrollWidth - g.clientWidth - 2;
      dots.querySelectorAll("button").forEach(function(d, i){ d.setAttribute("aria-current", i === k ? "true" : "false"); });
      btns[0].disabled = g.scrollLeft < 2; btns[1].disabled = g.scrollLeft >= max;
    }
    btns[0].addEventListener("click", function(){ go(cur() - 1); });
    btns[1].addEventListener("click", function(){ go(cur() + 1); });
    var t; g.addEventListener("scroll", function(){ clearTimeout(t); t = setTimeout(upd, 60); }, {passive: true});
    window.addEventListener("resize", upd); window.addEventListener("hashchange", function(){ setTimeout(upd, 50); });
    upd();
  });

  // cluster detail tabs: Overview | Villas
  (function(){
    var FPmap = {}; FP.forEach(function(c){ FPmap[c.id] = c; });
    document.querySelectorAll("#clusters .cl").forEach(function(art, n){
      var info = art.querySelector(".cl-media").nextElementSibling;
      var kv = info.querySelector(".kv"), tbl = info.querySelector(".tbl");
      var name = art.getAttribute("data-name"), uf = art.getAttribute("data-uf");
      var bar = document.createElement("div"); bar.className = "cl-tabs"; bar.setAttribute("role", "tablist"); bar.setAttribute("aria-label", name + " details");
      var pOv = document.createElement("div"), pV = document.createElement("div");
      [pOv, pV].forEach(function(p){ p.className = "cl-panel"; p.setAttribute("role", "tabpanel"); });
      kv.parentNode.insertBefore(bar, kv); bar.after(pOv); pOv.appendChild(kv); if (tbl) pOv.appendChild(tbl);
      pOv.after(pV);
      var cnt = window.ufCount({c: uf});
      pV.innerHTML = '<p class="cl-v-n"></p><p class="cl-v-t">Tell me what you\'re looking for in ' + name + ' and I\'ll send you the available units.</p><button type="button" class="btn btn-solid">Open the Oasis Villa Finder</button>';
      pV.querySelector(".cl-v-n").textContent = cnt.toLocaleString("en-US") + " villas";
      pV.querySelector("button").addEventListener("click", function(){ if (document.getElementById("finder")){ window.ufApply({c: uf}); location.hash = "finder"; } else { try { sessionStorage.setItem("ufPending", JSON.stringify({c: uf})); } catch(e){} location.href = "/tools/villa-finder/"; } });
      var tabs = [["Overview", pOv], ["Villas", pV]];
      function show(k){ tabs.forEach(function(t, i){ t[2].setAttribute("aria-selected", i === k ? "true" : "false"); t[2].tabIndex = i === k ? 0 : -1; t[1].hidden = i !== k; }); }
      tabs.forEach(function(t, i){
        var btn = document.createElement("button"); btn.type = "button"; btn.className = "tab"; btn.setAttribute("role", "tab");
        btn.id = art.id + "-t" + i; t[1].setAttribute("aria-labelledby", btn.id); btn.textContent = t[0];
        btn.addEventListener("click", function(){ show(i); });
        btn.addEventListener("keydown", function(e){ var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return; e.preventDefault(); var k2 = (i + d + 2) % 2; show(k2); tabs[k2][2].focus(); });
        bar.appendChild(btn); t.push(btn);
      });
      show(0);
      var cta = document.createElement("p"); cta.className = "ctx-cta";
      cta.innerHTML = 'Interested in ' + name + '? <a target="_blank" rel="noopener">Check today\u2019s availability \u2192</a>';
      cta.querySelector("a").href = "https://wa.me/" + WA + "?text=" + encodeURIComponent("Hi Baraa, can you check what's available in " + name + " at The Oasis?");
      pV.after(cta);
    });
  })();

  // compare clusters
  (function(){
    var C = [
      {n:"Palmiera 1", id:"palmiera", v:"265", b:"4–5", a:"5,843–8,689", p:"7,948–11,900", s:"Chamfered, Classical, Contemporary", pl:"85/15", h:"Q4 2026"},
      {n:"Palmiera 2", id:"palmiera", v:"56", b:"4", a:"5,627–5,872", p:"8,267–10,521", s:"Chamfered, Classical, Contemporary", pl:"85/15", h:"Q4 2027"},
      {n:"Palmiera 3", id:"palmiera", v:"59", b:"4", a:"5,666–5,914", p:"8,263–13,723", s:"Chamfered, Classical, Contemporary", pl:"80/20", h:"Q4 2028"},
      {n:"Palmiera Collective", id:"collective", v:"38 (all with basement)", b:"4", a:"7,879–8,099", p:"8,267–11,298", s:"Chamfered, Classical, Contemporary", pl:"80/20", h:"Q1 2029"},
      {n:"Mirage", id:"mirage", v:"204", b:"5–6", a:"10,225–12,967", p:"9,804–23,052", s:"Chamfered, Classical, Contemporary", pl:"90/10", h:"Q2 2028"},
      {n:"Lavita", id:"lavita", v:"49 mansions", b:"6–7", a:"19,012–29,915", p:"21,056–40,821", s:"Naya, Faya, Ayanna, Aman", pl:"80/20", h:"Q4 2028"},
      {n:"Marèva", id:"mareva", v:"658 (2 phases)", b:"4–6", a:"7,254–12,986", p:"7,790–24,015", s:"Chamfered, Classical, Contemporary", pl:"80/20", h:"Q1 2030"},
      {n:"Address Tierra", id:"tierra", v:"487 (branded)", b:"4–6", a:"7,269–12,959", p:"8,127–22,344", s:"Chamfered, Classical, Contemporary", pl:"80/20", h:"Q2 2029"},
      {n:"Palace Ostra", id:"ostra", v:"526 (branded)", b:"4–6", a:"7,269–12,959", p:"8,113–22,460", s:"Chamfered, Classical, Contemporary", pl:"80/20", h:"Q3 2029"}
    ];
    var ROWS = [["Villas","v"],["Bedrooms","b"],["BUA sq ft","a"],["Plot sq ft","p"],["Avg PPSF at launch","psf"],["Styles","s"],["Payment plan","pl"],["Handover","h"],["Construction","cp"]];
    if (!document.getElementById("cmpTbl")) return;
    var sel = [0, 1], pick = $("cmpPick"), tbl = $("cmpTbl");
    C.forEach(function(c, i){
      var btn = document.createElement("button"); btn.type = "button"; btn.className = "chip"; btn.textContent = c.n;
      btn.addEventListener("click", function(){
        var k = sel.indexOf(i);
        if (k > -1){ if (sel.length > 1) sel.splice(k, 1); }
        else { if (sel.length === 3) sel.shift(); sel.push(i); }
        draw();
      });
      pick.appendChild(btn);
    });
    function draw(){
      Array.prototype.forEach.call(pick.children, function(b, i){ b.setAttribute("aria-pressed", sel.indexOf(i) > -1 ? "true" : "false"); });
      var s = sel.slice().sort(function(a, b){ return a - b; });
      var h = '<thead><tr><th scope="col"><span class="sr">Detail</span></th>';
      s.forEach(function(i){ h += '<th scope="col"><a href="' + ({"Palmiera 1": "/clusters/palmiera-1/", "Palmiera 2": "/clusters/palmiera-2/", "Palmiera 3": "/clusters/palmiera-3/", "Palmiera Collective": "/clusters/palmiera-collective/", "Mirage": "/clusters/mirage/", "Lavita": "/clusters/lavita/", "Marèva": "/clusters/mareva/", "Address Tierra": "/clusters/address-villas-tierra/", "Palace Ostra": "/clusters/palace-villas-ostra/"})[C[i].n] + '"></a></th>'; });
      h += '</tr></thead><tbody>';
      ROWS.forEach(function(r){ h += '<tr><th scope="row">' + r[0] + '</th>'; s.forEach(function(){ h += '<td></td>'; }); h += '</tr>'; });
      tbl.innerHTML = h + '</tbody>';
      s.forEach(function(i, col){
        tbl.querySelectorAll("thead a")[col].textContent = C[i].n;
        ROWS.forEach(function(r, ri){ var td = tbl.querySelectorAll("tbody tr")[ri].querySelectorAll("td")[col]; if (r[1] === "psf" || r[1] === "cp"){ td.setAttribute("data-" + r[1] + "-t", C[i].n === "Marèva" ? "Marèva,Marèva 2" : C[i].n); td.textContent = "–"; } else td.textContent = C[i][r[1]]; });
        if (window.oasisMarket) window.oasisMarket();
      });
      $("cmpAsk").href = "https://wa.me/" + WA + "?text=" + encodeURIComponent("Hi Baraa, I'm comparing " + s.map(function(i){ return C[i].n; }).join(", ") + " at The Oasis. Which would you recommend for me?");
    }
    draw();
  })();

  // price per sq ft + construction progress (values in OASIS_MARKET)
  window.oasisMarket = function(){
    var M = window.OASIS_MARKET || {psf:{}, build:{}};
    function psfOf(keys){
      var v = keys.split(",").map(function(k){ return num((M.psf || {})[k]); }).filter(function(x){ return x > 0; });
      if (!v.length) return "–";
      var lo = Math.min.apply(null, v), hi = Math.max.apply(null, v);
      return lo === hi ? "AED " + Math.round(lo).toLocaleString("en-US") : "AED " + Math.round(lo).toLocaleString("en-US") + "–" + Math.round(hi).toLocaleString("en-US");
    }
    function cpOf(k){ var b = (M.build || {})[k]; return b && num(b.pct) ? b : null; }
    document.querySelectorAll("[data-psf]").forEach(function(el){ el.textContent = psfOf(el.getAttribute("data-psf")); });
    document.querySelectorAll("[data-psf-t]").forEach(function(el){ el.textContent = psfOf(el.getAttribute("data-psf-t")); });
    document.querySelectorAll("[data-cp-t]").forEach(function(el){
      var t = el.getAttribute("data-cp-t").split(",").map(function(k){ var b = cpOf(k); return b ? (el.getAttribute("data-cp-t").indexOf(",") > -1 ? k + ": " : "") + num(b.pct) + "%" + (b.date ? " (" + b.date + ")" : "") : ""; }).filter(Boolean);
      el.textContent = t.length ? t.join(", ") : "Update coming soon";
    });
    document.querySelectorAll("[data-cp]").forEach(function(el){
      var keys = el.getAttribute("data-cp").split(","), many = keys.length > 1, h = "";
      if (el.closest(".cc")){
        var dt = "";
        keys.forEach(function(k){ var b = cpOf(k); if (!b) return; var p = Math.max(0, Math.min(100, num(b.pct))); dt = b.date || dt;
          h += '<span class="cp-mini">' + (many ? '<span class="cp-lbl">' + (k === "Palmiera Collective" ? "Collective" : k.replace(/^Palmiera /, "Palmiera ")) + '</span>' : '<span class="cp-lbl">Built</span>') + '<span class="cp-bar" aria-hidden="true"><i style="width:' + p + '%"></i></span><span class="cp-pct">' + p + '%</span></span>'; });
        el.innerHTML = h ? h + (dt ? '<span class="cp-date">Construction as of ' + dt + '</span>' : '') : '<span class="cp-row cp-none">Construction update coming soon</span>';
        return;
      }
      keys.forEach(function(k){
        var b = cpOf(k); if (!b) return;
        var p = Math.max(0, Math.min(100, num(b.pct)));
        h += '<span class="cp-row">' + (many ? '<span class="cp-lbl">' + k + '</span>' : '') + '<span class="cp-bar" aria-hidden="true"><i style="width:' + p + '%"></i></span><span class="cp-txt">' + p + '% constructed' + (b.date ? ' as of ' + b.date : '') + '</span></span>';
      });
      if (h && M.buildSource && !el.closest(".cc")) h += '<span class="cp-src">Source: ' + M.buildSource + '</span>';
      el.innerHTML = h || '<span class="cp-row cp-none">Construction update coming soon</span>';
    });
  };
  window.oasisMarket();

  // testimonials carousel
  (function(){
    var tr = $("tmTrack"); if (!tr) return;
    var sl = tr.querySelectorAll(".tm-s"), dots = $("tmDots"), cur = 0;
    sl.forEach(function(_, k){ var b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", "Review " + (k + 1)); b.addEventListener("click", function(){ go(k); }); dots.appendChild(b); });
    function go(k){ k = (k + sl.length) % sl.length; tr.scrollTo({left: k * tr.clientWidth, behavior: "smooth"}); }
    function mark(){ cur = Math.round(tr.scrollLeft / tr.clientWidth); dots.querySelectorAll("button").forEach(function(b, k){ b.setAttribute("aria-current", k === cur ? "true" : "false"); }); }
    tr.addEventListener("scroll", function(){ clearTimeout(tr._t); tr._t = setTimeout(mark, 60); }, {passive:true});
    $("tmPrev").addEventListener("click", function(){ go(cur - 1); });
    $("tmNext").addEventListener("click", function(){ go(cur + 1); });
    mark();
  })();

  // deals carousel
  (function(){
    var tr = $("dlTrack"); if (!tr || !tr.parentNode) return;
    var sl = tr.querySelectorAll(".dl-s"), dots = $("dlDots"), cur = 0;
    sl.forEach(function(_, k){ var b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", "Deal " + (k + 1)); b.addEventListener("click", function(){ go(k); }); dots.appendChild(b); });
    function go(k){ k = (k + sl.length) % sl.length; tr.scrollTo({left: k * tr.clientWidth, behavior: "smooth"}); }
    function mark(){ cur = Math.round(tr.scrollLeft / tr.clientWidth); dots.querySelectorAll("button").forEach(function(b, k){ b.setAttribute("aria-current", k === cur ? "true" : "false"); }); }
    tr.addEventListener("scroll", function(){ clearTimeout(tr._t); tr._t = setTimeout(mark, 60); }, {passive:true});
    $("dlPrev").addEventListener("click", function(){ go(cur - 1); });
    $("dlNext").addEventListener("click", function(){ go(cur + 1); });
    mark();
    if (sl.length < 2){ var c = tr.parentNode.querySelector(".tm-ctl"); if (c) c.hidden = true; }
  })();

  // compare villas
  (function(){
    var host = document.getElementById("cvPick"), tbl = document.getElementById("cvTbl");
    var D = window.OASIS_UNITS; if (!D) return;
    // finder -> compare hand-off
    document.addEventListener("click", function(e){
      var a = e.target.closest && e.target.closest("#ufCmp"); if (!a) return;
      e.preventDefault(); var u = a.getAttribute("data-u"); if (!u || u.split(",").length < 2) return;
      location.href = "/tools/compare-villas/?u=" + encodeURIComponent(u);
    });
    if (!host || !tbl) return;
    var PLAN = {0:["85/15","Q4 2026"],1:["85/15","Q4 2027"],2:["80/20","Q4 2028"],3:["80/20","Q1 2029"],4:["90/10","Q2 2028"],5:["80/20","Q4 2028"],6:["80/20","Q1 2030"],7:["80/20","Q1 2030"],8:["80/20","Q2 2029"],9:["80/20","Q3 2029"]};
    var MK = ["Palmiera 1","Palmiera 2","Palmiera 3","Palmiera Collective","Mirage","Lavita","Marèva","Marèva 2","Address Tierra","Palace Ostra"];
    var FPC = ["Palmiera 1","Palmiera 2","Palmiera 3","Palmiera Collective","Mirage","Lavita","Marèva","Marèva 2","Address Villas Tierra","Palace Villas Ostra"];
    var byC = {}; D.u.forEach(function(u){ (byC[u[0]] = byC[u[0]] || []).push(u); });
    function nat(a, b){ return (parseInt(a[1], 10) || 0) - (parseInt(b[1], 10) || 0) || String(a[1]).localeCompare(String(b[1])); }
    Object.keys(byC).forEach(function(c){ byC[c].sort(nat); });
    function find(c, n){ return (byC[c] || []).filter(function(u){ return String(u[1]) === String(n); })[0]; }
    var picks = [null, null, null];
    var q = new URLSearchParams(location.search).get("u");
    if (q) q.split(",").slice(0, 3).forEach(function(k, i){ var p = k.split("-"); var u = find(p[0], p.slice(1).join("-")); if (u) picks[i] = u; });
    function slot(i){
      var d = document.createElement("div"); d.className = "cv-slot";
      d.innerHTML = '<p class="cv-h">Villa ' + (i + 1) + '</p><label for="cvC' + i + '">Cluster</label><select id="cvC' + i + '"><option value="">Choose cluster</option></select><label for="cvU' + i + '">Unit</label><select id="cvU' + i + '"><option value="">Choose unit</option></select>';
      var sc = d.querySelector("#cvC" + i), su = d.querySelector("#cvU" + i);
      D.c.forEach(function(n, k){ var o = document.createElement("option"); o.value = k; o.textContent = n; sc.appendChild(o); });
      function units(){ su.innerHTML = '<option value="">Choose unit</option>'; (byC[sc.value] || []).forEach(function(u){ var o = document.createElement("option"); o.value = u[1]; o.textContent = "Unit " + u[1] + " · " + u[2] + " BR " + D.s[u[4]]; su.appendChild(o); }); }
      if (picks[i]){ sc.value = picks[i][0]; units(); su.value = picks[i][1]; }
      sc.addEventListener("change", function(){ units(); picks[i] = null; draw(); });
      su.addEventListener("change", function(){ picks[i] = su.value ? find(sc.value, su.value) : null; draw(); });
      return d;
    }
    for (var i = 0; i < 3; i++) host.appendChild(slot(i));
    function f(n){ return n ? Math.round(n).toLocaleString("en-US") : "–"; }
    var MAPF = ["cm_p1","cm_p2","cm_p3","cm_pc","cm_mirage","cm_lavita","cm_mareva","cm_mareva2","cm_tierra","cm_ostra"];
    function cmap(u){ return '<a class="cv-btn" href="/images/maps/' + MAPF[u[0]] + '.jpg" target="_blank" rel="noopener">View Cluster Map</a>'; }
    function planList(u){
      var P = window.OASIS_FLOORPLANS || [], st = D.s[u[4]], c = FPC[u[0]];
      var m = P.filter(function(p){ return p.c === c && p.b === u[2] && p.s.indexOf(st) === 0; });
      if (u[3]){ var t = m.filter(function(p){ return p.s.indexOf(u[3]) > -1; }); if (t.length) m = t; }
      var clusterHasDrop = P.some(function(p){ return p.c === c && / Drop/.test(p.s); });
      if (u[10] === "Drop"){ var d = m.filter(function(p){ return /Drop/.test(p.s); }); if (d.length) m = d; }
      else if (clusterHasDrop){ var f2 = m.filter(function(p){ return !/Drop/.test(p.s); }); if (f2.length) m = f2; }
      if (u[6] === 1){ var bm = m.filter(function(p){ return /With Basement/.test(p.s); }); if (bm.length) m = bm; }
      else if (u[6] === 0){ var nb = m.filter(function(p){ return !/With Basement/.test(p.s); }); if (nb.length) m = nb; }
      return m.map(function(p){ return {f: p.f, label: m.length > 1 ? p.s.replace(st + " · ", "") : ""}; });
    }
    function plans(u){
      return planList(u).map(function(p){ return '<a class="cv-btn" href="' + p.f + '" target="_blank" rel="noopener">View Floor Plan' + (p.label ? ' (' + p.label + ')' : '') + '</a>'; }).join("") || "On request";
    }
    function getRows(){
      var M = window.OASIS_MARKET || {psf:{}, build:{}};
      return [
        ["Cluster", function(u){ return D.c[u[0]]; }],
        ["Bedrooms", function(u){ return u[2] + (u[3] ? " (" + u[3] + ")" : ""); }],
        ["Style", function(u){ return D.s[u[4]]; }],
        ["Floors", function(u){ return u[5] || "–"; }, "max"],
        ["Basement", function(u){ return u[6] === 1 ? "Yes" : (u[6] === 0 ? "No" : "–"); }],
        ["BUA sq ft", function(u){ return f(u[7]); }, "max", 7],
        ["Plot sq ft", function(u){ return f(u[8]); }, "max", 8],
        ["View", function(u){ return u[9] || "–"; }],
        ["Position", function(u){ return u[11] || "–"; }],
        ["Payment plan", function(u){ return PLAN[u[0]][0]; }],
        ["Handover", function(u){ return PLAN[u[0]][1]; }],
        ["Construction", function(u){ var b = (M.build || {})[MK[u[0]]]; return b && b.pct ? b.pct + "%" : "–"; }],
        ["Avg PPSF at launch", function(u){ var v = (M.psf || {})[MK[u[0]]]; return v ? "AED " + Number(v).toLocaleString("en-US") : "–"; }],
        ["Floor plan", plans, "", "", "plans"],
        ["Cluster map", cmap, "", "", "map"]
      ];
    }
    function draw(){
      var sel = picks.filter(Boolean);
      if (!sel.length){ tbl.innerHTML = ""; }
      else {
        var h = '<thead><tr><th scope="col"><span class="sr">Detail</span></th>' + sel.map(function(u){ return '<th scope="col">' + D.c[u[0]] + '<br><span style="font-size:14px;color:var(--muted)">Unit ' + u[1] + '</span></th>'; }).join("") + '</tr></thead><tbody>';
        getRows().forEach(function(r){
          h += '<tr><th scope="row">' + r[0] + '</th>' + sel.map(function(u){
            return '<td>' + r[1](u) + '</td>';
          }).join("") + '</tr>';
        });
        tbl.innerHTML = h + '</tbody>';
      }
      var keys = sel.map(function(u){ return u[0] + "-" + u[1]; });
      var url = location.origin + "/tools/compare-villas/" + (keys.length ? "?u=" + encodeURIComponent(keys.join(",")) : "");
      if (history.replaceState) history.replaceState(null, "", keys.length ? "?u=" + encodeURIComponent(keys.join(",")) : location.pathname);
      var list = sel.map(function(u){ return D.c[u[0]] + " unit " + u[1] + " (" + u[2] + " BR " + D.s[u[4]] + ")"; });
      document.getElementById("cvAsk").href = "https://wa.me/" + WA + "?text=" + encodeURIComponent("Hi Baraa, I'm comparing these villas in The Oasis:\n" + list.join("\n") + "\nAre they available, and what are the prices?\n" + url);
      document.getElementById("cvAsk").classList.toggle("disabled", sel.length < 1);
      document.getElementById("cvShare").onclick = function(){
        var h2 = document.getElementById("cvHint");
        if (navigator.clipboard) navigator.clipboard.writeText(url).then(function(){ h2.textContent = "Link copied. Send it to anyone to see this comparison."; }, function(){ h2.textContent = url; });
        else h2.textContent = url;
      };
    }
    draw();

    // download comparison as a PDF (landscape, same look as the other PDFs)
    function cvPdf(sel){
      var J = new window.jspdf.jsPDF({unit:"pt", format:"a4", orientation:"landscape"}), A = window.OASIS_PDF_ASSETS;
      var W = 841.89, H = 595.28, M = 40;
      J.addFileToVFS("Jost-Light.ttf", A.light); J.addFont("Jost-Light.ttf", "Jost", "light");
      J.addFileToVFS("Jost-Regular.ttf", A.regular); J.addFont("Jost-Regular.ttf", "Jost", "normal");
      J.addFileToVFS("Jost-Medium.ttf", A.medium); J.addFont("Jost-Medium.ttf", "Jost", "medium");
      var BG = [13,12,11], INK = [239,231,219], MUTED = [184,174,159], LINE = [46,40,34], SAGE = [175,194,171], SAGE2 = [195,207,190], HI = [40,45,38];
      function col(c){ J.setTextColor(c[0], c[1], c[2]); }
      function fnt(w, z){ J.setFont("Jost", w); J.setFontSize(z); }
      function spaced(t, x, y, sp, al){ J.setCharSpace(sp); J.text(t, x, y, {align: al || "left"}); J.setCharSpace(0); }
      function fit(t, z, maxW, w){ fnt(w, z); while (z > 7 && J.getTextWidth(t) > maxW){ z -= 0.5; fnt(w, z); } return z; }
      J.setFillColor(BG[0], BG[1], BG[2]); J.rect(0, 0, W, H, "F");
      var lw = 112; J.addImage(A.logo, "PNG", M, 26, lw, lw * A.logoRatio);
      fnt("light", 22); col(INK); J.text("Villa Comparison", W - M, 50, {align: "right"});
      fnt("normal", 9); col(MUTED); spaced(("The Oasis by Emaar · " + today()).toUpperCase(), W - M, 68, 1.3, "right");
      var y = 104, LW = 118, n = sel.length, CW = (W - 2 * M - LW) / n;
      function cx(i){ return M + LW + CW * (i + 0.5); }
      sel.forEach(function(u, i){
        fit(D.c[u[0]], 15, CW - 16, "light"); col(INK); J.text(D.c[u[0]], cx(i), y + 18, {align: "center"});
        fnt("normal", 9); col(MUTED); spaced("UNIT " + u[1], cx(i), y + 33, 1.2, "center");
      });
      y += 42; J.setDrawColor(SAGE[0], SAGE[1], SAGE[2]); J.setLineWidth(0.8); J.line(M, y, W - M, y);
      getRows().forEach(function(r){
        var kind = r[4] || "", lines = 1;
        if (kind === "plans") lines = Math.max(1, Math.max.apply(null, sel.map(function(u){ return planList(u).length; })));
        var rh = kind === "plans" ? 14 * lines + 9 : 21.5;
        fnt("normal", 8.5); col(MUTED); spaced(r[0].toUpperCase(), M, y + 14, 0.8);
        sel.forEach(function(u, i){
          if (kind === "plans"){
            var pl = planList(u);
            if (!pl.length){ fnt("normal", 10.5); col(MUTED); J.text("On request", cx(i), y + 14, {align: "center"}); return; }
            pl.forEach(function(p, k){
              var t = "View floor plan" + (p.label ? " (" + p.label + ")" : ""), yy = y + 14 + k * 14;
              fnt("normal", 10); col(SAGE2); var tw = J.getTextWidth(t), x = cx(i) - tw / 2;
              J.textWithLink(t, x, yy, {url: location.origin + p.f});
              J.setDrawColor(SAGE2[0], SAGE2[1], SAGE2[2]); J.setLineWidth(0.4); J.line(x, yy + 1.8, x + tw, yy + 1.8);
            });
          } else if (kind === "map"){
            var t2 = "View cluster map"; fnt("normal", 10); col(SAGE2); var tw2 = J.getTextWidth(t2), x2 = cx(i) - tw2 / 2;
            J.textWithLink(t2, x2, y + 14, {url: location.origin + "/images/maps/" + MAPF[u[0]] + ".jpg"});
            J.setDrawColor(SAGE2[0], SAGE2[1], SAGE2[2]); J.setLineWidth(0.4); J.line(x2, y + 15.8, x2 + tw2, y + 15.8);
          } else {
            var v = String(r[1](u)); fit(v, 11, CW - 18, "normal"); col(INK); J.text(v, cx(i), y + 14, {align: "center"});
          }
        });
        y += rh; J.setDrawColor(LINE[0], LINE[1], LINE[2]); J.setLineWidth(0.5); J.line(M, y, W - M, y);
      });
      var keys = sel.map(function(u){ return u[0] + "-" + u[1]; });
      var online = location.origin + "/tools/compare-villas/?u=" + encodeURIComponent(keys.join(","));
      y += 16; fnt("light", 8); col(MUTED);
      J.text(J.splitTextToSize("Details come from the masterplan and do not show whether a villa is for sale. Availability and prices are confirmed on request.", W - 2 * M), M, y);
      fnt("normal", 8.5); col(SAGE2); var ot = "Open this comparison online"; J.textWithLink(ot, W - M - J.getTextWidth(ot), y, {url: online});
      var fy = H - 54;
      J.setDrawColor(LINE[0], LINE[1], LINE[2]); J.setLineWidth(0.6); J.line(M, fy, W - M, fy);
      fnt("normal", 10); col(INK); J.text("Baraa Noura  ·  The Oasis Specialist", W / 2, fy + 18, {align: "center"});
      fnt("light", 9); col(MUTED); J.text("AX CAPITAL Real Estate  ·  BRN 70439", W / 2, fy + 31, {align: "center"});
      col(SAGE2); J.text("+971 52 132 52 15   ·   oasis@baraanoura.com   ·   @baraa.oasis", W / 2, fy + 44, {align: "center"});
      return J;
    }
    document.getElementById("cvDl").addEventListener("click", function(){
      var sel = picks.filter(Boolean), hint = document.getElementById("cvHint"), btn = this;
      if (sel.length < 2){ hint.textContent = "Choose at least two villas to download a comparison."; return; }
      btn.disabled = true; hint.textContent = "Preparing your PDF…";
      pdfReady().then(function(){
        cvPdf(sel).save("The Oasis - Villa comparison.pdf");
        hint.textContent = "Downloaded. Check your downloads folder.";
      }).catch(function(e){
        if (window.console) console.error(e);
        hint.textContent = "Sorry, the PDF couldn't be created on this device. Please try another browser, or message me and I'll send it.";
      }).then(function(){ btn.disabled = false; });
    });
  })();

  // page router: one topic per screen (articles and clusters also have their own URLs)
  var PATHS = {"top": "/", "articles": "/articles/", "clusters": "/clusters/", "calculators": "/tools/", "finder": "/tools/villa-finder/", "compare": "/tools/compare-clusters/", "fees": "/tools/purchase-fee-calculator/", "yield": "/tools/rental-yield-estimator/", "mortgage": "/tools/mortgage-calculator/", "factsheet": "/buyer-guide/", "construction": "/construction-update/", "privacy": "/privacy-policy/", "overview": "/overview/", "location": "/location/", "styles": "/style-and-floorplans/", "gallery": "/gallery/", "about": "/about/", "services": "/services/", "sell": "/sell-with-me/", "faq": "/faq/", "contact": "/contact/", "comparev": "/tools/compare-villas/", "nextlaunch": "/next-launch-valoria/", "lp-palmiera-1": "/clusters/palmiera-1/", "lp-palmiera-2": "/clusters/palmiera-2/", "lp-palmiera-3": "/clusters/palmiera-3/", "lp-palmiera-collective": "/clusters/palmiera-collective/", "lp-mirage": "/clusters/mirage/", "lp-lavita": "/clusters/lavita/", "lp-mareva": "/clusters/mareva/", "lp-mareva-2": "/clusters/mareva-2/", "lp-address-villas-tierra": "/clusters/address-villas-tierra/", "lp-palace-villas-ostra": "/clusters/palace-villas-ostra/", "lp-valoria": "/clusters/valoria/", "cl-palmiera": "/clusters/palmiera-1/", "cl-collective": "/clusters/palmiera-collective/", "cl-mirage": "/clusters/mirage/", "cl-lavita": "/clusters/lavita/", "cl-mareva": "/clusters/mareva/", "cl-tierra": "/clusters/address-villas-tierra/", "cl-ostra": "/clusters/palace-villas-ostra/", "floorplans": "/style-and-floorplans/", "explore": "/", "links": "/", "home": "/", "art-clusters": "/articles/why-the-oasis/", "art-resale": "/articles/palmiera-villa-resold-32-percent/", "art-invest": "/articles/is-the-oasis-a-good-investment/", "art-buying": "/articles/how-buying-a-villa-in-the-oasis-works/", "art-costs": "/articles/cost-of-buying-a-villa-in-the-oasis/", "art-service": "/articles/service-charges-in-the-oasis/", "art-schools": "/articles/schools-near-the-oasis/", "art-golf": "/articles/golf-courses-near-the-oasis/", "art-polo": "/articles/polo-and-equestrian-clubs-near-the-oasis/"};
  var ROUTE = (document.querySelector('meta[name="oasis-route"]') || {}).content || "";
  function U(id){ return PATHS[id] || (location.pathname === "/" ? "#" + id : "/#" + id); }
  (function(){ var hh = decodeURIComponent(location.hash.replace("#","")); if (hh && PATHS[hh] && PATHS[hh] !== location.pathname && !document.getElementById(hh)) location.replace(PATHS[hh]); })();
  var PAGES = [
    {id:"home", title:"Home", s:["factsheet","explore","links","contact"]},
    {id:"overview", title:"Overview", s:["overview","location","factsheet"]},
    {id:"location", title:"Location", s:["location"], parent:"overview"},
    {id:"clusters", title:"Clusters", s:["clusters"]},
    {id:"construction", title:"Construction Update", s:["construction"]},
    {id:"factsheet", title:"Oasis Buyer Guide", s:["factsheet"]},
    {id:"privacy", title:"Privacy Policy", s:["privacy"]},
    {id:"styles", title:"Style & Floorplan", s:["styles","floorplans"]},
    {id:"gallery", title:"Gallery", s:["gallery"]},
    {id:"calculators", title:"Buyer Tools", s:["calculators"]},
    {id:"finder", title:"Oasis Villa Finder", s:["finder"], parent:"calculators"},
    {id:"comparev", title:"Compare Villas", s:["comparev"], parent:"calculators"},
    {id:"compare", title:"Compare Clusters", s:["compare"], parent:"calculators"},
    {id:"fees", title:"Purchase Fee Calculator", s:["fees"], parent:"calculators"},
    {id:"yield", title:"Rental Yield Estimator", s:["yield"], parent:"calculators"},
    {id:"mortgage", title:"Mortgage Calculator", s:["mortgage"], parent:"calculators"},
    {id:"articles", title:"Articles", s:["articles"]},
    {id:"art-clusters", title:"Why The Oasis? Why I Chose To Specialize Here", s:["art-clusters"], parent:"articles"},
    {id:"art-invest", title:"Is The Oasis a Good Investment?", s:["art-invest"], parent:"articles"},
    {id:"art-buying", title:"How Buying a Villa in The Oasis Works", s:["art-buying"], parent:"articles"},
    {id:"art-costs", title:"What It Costs To Buy a Villa in The Oasis", s:["art-costs"], parent:"articles"},
    {id:"art-resale", title:"A Palmiera Villa Resold for 32% More: A Real Oasis Appreciation Story", s:["art-resale"], parent:"articles"},
    {id:"art-service", title:"Service Charges in The Oasis: What To Expect", s:["art-service"], parent:"articles"},
    {id:"art-schools", title:"Schools Near The Oasis", s:["art-schools"], parent:"articles"},
    {id:"art-golf", title:"Golf Courses Near The Oasis", s:["art-golf"], parent:"articles"},
    {id:"art-polo", title:"Polo and Equestrian Clubs Near The Oasis", s:["art-polo"], parent:"articles"},
    {id:"nextlaunch", title:"Next Launch: Valoria", s:["nextlaunch"], parent:"clusters"},
    {id:"lp-palmiera-1", title:"Palmiera 1", s:["lp-palmiera-1"], parent:"clusters"},
    {id:"lp-palmiera-2", title:"Palmiera 2", s:["lp-palmiera-2"], parent:"clusters"},
    {id:"lp-palmiera-3", title:"Palmiera 3", s:["lp-palmiera-3"], parent:"clusters"},
    {id:"lp-palmiera-collective", title:"Palmiera Collective", s:["lp-palmiera-collective"], parent:"clusters"},
    {id:"lp-mirage", title:"Mirage", s:["lp-mirage"], parent:"clusters"},
    {id:"lp-lavita", title:"Lavita", s:["lp-lavita"], parent:"clusters"},
    {id:"lp-mareva", title:"Marèva", s:["lp-mareva"], parent:"clusters"},
    {id:"lp-mareva-2", title:"Marèva 2", s:["lp-mareva-2"], parent:"clusters"},
    {id:"lp-address-villas-tierra", title:"Address Villas Tierra", s:["lp-address-villas-tierra"], parent:"clusters"},
    {id:"lp-palace-villas-ostra", title:"Palace Villas Ostra", s:["lp-palace-villas-ostra"], parent:"clusters"},
    {id:"lp-valoria", title:"Valoria", s:["lp-valoria"], parent:"clusters"},
    {id:"about", title:"About", s:["about"]},
    {id:"services", title:"Services", s:["services"], parent:"about"},
    {id:"sell", title:"Sell With Me", s:["sell"], parent:"about"},
    {id:"faq", title:"FAQ", s:["faq"], parent:"about"},
    {id:"contact", title:"Contact", s:["contact"]}
  ];
  var hero = document.querySelector("section.hero") || document.createElement("section");
  var allSecs = document.querySelectorAll("main > section.block");
  function pageOf(sec){ for (var q = 0; q < PAGES.length; q++){ if (PAGES[q].id === sec) return q; } for (var i = 0; i < PAGES.length; i++) if (PAGES[i].s.indexOf(sec) > -1) return i; return 0; }
  function route(){
    (function(){ var fsx = $("factsheet"), hh = decodeURIComponent(location.hash.replace("#","")) || ROUTE; if (!fsx) return; if ((!hh || hh === "top" || hh === "home") && $("explore")) $("explore").before(fsx); else if ($("location")) $("location").after(fsx); })();
    var h = decodeURIComponent(location.hash.replace("#","")) || ROUTE, idx = 0, target = null;
    if (h && h !== "top"){ var el = document.getElementById(h); if (el){ var sec = el.closest("section.block"); if (sec){ idx = pageOf(sec.id); target = el; } } }
    var pg = PAGES[idx];
    hero.hidden = idx !== 0;
    allSecs.forEach(function(s){ s.hidden = pg.s.indexOf(s.id) === -1; });
    $("pageTop").hidden = $("pageNav").hidden = idx === 0;
    if (idx){
      $("crumb").textContent = pg.title; $("crumb").hidden = !!pg.sub;
      var bk = document.querySelector("#pageTop .back");
      bk.href = pg.parent ? U(pg.parent) : "/";
      bk.setAttribute("aria-label", pg.parent ? "Back" : "Back to home");
      var sn = $("subnav"); sn.innerHTML = ""; sn.hidden = !pg.sub;
      (pg.sub || []).forEach(function(x){ var a = document.createElement("a"); a.href = "#" + x[0]; a.textContent = x[1]; sn.appendChild(a); });
      var pv = PAGES[idx - 1], nx = PAGES[idx + 1] || PAGES[1];
      $("prevPage").href = idx === 1 ? "/" : U(pv.s[0]);
      $("prevPage").textContent = idx === 1 ? "Home" : pv.title;
      $("nextPage").href = U(nx.s[0]); $("nextPage").textContent = nx.title;
    }
    var clDetail = !!(target && target.classList && target.classList.contains("cl"));
    document.querySelectorAll("#clusters .cl").forEach(function(a){ a.hidden = !(clDetail && a === target); });
    $("clGrid").hidden = clDetail;
    var gctl = $("clGrid").nextElementSibling; if (gctl && gctl.classList.contains("cc-ctl")) gctl.hidden = clDetail;
    var clh = document.querySelector("#clusters .head"); if (clh) clh.hidden = clDetail;
    if (clDetail){
      $("crumb").textContent = target.getAttribute("data-name");
      document.querySelector("#pageTop .back").href = U("clusters");
    }
    spy(pg);
    var first = idx && target && (target.id === pg.s[0] || clDetail);
    if ((!idx && !target) || (idx && first) || !target) window.scrollTo(0, 0);
    else target.scrollIntoView();
  }
  window.addEventListener("hashchange", route);
  route();


  // phase chips (switch cluster photo sets)
  document.querySelectorAll(".phase-chips").forEach(function(g){
    var media = g.closest(".cl");
    g.querySelectorAll(".chip").forEach(function(c){ c.addEventListener("click", function(){
      g.querySelectorAll(".chip").forEach(function(x){ x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
      media.querySelectorAll(".car").forEach(function(car){ car.hidden = car.getAttribute("aria-label") !== c.getAttribute("data-show"); });
      var kv = c.getAttribute("data-kv"); if (kv){ var dd = media.querySelectorAll(".kv dd"); kv.split("|").forEach(function(v, i){ if (dd[i]) dd[i].textContent = v; }); }
      var pk = c.getAttribute("data-key"), pd = media.querySelector(".kv dd[data-psf]"); if (pk && pd){ pd.setAttribute("data-psf", pk); if (window.oasisMarket) window.oasisMarket(); }
    }); });
  });

  if ($("svcForm")) $("svcForm").addEventListener("submit", function(e){
    e.preventDefault();
    var name = $("sfName").value.trim(), hint = $("sfHint"), phone = $("sfPhone").value.trim(), need = $("sfNeed").value;
    if (!name){ hint.textContent = "Add your name so I know who's writing."; $("sfName").focus(); return; }
    var msg = "Hi Baraa, I'm " + name + ". I'm interested in: " + need + "." + (phone ? "\nMy number: " + phone : "");
    if (window.saveLead) window.saveLead("Services form", name, phone, "Interested in: " + need);
    hint.textContent = "Opening WhatsApp…";
    window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
  });
  $("leadForm").addEventListener("submit", function(e){
    e.preventDefault();
    var name = $("lName").value.trim(), hint = $("formHint");
    if (!name){ hint.textContent = "Add your name so I know who's writing."; $("lName").focus(); return; }
    var msg = "Hi Baraa, I'm " + name + ". I'm interested in: " + $("lNeed").value + ".";
    var det = $("lMsg").value.trim(), phone = $("lPhone").value.trim();
    if (det) msg += "\n" + det;
    if (phone) msg += "\nMy number: " + phone;
    if (window.saveLead) window.saveLead("Contact form", name, phone, "Interested in: " + $("lNeed").value + (det ? "; Message: " + det : ""));
    hint.textContent = "Opening WhatsApp…";
    window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
  });
})();

  document.querySelectorAll(".lp-fp-select").forEach(function(sel){ var dl = sel.closest(".lp-fps").querySelector(".lp-fp-dl"); function upd(){ var o = sel.options[sel.selectedIndex]; dl.href = o.value; dl.setAttribute("download", o.getAttribute("data-dl")); } sel.addEventListener("change", upd); upd(); });
  document.addEventListener("click", function(e){ var b = e.target.closest && e.target.closest(".lp-find"); if (!b || !window.ufApply) return; if (document.getElementById("finder")){ window.ufApply({c: b.getAttribute("data-uf")}); location.hash = "finder"; } else { try { sessionStorage.setItem("ufPending", JSON.stringify({c: b.getAttribute("data-uf")})); } catch(e){} location.href = "/tools/villa-finder/"; } });
  try { var _pf = sessionStorage.getItem("ufPending"); if (_pf && document.getElementById("finder") && window.ufApply){ sessionStorage.removeItem("ufPending"); window.ufApply(JSON.parse(_pf)); } } catch(e){}

/* Welcome card + newsletter signup.
   Signups go to the "Oasis Newsletter Subscribers" Google Sheet via its Apps Script web app.
   Paste the web app URL (ends in /exec) between the quotes below. Left empty, signups open an email instead. */
(function(){
  var NEWSLETTER_ENDPOINT = window.LEADS_ENDPOINT = "https://script.google.com/macros/s/AKfycbxXoSipixudCma0JhWdaUaTHasX_mMxWSqfCSjG1OQiyzV7zDtCI6ia7lTQQsrW15ed/exec";
  var KEY = "oasisWelcomeSeen";
  var box = document.getElementById("welcome"); if (!box) return;
  var email = document.getElementById("wcEmail"), hint = document.getElementById("wcHint"), last = null;
  function seen(){ try { return localStorage.getItem(KEY) === "1"; } catch(e){ return false; } }
  function mark(){ try { localStorage.setItem(KEY, "1"); } catch(e){} }
  function open(){
    last = document.activeElement; box.hidden = false;
    requestAnimationFrame(function(){ box.classList.add("on"); });
    document.documentElement.style.overflow = "hidden";
    setTimeout(function(){ email.focus({preventScroll:true}); }, 60);
  }
  function close(){
    mark(); box.classList.remove("on"); document.documentElement.style.overflow = "";
    setTimeout(function(){ box.hidden = true; if (last && last.focus) last.focus(); }, 300);
  }
  document.getElementById("wcClose").addEventListener("click", close);
  document.getElementById("wcLater").addEventListener("click", close);
  box.addEventListener("click", function(e){ if (e.target === box) close(); });
  document.addEventListener("keydown", function(e){
    if (box.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "Tab"){
      var f = box.querySelectorAll("button, input"), a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a){ e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z){ e.preventDefault(); a.focus(); }
    }
  });
  function subscribe(v, source, done){
    mark();
    if (NEWSLETTER_ENDPOINT){
      var b = new URLSearchParams({email: v, source: source});
      fetch(NEWSLETTER_ENDPOINT, {method:"POST", body:b, mode:"no-cors", keepalive:true}).catch(function(){});
      done("You're subscribed. Thank you.");
    } else {
      location.href = "mailto:oasis@baraanoura.com?subject=" + encodeURIComponent("Newsletter signup") + "&body=" + encodeURIComponent("Please add me to The Oasis newsletter.\nEmail: " + v);
      done("Opening your email app. Send the message to confirm.");
    }
  }
  document.querySelectorAll("form.nl").forEach(function(fm){
    fm.addEventListener("submit", function(e){
      e.preventDefault();
      var inp = fm.querySelector("input"), h = fm.querySelector(".nl-h"), v = inp.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)){ h.textContent = "Enter a valid email address, like name@example.com."; inp.focus(); return; }
      var src = fm.getAttribute("data-src") === "Article" ? "Article: " + (document.title.split(" | ")[0]) : "Website " + fm.getAttribute("data-src").toLowerCase();
      subscribe(v, src, function(msg){ h.textContent = msg; inp.value = ""; });
    });
  });
  document.getElementById("wcForm").addEventListener("submit", function(e){
    e.preventDefault();
    var v = email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)){ hint.textContent = "Enter a valid email address, like name@example.com."; email.focus(); return; }
    mark();
    if (NEWSLETTER_ENDPOINT){
      var body = new URLSearchParams({email: v, source: "Website welcome card"});
      fetch(NEWSLETTER_ENDPOINT, {method:"POST", body:body, mode:"no-cors"}).catch(function(){});
      hint.textContent = "You're subscribed. Thank you.";
      setTimeout(close, 1600);
    } else {
      location.href = "mailto:oasis@baraanoura.com?subject=" + encodeURIComponent("Newsletter signup") +
        "&body=" + encodeURIComponent("Please add me to The Oasis newsletter.\nEmail: " + v);
      hint.textContent = "Opening your email app. Send the message to confirm.";
    }
  });
  // show once, after the visitor has spent a while on the site (not on arrival)

})();
