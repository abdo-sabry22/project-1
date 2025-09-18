/* script.js
   ملف جافاسكربت للـ Quiz — أفضل ممارسات: IIFE + strict mode + DOMContentLoaded
   - يعرّف 15 سؤالاً دينياً بالعربي
   - يخلط ترتيب الأسئلة والخيارات عند كل تشغيل ("يتجددوا مع نفسهم")
   - يدعم الوصولية والكيبورد، ويخزن النتيجة في localStorage
*/

(() => {
  "use strict";

  /* ---------------------------
     مجموعة الأسئلة (مصدر داخلي)
     كل عنصر: { id, q, opts:[], a: indexOfCorrect, info: شرح/مرجع اختياري }
     -------------------------------------------------- */
  const QUESTION_POOL = [
    {
      id: 1,
      q: "أي سورة تُعرف بـ «قلب القرآن»؟",
      opts: ["الفاتحة", "يس", "الرحمن", "البقرة"],
      a: 1,
      info: "يُعرف أن سورة يس تلقب بـ 'قلب القرآن' عند جمهور من العلماء.",
    },
    {
      id: 2,
      q: "كم عدد أجزاء القرآن؟",
      opts: ["12", "20", "30", "60"],
      a: 2,
      info: "القرآن مقسم إلى 30 جزءًا.",
    },
    {
      id: 3,
      q: "كم عدد سور القرآن الكريم؟",
      opts: ["114", "112", "110", "116"],
      a: 0,
      info: "عدد سور المصحف الشريف 114 سورة.",
    },
    {
      id: 4,
      q: "كم ركعة صلاة الفجر؟",
      opts: ["2", "3", "4", "1"],
      a: 0,
      info: "صلاة الفجر ركعتان فرض.",
    },
    {
      id: 5,
      q: "كم ركعة صلاة الظهر؟",
      opts: ["2", "3", "4", "1"],
      a: 2,
      info: "صلاة الظهر أربع ركعات.",
    },
    {
      id: 6,
      q: "كم ركعة صلاة العصر؟",
      opts: ["2", "3", "4", "1"],
      a: 2,
      info: "صلاة العصر أربع ركعات.",
    },
    {
      id: 7,
      q: "كم ركعة صلاة المغرب؟",
      opts: ["2", "3", "4", "1"],
      a: 1,
      info: "صلاة المغرب ثلاث ركعات.",
    },
    {
      id: 8,
      q: "من هو أول من آمن من الرجال؟",
      opts: [
        "علي بن أبي طالب",
        "أبو بكر الصديق",
        "بلال بن رباح",
        "عمر بن الخطاب",
      ],
      a: 1,
      info: "أبو بكر الصديق هو أول من أسلم من الرجال.",
    },
    {
      id: 9,
      q: "من هو مؤذن الرسول ﷺ؟",
      opts: ["بلال بن رباح", "سعد بن معاذ", "حسان بن ثابت", "مصعب بن عمير"],
      a: 0,
      info: "بلال بن رباح رضي الله عنه كان مؤذن الرسول ﷺ.",
    },
    {
      id: 10,
      q: "من الملقب بـ «سيف الله المسلول»؟",
      opts: [
        "خالد بن الوليد",
        "عمر بن الخطاب",
        "طلحة بن عبيد الله",
        "الزبير بن العوام",
      ],
      a: 0,
      info: "خالد بن الوليد لُقّب بسيف الله المسلول.",
    },
    {
      id: 11,
      q: "من الملقب بـ «ذو النورين»؟",
      opts: [
        "علي بن أبي طالب",
        "عثمان بن عفان",
        "عمر بن الخطاب",
        "أبو بكر الصديق",
      ],
      a: 1,
      info: "عثمان بن عفان لُقّب ذو النورين.",
    },
    {
      id: 12,
      q: "في أي غزوة استشهد حمزة بن عبد المطلب؟",
      opts: ["بدر", "أحد", "الخندق", "خَيْبَر"],
      a: 1,
      info: "استشهد حمزة رضي الله عنه في غزوة أحد.",
    },
    {
      id: 13,
      q: "أين كانت القبلة في بداية الإسلام قبل تحويلها إلى الكعبة؟",
      opts: [
        "المسجد الأقصى (القدس)",
        "مدينة طيبة",
        "الكعبة بمكة",
        "مكة وُوجهت دائمًا",
      ],
      a: 0,
      info: "القبلة كانت المسجد الأقصى قبل التحويل إلى الكعبة.",
    },
    {
      id: 14,
      q: "من الذي أمر بنسخ مصاحف موحدة ونشرها؟",
      opts: [
        "أبو بكر الصديق",
        "عمر بن الخطاب",
        "عثمان بن عفان",
        "علي بن أبي طالب",
      ],
      a: 2,
      info: "عثمان بن عفان رضي الله عنه أمر بتوحيد المصاحف ونشرها.",
    },
    {
      id: 15,
      q: "من كُلف بجمع المصحف في عهد أبي بكر رضي الله عنه؟",
      opts: [
        "زيد بن ثابت",
        "عبد الله بن مسعود",
        "معاذ بن جبل",
        "علي بن أبي طالب",
      ],
      a: 0,
      info: "زيد بن ثابت كان من كتّاب الوحي وصُنع إليه الجمع.",
    },
  ];

  /* ---------------------------
     إعدادات القبول/الـ DOM
     -------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    // عناصر HTML المتوقعة (تأكد أن أسماء الـ id تتطابق مع HTML)
    const startBtn = document.getElementById("start-btn");
    const firstScreen = document.getElementById("first-screen");
    const quizScreen = document.getElementById("quiz-screen");
    const resultScreen = document.getElementById("result-screen");
    const optionsEl = document.getElementById("options");
    const questionText = document.getElementById("question-text");
    const changedQuestion = document.getElementById("changed-question");
    const totalQuestionsEl = document.getElementById("total-questions");
    const scoreEl = document.getElementById("score");
    const nextBtn = document.getElementById("next-btn");
    const progressBar = document.getElementById("progress-bar");
    const finalScore = document.getElementById("final-score");
    const totalPossible = document.getElementById("total-possible");
    const restartBtn = document.getElementById("restart-btn");

    if (
      !startBtn ||
      !firstScreen ||
      !quizScreen ||
      !resultScreen ||
      !optionsEl
    ) {
      console.error(
        "script.js: بعض عناصر الـ DOM المطلوبة غير موجودة. تأكد من أن الـ HTML يحتوي على العناصر ذات الـ IDs المتوقعة."
      );
      return;
    }

    /* نُدرج ستايلات مصغرة للـ feedback الصحيح/الخاطئ لضمان رؤية واضحة */
    injectFeedbackStyles();

    const TOTAL = QUESTION_POOL.length; // هنا 15 كما طلبت
    totalQuestionsEl.textContent = TOTAL;
    totalPossible.textContent = TOTAL;

    // حالة التشغيل
    let questions = []; // النسخة المشوشّة من الأسئلة
    let currentIndex = 0;
    let score = 0;
    let selectedOptionIndex = null;
    let optionButtons = []; // مرجع لأزرار الخيارات الحالية

    // بدء: نربط الأزرار
    startBtn.addEventListener("click", () => {
      resetAndStart();
      showScreen(firstScreen, quizScreen); // ننتقل إلى شاشة الاختبار
    });

    nextBtn.addEventListener("click", handleNext);
    restartBtn.addEventListener("click", () => {
      resetAndStart();
      showScreen(resultScreen, quizScreen);
    });

    // عند التحميل: إذا كان هناك نتيجة محفوظة نظهرها كإعلام في console (اختياري)
    try {
      const last = JSON.parse(localStorage.getItem("lastQuizAttempt"));
      if (last) {
        console.info(
          `آخر نتيجة محفوظة: ${last.score}/${last.total} بتاريخ ${new Date(
            last.timestamp
          ).toLocaleString()}`
        );
      }
    } catch (e) {
      /* ignore */
    }

    /* --------------- الدوال الأساسية --------------- */

    // إعادة تعيين ثم بدء الاختبار
    function resetAndStart() {
      // إعداد نسخة جديدة من الأسئلة: خلط ترتيب الأسئلة وخيارات كل سؤال
      questions = shuffleArray(QUESTION_POOL.map((q) => cloneQuestion(q)));
      // بالنسبة لكل سؤال: خلط الخيارات مع الحفاظ على مؤشر الإجابة الصحيحة
      questions.forEach((q) => shuffleOptionsPreserveAnswer(q));
      currentIndex = 0;
      score = 0;
      selectedOptionIndex = null;
      scoreEl.textContent = score;
      nextBtn.disabled = true;
      renderQuestion(currentIndex);
      // حفظ حالة محاولة جديدة (timestamp)
      try {
        localStorage.setItem(
          "lastQuizSeed",
          JSON.stringify({ ts: Date.now() })
        );
      } catch (e) {
        /* ignore localStorage errors */
      }
    }

    // عرض شاشة -> شاشة
    function showScreen(from, to) {
      if (from) {
        from.classList.remove("active");
        from.setAttribute("aria-hidden", "true");
      }
      to.classList.add("active");
      to.setAttribute("aria-hidden", "false");
    }

    // عرض سؤال محدد
    function renderQuestion(i) {
      const item = questions[i];
      if (!item)
        return console.error("renderQuestion: سؤال غير موجود عند الفهرس", i);

      // محتوى
      changedQuestion.textContent = i + 1;
      questionText.textContent = item.q;

      // تنظيف الخيارات القديمة
      optionsEl.innerHTML = "";
      optionButtons = [];
      selectedOptionIndex = null;
      nextBtn.disabled = true;

      // إنشاء أزرار لكل خيار مع سمات الوصولية
      item.opts.forEach((optText, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "option-btn";
        btn.textContent = optText;
        btn.setAttribute("role", "radio");
        btn.setAttribute("aria-checked", "false");
        btn.dataset.optIndex = idx;
        btn.tabIndex = 0;
        // حدث النقر
        btn.addEventListener("click", () => handleSelectOption(idx));
        // دعم لوحة المفاتيح: Enter يختار
        btn.addEventListener("keydown", (ev) => {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            handleSelectOption(idx);
          } else if (ev.key === "ArrowDown" || ev.key === "ArrowRight") {
            ev.preventDefault();
            focusNextOption(idx);
          } else if (ev.key === "ArrowUp" || ev.key === "ArrowLeft") {
            ev.preventDefault();
            focusPrevOption(idx);
          }
        });

        optionsEl.appendChild(btn);
        optionButtons.push(btn);
      });

      // تحديث شريط التقدم (قبل الإجابة)
      updateProgress(i, TOTAL);
    }

    // عند اختيار خيار
    function handleSelectOption(optIdx) {
      // منع الاختيار المتكرر بعد الاختيار النهائي
      if (selectedOptionIndex !== null) return;

      selectedOptionIndex = optIdx;
      // تحديث aria للخيارات
      optionButtons.forEach((b, idx) => {
        b.setAttribute("aria-checked", idx === optIdx ? "true" : "false");
      });

      nextBtn.disabled = false;
    }

    // الانتقال للسؤال التالي أو عرض النتيجة
    function handleNext() {
      // لا نفعل شيء إن لم يتم اختيار خيار
      if (selectedOptionIndex === null) return;

      // منع النقرات المتعددة السريعة
      nextBtn.disabled = true;

      const current = questions[currentIndex];
      const correctIdx = current.a;
      // تقييم الإجابة
      const chosenIsCorrect = selectedOptionIndex === correctIdx;
      if (chosenIsCorrect) score++;

      scoreEl.textContent = score;

      // إظهار ردة فعل مرئية: نضع class على الأزرار
      optionButtons.forEach((b, idx) => {
        if (idx === correctIdx) {
          b.classList.add("q-correct");
          b.style.pointerEvents = "none";
        } else if (idx === selectedOptionIndex) {
          // لو مختار وخاطئ نميّزه
          if (!chosenIsCorrect) b.classList.add("q-wrong");
          b.style.pointerEvents = "none";
        } else {
          b.style.pointerEvents = "none";
        }
      });

      // تحديث شريط التقدم بعد الإجابة (نعتبر الإجابة باعتبار تقدم)
      updateProgress(currentIndex + 1, TOTAL);

      // ننتظر لحظة ثم نستمر (تجربة مستخدم مريحة)
      window.setTimeout(() => {
        currentIndex++;
        if (currentIndex < TOTAL) {
          renderQuestion(currentIndex);
        } else {
          // نهاية: عرض النتيجة
          finalScore.textContent = score;
          // حفظ نتيجة المحاولة
          try {
            const attempt = { score, total: TOTAL, timestamp: Date.now() };
            localStorage.setItem("lastQuizAttempt", JSON.stringify(attempt));
          } catch (e) {
            /* ignore */
          }

          // نعرض شاشة النتيجة
          showScreen(quizScreen, resultScreen);
          // نعيد شريط التقدم إلى 100% بصرياً
          progressBar.style.width = "100%";
        }
      }, 800); // 800ms تأخير للعرض البصري
    }

    /* ---------- Utilities & Helpers ---------- */

    // تحديث شريط التقدّم: i = عدد الأسئلة المكتملة / currentIndex
    function updateProgress(completedCount, totalCount) {
      const pct = Math.round((completedCount / totalCount) * 100);
      progressBar.style.width = pct + "%";
      // لو الحاوية الـ progress لها aria-valuenow، حدّثها
      const progressContainer = progressBar.parentElement;
      if (progressContainer && progressContainer.getAttribute) {
        progressContainer.setAttribute("aria-valuenow", String(pct));
      }
    }

    // يركّز الخيار التالي في القائمة
    function focusNextOption(fromIdx) {
      const next = (fromIdx + 1) % optionButtons.length;
      optionButtons[next].focus();
    }

    function focusPrevOption(fromIdx) {
      const prev = (fromIdx - 1 + optionButtons.length) % optionButtons.length;
      optionButtons[prev].focus();
    }

    // ينسخ السؤال حتى لا نغيّر المصدر الأصلي
    function cloneQuestion(q) {
      return {
        id: q.id,
        q: q.q,
        opts: q.opts.slice(),
        a: q.a,
        info: q.info || "",
      };
    }

    // خلط مصفوفة (Fisher–Yates) — الأفضل عمليًا
    function shuffleArray(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    // خلط الخيارات مع المحافظة على مؤشر الإجابة الصحيح
    function shuffleOptionsPreserveAnswer(question) {
      const opts = question.opts;
      const correctText = opts[question.a];
      const zipped = opts.map((text, idx) => ({ text, idx }));
      const shuffled = shuffleArray(zipped);
      question.opts = shuffled.map((s) => s.text);
      // إعادة حساب مؤشر الإجابة الصحيح بعد الشيفل
      question.a = question.opts.findIndex((t) => t === correctText);
      // safety: if not found (shouldn't happen) ضع 0
      if (question.a === -1) question.a = 0;
    }

    // إضافة CSS صغير لعرض feedback (correct/wrong) دون تعديل ملف CSS
    function injectFeedbackStyles() {
      const css = `
        .q-correct { background: linear-gradient(90deg,#dff6e6,#c7f0d6) !important; border-color: #2ea153 !important; }
        .q-wrong { background: linear-gradient(90deg,#ffecec,#ffd6d6) !important; border-color: #d64646 !important; opacity: 0.95; }
      `;
      const style = document.createElement("style");
      style.type = "text/css";
      style.appendChild(document.createTextNode(css));
      document.head.appendChild(style);
    }

    // بدء تلقائي لو أردت (معطل هنا). تقدر تفعّله بإلغاء التعليق
    // resetAndStart();
  }); // DOMContentLoaded end
})(); // IIFE end
