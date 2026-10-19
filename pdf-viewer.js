/* =========================================================
   PDF Viewer for Blogger Quiz Posts — v25 FINAL
   - Screen: Header/Footer hidden
   - Print: Header/Footer visible with links
   - Fixed h1/h2 typo
   ========================================================= */
(function () {
    'use strict';

    var LABELS  = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];
    var CHUNK   = 10;
    var MAX_TRIES = 30;

    /* ⬇️ এখানে আপনার ব্লগের হোমপেজ URL বসান */
    var HOMEPAGE_URL = 'https://www.w3classroom.com/';
    var HOMEPAGE_TEXT = 'w3classroom.com';

    function toBangla(n) {
        var d = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
        return String(n).split('').map(function (c) { return d[c] || c; }).join('');
    }

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function stripLeadingNumber(txt) {
        if (!txt) return '';
        var s = String(txt);
        s = s.replace(/^\s*[\u09E6-\u09EF0-9]+\s*[\.\)\u0964\u0965\:\;\-]\s*/, '');
        return s.replace(/^\s+/, '');
    }

    function findQuizData() {
        var names = [
            'masterQuestions', 'questions', 'allQuestions',
            'mcqData', 'quizData', 'mcq', 'quizQuestions',
            'questionList', 'allMcq', 'mcqList'
        ];
        for (var i = 0; i < names.length; i++) {
            try {
                var v = eval(names[i]);
                if (Array.isArray(v) && v.length > 0 &&
                    v[0] && typeof v[0].text === 'string' &&
                    Array.isArray(v[0].options)) {
                    return v;
                }
            } catch (e) { }
        }
        return null;
    }

    function getExamTitle() {
        var h2 = document.querySelector('#exam-info-card h2') ||
                 document.querySelector('.exam-info h2');
        if (h2 && h2.textContent.trim()) return h2.textContent.trim();
        return (document.title || 'প্রশ্ন ও সমাধান').trim();
    }

    function getExamMeta() {
        var out = [];
        var grids = document.querySelectorAll('.exam-info .info-grid');
        for (var i = 0; i < grids.length; i++) {
            var cells = grids[i].children;
            for (var j = 0; j < cells.length; j++) {
                var t = cells[j].textContent.trim().replace(/\s+/g, ' ');
                if (t) out.push(t);
            }
        }
        return out;
    }

    function openPdfView(DATA) {
        if (!DATA || !DATA.length) {
            alert('এই পোস্টে কোনো প্রশ্ন পাওয়া যায়নি।');
            return;
        }
        var win = window.open('', '_blank');
        if (!win) {
            alert('পপ-আপ ব্লক করা আছে! Allow করুন।');
            return;
        }

        var title = esc(getExamTitle());
        var meta  = getExamMeta();
        var metaHtml = meta.length
            ? '<div class="meta-line">' + meta.map(esc).join(' | ') + '</div>'
            : '';

        win.document.write(
'<!DOCTYPE html>\
<html lang="bn">\
<head>\
<meta charset="UTF-8">\
<meta name="viewport" content="width=device-width,initial-scale=1">\
<title>' + title + ' - PDF</title>\
<style>\
*{box-sizing:border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;}\
\
html,body{\
  font-family:\'SolaimanLipi\',\'Kalpurush\',\'Hind Siliguri\',\'Noto Sans Bengali\',\'Nirmala UI\',\'Vrinda\',\'Shonar Bangla\',\'Bangla\',\'Bangla Sangam MN\',\'Bangla MN\',system-ui,-apple-system,\'Segoe UI\',Roboto,Arial,sans-serif;\
  margin:0;padding:20px;background:#f4f4f4;color:#222;\
  font-size:15px;line-height:1.55;font-weight:normal;\
}\
\
/* ===== Top Bar (Screen) ===== */\
.top-bar{\
  max-width:1100px;margin:0 auto 15px;background:#fff;border:1px solid #ccc;\
  border-top:6px solid #0075a8;padding:15px 20px;border-radius:6px;\
  display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;\
  position:relative;\
}\
.top-bar .tb-left{flex:1;min-width:0}\
.top-bar h2{font-size:20px;color:#0075a8;margin:0 0 6px 0;font-weight:bold}\
.top-bar .info{font-size:13px;color:#555;margin-top:4px}\
.top-bar .meta-line{font-size:12px;color:#666;margin-top:2px}\
\
.close-btn{\
  background:linear-gradient(90deg,#1e90ff 0%,#16a085 100%);\
  color:#fff;border:none;padding:10px 22px;border-radius:6px;\
  cursor:pointer;font-weight:bold;font-size:14px;font-family:inherit;\
  box-shadow:0 4px 10px rgba(30,144,255,0.3);\
}\
.close-btn:hover{transform:translateY(-1px);box-shadow:0 6px 14px rgba(30,144,255,0.4)}\
\
.brand-banner{\
  max-width:1100px;margin:0 auto 15px;text-align:center;\
  background:linear-gradient(90deg,#1e90ff 0%,#16a085 100%);\
  color:#fff;padding:8px 15px;border-radius:6px;font-size:14px;font-weight:bold;\
}\
.brand-banner a{color:#fff;text-decoration:none}\
\
#loading{max-width:1100px;margin:0 auto;padding:25px;background:#fff;border:1px solid #ccc;text-align:center;font-size:16px;color:#555;border-radius:6px}\
#loading .pct{color:#1e90ff;font-weight:bold;font-size:20px}\
\
.main-wrapper{max-width:1100px;margin:0 auto;background:#fff;border:1px solid #ccc;padding:25px;border-radius:6px}\
\
.pdf-grid{width:100%;border-collapse:collapse;table-layout:fixed}\
.pdf-grid td.q-cell{vertical-align:top;width:50%;padding:0 14px 0 0;border-bottom:1px dashed #eaeaea}\
.pdf-grid td.q-cell.right{padding:0 0 0 14px}\
\
/* ==== স্ক্রিনে হেডার ও ফুটার লুকানোর জন্য ==== */\
.pdf-grid thead, .pdf-grid tfoot { display: none !important; }\
\
.question-block{padding:10px 0}\
.qh{display:table;width:100%;table-layout:auto;margin-bottom:8px}\
.qh-q{display:table-cell;vertical-align:top;padding-right:10px}\
.qh-s{display:table-cell;vertical-align:top;width:1%;white-space:nowrap;text-align:right}\
\
.question{font-weight:bold;font-size:15px;line-height:1.55;word-wrap:break-word;overflow-wrap:break-word}\
.q-link{color:#2E37EA;text-decoration:none;cursor:pointer}\
.q-link:hover{text-decoration:underline}\
.qnum{color:#2E37EA;font-weight:bold;margin-right:4px}\
\
.source-badge{\
  color:#1e90ff;font-size:10.5px;font-style:italic;\
  border:1px solid #b8d9f5;border-radius:12px;padding:2px 9px;\
  background:#f0f8ff;display:inline-block;max-width:180px;\
  overflow:hidden;text-overflow:ellipsis;\
}\
\
/* ==== Options Layout ==== */\
.opts-container{width:100%; overflow:hidden; margin:0;}\
.opt-item{float:left; width:48%; margin:0 4% 6px 0; font-size:14px; line-height:1.5;}\
.opt-item:nth-child(2n){margin-right:0;}\
.opt-item .lbl-box{display:inline-block; vertical-align:middle; width:20px; height:20px; margin-right:4px;}\
.opt-item .text-box{display:inline-block; vertical-align:middle; width:calc(100% - 26px); word-wrap:break-word; overflow-wrap:anywhere;}\
.circle-svg{width:20px; height:20px;}\
.circle-text{position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:11px; font-weight:bold;}\
.correct-text {color:#16a085; font-weight:bold;}\
\
.explanation{border-left:3px solid #16A085;padding:8px 10px;margin-top:8px;border-radius: 5px 0px 0px 5px;font-size:14px;line-height:1.55;text-align:justify;word-wrap:break-word}\
math{font-family:inherit}\
\
/* ==== End CTA Box (Screen & Print) ==== */\
.end-cta{\
  max-width:1100px; margin:30px auto 0; padding:20px;\
  background:#e8f4fd; border:2px dashed #1e90ff; border-radius:8px;\
  text-align:center; color:#005e87;\
}\
.end-cta h3{margin:0 0 10px 0; font-size:18px;}\
.end-cta p{margin:0 0 10px 0; font-size:14px;}\
.end-cta a{\
  display:inline-block; background:linear-gradient(90deg,#1e90ff 0%,#16a085 100%);\
  color:#fff; text-decoration:none; padding:10px 20px; border-radius:6px;\
  font-weight:bold; font-size:16px;\
}\
\
#toTop{position:fixed;bottom:25px;right:25px;background:linear-gradient(135deg,#1e90ff 0%,#16a085 100%);color:#fff;border:none;width:48px;height:48px;border-radius:50%;cursor:pointer;font-size:22px;line-height:1;box-shadow:0 4px 12px rgba(30,144,255,.35);display:none;font-family:inherit}\
\
/* ============================================================\
   MOBILE RESPONSIVE\
   ============================================================ */\
@media screen and (max-width:700px){\
  .top-bar{ padding-top:50px; display:block; } \
  .close-btn{ position:absolute; top:10px; right:10px; padding:6px 12px; font-size:12px; }\
  .pdf-grid,.pdf-grid tbody,.pdf-grid tr,.pdf-grid td{display:block;width:100% !important}\
  .pdf-grid td.q-cell{padding:0 !important;border-bottom:none}\
  .qh-q{display:block;padding-right:0}\
  .qh-s{display:block;width:auto;text-align:left;margin-top:5px;white-space:normal}\
  .opt-item{float:none; width:100%; margin-right:0;}\
}\
\
/* ============================================================\
   PRINT STYLES (Preserved Colors, Header/Footer Links)\
   ============================================================ */\
@media print{\
  @page{size:A4 portrait;margin:15mm 12mm 15mm 12mm}\
  html,body{padding:0 !important;margin:0 !important;background:#fff !important;font-size:12px}\
  #loading,#toTop,.close-btn,.brand-banner{display:none !important}\
\
  /* Table Header (Clickable Link - Only visible in print) */\
  .pdf-grid thead{display:table-header-group !important;}\
  .pdf-grid thead th{\
    text-align:center !important;font-size:11px !important;color:#000 !important;\
    border-bottom:1px solid #000 !important;padding-bottom:5px !important;font-weight:bold !important;\
  }\
  .pdf-grid thead th a { color: #0075a8 !important; text-decoration: none !important; }\
\
  /* Table Footer (Clickable Link - Only visible in print) */\
  .pdf-grid tfoot{display:table-footer-group !important;}\
  .pdf-grid tfoot td{\
    text-align:center !important;font-size:10px !important;color:#000 !important;\
    border-top:1px solid #000 !important;padding-top:5px !important;\
  }\
  .pdf-grid tfoot td a { color: #0075a8 !important; text-decoration: none !important; font-weight: bold !important; }\
\
  /* First Page Title Area */\
  .top-bar{display:block !important;text-align:center !important;background:#fff !important;border:none !important;border-bottom:2px dashed #000 !important;border-radius:0 !important;box-shadow:none !important;padding:15px 0 !important;margin:0 0 20px 0 !important;max-width:100% !important;}\
  .top-bar .tb-left{text-align:center !important}\
  .top-bar h2{display:block !important;text-align:center !important;font-size:20px !important;margin:0 0 10px 0 !important;color:#0075a8 !important;line-height:1.4 !important;font-weight:900 !important;}\
  .top-bar .info,.top-bar .meta-line{text-align:center !important;margin:4px 0 !important;font-size:12px !important;color:#333 !important}\
\
  /* End CTA Print */\
  .end-cta{ \
    border:2px dashed #1e90ff !important; background:#f0f8ff !important; \
    margin-top:20px !important; page-break-inside:avoid !important; padding:15px !important; \
    -webkit-print-color-adjust: exact !important; \
  }\
  .end-cta a{ background:#1e90ff !important; padding:8px 15px !important; font-size:14px !important; }\
\
  /* Main Layout (Forced 2-columns) */\
  .main-wrapper{border:none !important;box-shadow:none !important;border-radius:0 !important;padding:0 !important;margin:0 !important;max-width:100% !important}\
  .pdf-grid{display:table !important;width:100% !important;table-layout:fixed !important;border-collapse:collapse !important;margin:0 !important}\
  .pdf-grid tbody{display:table-row-group !important}\
  .pdf-grid tr{display:table-row !important;page-break-inside:avoid !important;break-inside:avoid !important}\
  .pdf-grid td.q-cell{display:table-cell !important;width:50% !important;vertical-align:top !important;padding:0 4mm 0 0 !important;border-bottom:1px dashed #ddd !important;float:none !important}\
  .pdf-grid td.q-cell.right{padding:0 0 0 4mm !important;border-left:1px solid #eee !important}\
\
  .question-block{padding:8px 0 !important;page-break-inside:avoid !important;break-inside:avoid !important}\
  \
  /* FORCE COLORS IN PRINT */\
  .question, .q-link, .qnum{font-size:12px !important; color:#2E37EA !important;}\
  .source-badge{font-size:9.5px !important;max-width:140px !important; color:#1e90ff !important; border-color:#b8d9f5 !important; background:#f0f8ff !important;}\
  \
  .opt-item{font-size:11.5px !important; margin-bottom:4px !important;}\
  .circle-svg{width:16px !important; height:16px !important;}\
  .circle-text{font-size:9px !important;}\
  .lbl-box{width:16px !important; height:16px !important;}\
  .text-box{width:calc(100% - 20px) !important;}\
  .correct-text {color:#16a085 !important; font-weight:bold !important;}\
  \
  .explanation{border-radius: 5px 0px 0px 5px!important;padding:6px 8px !important;border-left:3px solid #16A085!important;}\
}\
</style>\
</head>\
<body>\
\
<!-- Screen Only Banner -->\
<div class="brand-banner">\
  উৎস: <a href="' + HOMEPAGE_URL + '" target="_blank">' + HOMEPAGE_TEXT + '</a>\
</div>\
\
<div class="top-bar">\
  <div class="tb-left">\
    <h2>' + title + '</h2>\
    <div class="info"> অথেন্টিক ব্যাখ্যা ও নির্ভুল প্রশ্ন সমাধান | মোট প্রশ্ন: <span id="total-count">—</span></div>\
    ' + metaHtml + '\
  </div>\
  <button class="close-btn" onclick="window.print()"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:text-bottom;margin-right:5px;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg> প্রিন্ট / PDF সেভ</button>\
</div>\
<div id="loading">কনটেন্ট প্রস্তুত হচ্ছে... <span class="pct" id="load-pct">০%</span></div>\
\
<div class="main-wrapper">\
  <table class="pdf-grid">\
    <thead>\
      <tr>\
        <th colspan="2">\
          <a href="' + HOMEPAGE_URL + '" target="_blank">' + title + ' | উৎস: ' + HOMEPAGE_TEXT + '</a>\
        </th>\
      </tr>\
    </thead>\
    <tfoot>\
      <tr>\
        <td colspan="2">\
          এই প্রশ্ন সমাধানটি সংগ্রহ করা হয়েছে <a href="' + HOMEPAGE_URL + '" target="_blank">' + HOMEPAGE_TEXT + '</a> থেকে\
        </td>\
      </tr>\
    </tfoot>\
    <tbody id="pdf-tbody"></tbody>\
  </table>\
</div>\
\
<!-- Special Branding End CTA -->\
<div class="end-cta">\
  <h3>একাডেমিক শিক্ষা থেকে শুরু করে ভর্তি ও সরকারি চাকরির নির্ভরযোগ্য প্রস্তুতির জন্য ভিজিট করুন আমাদের ওয়েবসাইট।</h3>\
  <p>আমাদের ওয়েবসাইটে পাচ্ছেন প্রতিটি বিষয়ের অধ্যায়ভিত্তিক বিস্তারিত আলোচনা এবং অথেন্টিক ব্যাখ্যাসহ বিশাল প্রশ্ন ব্যাংক। সেই সাথে প্রতিটি অধ্যায়ের এমসিকিউ ও প্রশ্ন ব্যাংকের পূর্ণাঙ্গ সমাধানের পিডিএফ পড়ার এবং ডাউনলোডের সুযোগ রয়েছে। আর নিজের প্রস্তুতি যাচাই করতে প্রতিটি অধ্যায় ও প্রশ্ন ব্যাংকের ওপর রয়েছে ইন্টারেক্টিভ এক্সাম মোড-এর সুবিধা। </p>\
  <a href="' + HOMEPAGE_URL + '" target="_blank">' + HOMEPAGE_TEXT + '</a>\
</div>\
\
<button id="toTop" onclick="window.scrollTo({top:0,behavior:\'smooth\'})" title="উপরে যান">↑</button>\
</body>\
</html>');
        win.document.close();

        var tries = 0;
        var wait = function () {
            tries++;
            if (win.document.getElementById('pdf-tbody')) {
                renderInChunks(win, DATA);
            } else if (tries < 100) {
                setTimeout(wait, 30);
            }
        };
        setTimeout(wait, 40);
    }

    function renderInChunks(win, DATA) {
        var doc      = win.document;
        var tbody    = doc.getElementById('pdf-tbody');
        var loading  = doc.getElementById('loading');
        var pctEl    = doc.getElementById('load-pct');
        var totalEl  = doc.getElementById('total-count');
        var toTop    = doc.getElementById('toTop');

        var total = DATA.length;
        totalEl.textContent = toBangla(total);
        var idx = 0;

        function buildOption(text, i, correct, qNum) {
            var lbl = LABELS[i] || (i + 1);
            var isCorrect = (i === correct);
            var svgHtml = '';
            
            if (isCorrect) {
                svgHtml = '<svg class="circle-svg" viewBox="0 0 20 20">' +
                          '<circle cx="10" cy="10" r="9" fill="#16a085" stroke="#16a085" stroke-width="1"/></svg>';
            } else {
                svgHtml = '<svg class="circle-svg" viewBox="0 0 20 20">' +
                          '<circle cx="10" cy="10" r="9" fill="#fff" stroke="#333" stroke-width="1"/></svg>';
            }
            
            var textColor = isCorrect ? '#fff' : '#333';
            var textStyle = 'color:' + textColor + ';';

            return '<div class="opt-item">' +
                   '<div class="lbl-box" style="position:relative;">' + svgHtml + '<span class="circle-text" style="' + textStyle + '">' + lbl + '</span></div>' +
                   '<div class="text-box ' + (isCorrect ? 'correct-text' : '') + '"> ' + text + '</div>' +
                   '</div>';
        }

        function buildBlock(q, num) {
            var wrap = doc.createElement('div');
            wrap.className = 'question-block';
            var cleanText = stripLeadingNumber(q.text);

            var html = '<div class="qh">';
            html += '<div class="qh-q"><span class="question">' +
                    '<a class="q-link" href="' + HOMEPAGE_URL + '" target="_blank" rel="noopener">' +
                    '<span class="qnum">' + toBangla(num) + '.</span> ' + cleanText + '</a></span></div>';
            if (q.source) {
                html += '<div class="qh-s"><span class="source-badge">' + q.source + '</span></div>';
            }
            html += '</div>';

            var opts = q.options || [];
            var optsHtml = '<div class="opts-container">';
            for (var k = 0; k < opts.length; k++) {
                optsHtml += buildOption(opts[k], k, q.correct, num);
            }
            optsHtml += '</div>';
            html += optsHtml;

            if (q.explanation) {
                html += '<div class="explanation"><strong>ব্যাখ্যা:</strong> ' + q.explanation + '</div>';
            }

            wrap.innerHTML = html;
            return wrap;
        }

        function chunk() {
            var rowsTotal = Math.ceil(total / 2);
            var end = Math.min(idx + CHUNK, rowsTotal);
            var frag = doc.createDocumentFragment();

            for (var r = idx; r < end; r++) {
                var i1 = r * 2;
                var i2 = r * 2 + 1;
                var tr = doc.createElement('tr');

                var tdL = doc.createElement('td');
                tdL.className = 'q-cell left';
                tdL.appendChild(buildBlock(DATA[i1], i1 + 1));
                tr.appendChild(tdL);

                var tdR = doc.createElement('td');
                tdR.className = 'q-cell right';
                if (i2 < total) {
                    tdR.appendChild(buildBlock(DATA[i2], i2 + 1));
                } else {
                    tdR.innerHTML = '&nbsp;';
                }
                tr.appendChild(tdR);
                frag.appendChild(tr);
            }

            tbody.appendChild(frag);
            idx = end;

            var done = Math.min(idx * 2, total);
            var pct = Math.round((done / total) * 100);
            pctEl.textContent = toBangla(pct) + '%';

            if (idx < rowsTotal) {
                setTimeout(chunk, 16);
            } else {
                loading.style.display = 'none';
                toTop.style.display = 'block';
            }
        }

        win.addEventListener('scroll', function () {
            toTop.style.display = win.scrollY > 400 ? 'block' : 'none';
        });

        chunk();
    }

    function injectButton() {
        if (document.getElementById('pdf-view-btn')) return true;
        var pagination = document.querySelector('.pagination-container');
        if (!pagination) return false;
        var DATA = findQuizData();
        if (!DATA) return false;

        var wrap = document.createElement('div');
        wrap.style.cssText = 'text-align:center;margin-top:20px;';
        wrap.innerHTML =
            '<button type="button" id="pdf-view-btn" style="' +
            'background:linear-gradient(90deg,#1e90ff 0%,#16a085 100%);' +
            'color:#fff;padding:10px 24px;border:none;border-radius:5px;' +
            'font-weight:bold;cursor:pointer;' +
            'box-shadow:0 4px 12px rgba(30,144,255,0.35);' +
            'font-family:inherit;"> <i class="fa fa-download"></i> পিডিএফ ভার্সন পড়ুন </button>';

        var submitBtn = document.querySelector('#submit-btn') ||
                        document.querySelector('button[onclick*="processResult"]') ||
                        pagination;

        if (submitBtn && submitBtn.parentNode) {
            submitBtn.parentNode.insertBefore(wrap, submitBtn.nextSibling);
        } else {
            pagination.parentNode.insertBefore(wrap, pagination.nextSibling);
        }

        document.getElementById('pdf-view-btn').addEventListener('click', function () {
            openPdfView(DATA);
        });
        return true;
    }

    function init() {
        var tries = 0;
        var t = setInterval(function () {
            tries++;
            if (injectButton() || tries > MAX_TRIES) clearInterval(t);
        }, 500);
        injectButton();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
