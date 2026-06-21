(() => {
  if (window.__SAJU_MAIN_FIXED__) return;
  window.__SAJU_MAIN_FIXED__ = true;

  const CONFIG = {
    emailjsPublicKey: 'tl5jPJIoiOMEfjMHj',
    emailjsServiceId: 'service_9oog4dh',
    emailjsTemplateId: 'template_3uwin9a',
    gasWebhookUrl: 'https://script.google.com/macros/s/AKfycbwt3b4mkU-QlduL9RiY_xEa1OB8s4BQzn9V5ruDd2hQI5H421IfsvhgUY54E3eBS6rAjg/exec',
    ...(window.SAJU_CONFIG || {})
  };

  const state = { submitting: false };

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form[name="saju-form"]');
    if (!form) return;

    const els = {
      serviceRadios: document.querySelectorAll('.service-option input[type="radio"]'),
      totalPrice: document.getElementById('totalPrice'),
      person2Section: document.getElementById('person2Section'),
      privacyAgree: document.getElementById('privacyAgree'),
      submitBtn: document.getElementById('submitBtn'),
      modal: document.getElementById('successModal'),
      modalBody: document.getElementById('modalBody'),
      modalClose: document.getElementById('modalClose'),
      modalConfirm: document.getElementById('modalConfirm'),
      scrollToTop: document.getElementById('scrollToTop'),
      navbar: document.getElementById('navbar'),
      faqQuestions: document.querySelectorAll('.faq-question'),
      navToggle: document.getElementById('navToggle'),
      navMenu: document.getElementById('navMenu'),
      navLinks: document.querySelectorAll('.nav-link')
    };

    if (typeof emailjs !== 'undefined') emailjs.init(CONFIG.emailjsPublicKey);

    initDateTimeSelects();
    initNav(els);
    initFaq(els);
    initScroll(els);
    initPhoneFormatter();
    initTimeUnknown();
    initModal(els);

    els.serviceRadios.forEach((radio) => {
      radio.addEventListener('change', () => {
        updateTotalPrice(els);
        togglePerson2(els);
      });
    });

    els.privacyAgree?.addEventListener('change', () => syncSubmitButton(els));

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (state.submitting) return;

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const email = (document.getElementById('email')?.value || '').trim();
      const phone = (document.getElementById('phone')?.value || '').trim();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('올바른 이메일 주소를 입력해주세요.');
        return;
      }

      if (!/^\d{3}-\d{4}-\d{4}$/.test(phone)) {
        alert('올바른 전화번호 형식을 입력해주세요.');
        return;
      }

      const payload = buildPayload();
      if (!payload.selected_services.length) {
        alert('최소 1개 이상의 서비스를 선택해주세요.');
        return;
      }

      if (!CONFIG.gasWebhookUrl) {
        alert('구글시트 웹앱 URL이 없습니다.');
        return;
      }

      if (typeof emailjs === 'undefined') {
        alert('EmailJS가 로드되지 않았습니다.');
        return;
      }

      state.submitting = true;
      syncSubmitButton(els);

      try {
        const sheet = await sendToGoogleSheet(payload);
        if (!sheet.ok) throw new Error(sheet.message || '구글시트 저장 실패');

        const mail = await sendToEmailJS(payload);
        if (!mail || mail.status !== 200) throw new Error('EmailJS 전송 실패');

        showSuccess(els, payload);
        form.reset();
        resetUI(els);
      } catch (error) {
        console.error(error);
        alert(error.message || '전송 실패');
      } finally {
        state.submitting = false;
        syncSubmitButton(els);
      }
    }, true);

    updateTotalPrice(els);
    togglePerson2(els);
    syncSubmitButton(els);
  });

  function initDateTimeSelects() {
    ['1', '2'].forEach((i) => {
      const year = document.getElementById(`birth_year${i}`);
      const month = document.getElementById(`birth_month${i}`);
      const day = document.getElementById(`birth_day${i}`);
      const hour = document.getElementById(`birth_hour${i}`);
      const minute = document.getElementById(`birth_minute${i}`);

      if (year && year.options.length <= 1) {
        const currentYear = new Date().getFullYear();
        for (let y = currentYear; y >= 1930; y--) {
          year.appendChild(new Option(`${y}년`, String(y)));
        }
      }

      if (month && month.options.length <= 1) {
        for (let m = 1; m <= 12; m++) {
          month.appendChild(new Option(`${m}월`, String(m).padStart(2, '0')));
        }
      }

      const renderDays = () => {
        if (!day) return;
        const selected = day.value;
        const y = Number(year?.value) || 2000;
        const m = Number(month?.value) || 1;
        const max = new Date(y, m, 0).getDate();
        day.innerHTML = '<option value="">일</option>';
        for (let d = 1; d <= max; d++) {
          day.appendChild(new Option(`${d}일`, String(d).padStart(2, '0')));
        }
        if (selected && Number(selected) <= max) day.value = selected;
      };

      year?.addEventListener('change', renderDays);
      month?.addEventListener('change', renderDays);
      renderDays();

      if (hour && hour.options.length <= 1) {
        for (let h = 0; h <= 23; h++) {
          hour.appendChild(new Option(`${String(h).padStart(2, '0')}시`, String(h).padStart(2, '0')));
        }
      }

      if (minute && minute.options.length <= 1) {
        for (let m = 0; m <= 59; m++) {
          minute.appendChild(new Option(`${String(m).padStart(2, '0')}분`, String(m).padStart(2, '0')));
        }
      }
    });
  }

  function initNav(els) {
    if (els.navToggle && els.navMenu) {
      els.navToggle.addEventListener('click', () => {
        els.navMenu.classList.toggle('active');
        els.navToggle.classList.toggle('active');
      });
    }

    els.navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        els.navMenu?.classList.remove('active');
        els.navToggle?.classList.remove('active');
      });
    });
  }

  function initFaq(els) {
    els.faqQuestions.forEach((button) => {
      button.addEventListener('click', () => {
        const item = button.closest('.faq-item');
        if (!item) return;
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item.active').forEach((x) => x.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    });
  }

  function initScroll(els) {
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      els.navbar?.classList.toggle('scrolled', y > 20);
      els.scrollToTop?.classList.toggle('show', y > 300);
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    els.scrollToTop?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initPhoneFormatter() {
    const input = document.getElementById('phone');
    if (!input) return;

    input.addEventListener('input', (e) => {
      let v = String(e.target.value || '').replace(/[^\d]/g, '').slice(0, 11);
      if (v.length <= 3) e.target.value = v;
      else if (v.length <= 7) e.target.value = `${v.slice(0, 3)}-${v.slice(3)}`;
      else e.target.value = `${v.slice(0, 3)}-${v.slice(3, 7)}-${v.slice(7)}`;
    });
  }

  function initTimeUnknown() {
    ['1', '2'].forEach((i) => {
      const checkbox = document.getElementById(`time_unknown${i}`);
      const hour = document.getElementById(`birth_hour${i}`);
      const minute = document.getElementById(`birth_minute${i}`);
      if (!checkbox || !hour || !minute) return;

      const sync = () => {
        const off = checkbox.checked;
        hour.disabled = off;
        minute.disabled = off;
        if (off) {
          hour.value = '';
          minute.value = '';
        }
      };

      checkbox.addEventListener('change', sync);
      sync();
    });
  }

  function initModal(els) {
    const close = () => {
      if (els.modal) els.modal.style.display = 'none';
    };
    els.modalClose?.addEventListener('click', close);
    els.modalConfirm?.addEventListener('click', close);
    els.modal?.addEventListener('click', (e) => {
      if (e.target === els.modal) close();
    });
  }

  function syncSubmitButton(els) {
    if (!els.submitBtn) return;
    els.submitBtn.disabled = state.submitting || !els.privacyAgree?.checked;
  }

  function updateTotalPrice(els) {
    const total = [...document.querySelectorAll('.service-option input[type="radio"]:checked')]
      .reduce((sum, input) => sum + Number(input.dataset.price || 0), 0);
    if (els.totalPrice) els.totalPrice.textContent = `${total.toLocaleString('ko-KR')}원`;
  }

  function selectedServices() {
    const defs = [
      { key: 'service_lifelong', label: '평생사주' },
      { key: 'service_newyear', label: '2026년 신년운' },
      { key: 'service_wealth', label: '재물운' },
      { key: 'service_health', label: '건강운' },
      { key: 'service_career', label: '직업운' },
      { key: 'service_compatibility', label: '궁합' }
    ];

    return defs.map((def) => {
      const checked = document.querySelector(`input[name="${def.key}"]:checked`);
      if (!checked || checked.value === 'none') return null;
      return {
        key: def.key,
        label: def.label,
        people: Number(checked.value),
        price: Number(checked.dataset.price || 0)
      };
    }).filter(Boolean);
  }

  function togglePerson2(els) {
    if (!els.person2Section) return;
    const needs = selectedServices().some((s) => s.people === 2);
    els.person2Section.style.display = needs ? 'block' : 'none';

    ['name2', 'gender2', 'birth_year2', 'birth_month2', 'birth_day2'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (needs) el.setAttribute('required', 'required');
      else el.removeAttribute('required');
    });

    if (!needs) {
      ['name2', 'gender2', 'birth_type2', 'birth_year2', 'birth_month2', 'birth_day2', 'birth_hour2', 'birth_minute2'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      const t2 = document.getElementById('time_unknown2');
      if (t2) t2.checked = false;
      const h2 = document.getElementById('birth_hour2');
      const m2 = document.getElementById('birth_minute2');
      if (h2) h2.disabled = false;
      if (m2) m2.disabled = false;
    }
  }

  function genderText(v) {
    if (v === 'male') return '남성';
    if (v === 'female') return '여성';
    return '';
  }

  function birthTypeText(v) {
    return v === 'lunar' ? '음력' : '양력';
  }

  function buildPerson(index) {
    const birthTypeValue = document.getElementById(`birth_type${index}`)?.value || 'solar';
    const year = document.getElementById(`birth_year${index}`)?.value || '';
    const month = document.getElementById(`birth_month${index}`)?.value || '';
    const day = document.getElementById(`birth_day${index}`)?.value || '';
    const hour = document.getElementById(`birth_hour${index}`)?.value || '';
    const minute = document.getElementById(`birth_minute${index}`)?.value || '';
    const timeUnknown = !!document.getElementById(`time_unknown${index}`)?.checked;
    const birthDate = [year, month, day].filter(Boolean).join('-');
    const birthTime = timeUnknown ? '시간 모름' : ((hour || minute) ? `${String(hour || '00').padStart(2, '0')}:${String(minute || '00').padStart(2, '0')}` : '');
    const birthType = birthTypeText(birthTypeValue);
    const birthText = [birthType, birthDate, birthTime ? `/ ${birthTime}` : ''].join(' ').replace(/\s+/g, ' ').trim();

    return {
      name: document.getElementById(`name${index}`)?.value?.trim() || '',
      gender: genderText(document.getElementById(`gender${index}`)?.value || ''),
      birth_type: birthType,
      birth_date: birthDate,
      birth_time: birthTime,
      birth_text: birthText,
      time_unknown: timeUnknown
    };
  }

  function buildPayload() {
    const services = selectedServices();
    const total = [...document.querySelectorAll('.service-option input[type="radio"]:checked')]
      .reduce((sum, input) => sum + Number(input.dataset.price || 0), 0);
    const person1 = buildPerson(1);
    const person2 = services.some((s) => s.people === 2) ? buildPerson(2) : null;

    return {
      submitted_at: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      selected_services: services,
      selected_services_text: services.map((s) => `${s.label} ${s.people}인 (${s.price.toLocaleString('ko-KR')}원)`).join(', '),
      total_price: total,
      total_price_text: `${total.toLocaleString('ko-KR')}원`,
      person1,
      person2,
      phone: document.getElementById('phone')?.value?.trim() || '',
      email: document.getElementById('email')?.value?.trim() || '',
      additional_questions: document.getElementById('additional_questions')?.value?.trim() || ''
    };
  }

  async function sendToGoogleSheet(payload) {
    const response = await fetch(CONFIG.gasWebhookUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { ok: false, message: text || `HTTP ${response.status}` };
    }
  }

  function sendToEmailJS(payload) {
    const templateParams = {
      submitted_at: payload.submitted_at,
      selected_services_text: payload.selected_services_text,
      total_price_text: payload.total_price_text,
      name1: payload.person1.name,
      gender1: payload.person1.gender,
      birth1: payload.person1.birth_text,
      birth_date1: payload.person1.birth_date,
      birth_time1: payload.person1.birth_time,
      birth_type1: payload.person1.birth_type,
      name2: payload.person2?.name || '',
      gender2: payload.person2?.gender || '',
      birth2: payload.person2?.birth_text || '',
      birth_date2: payload.person2?.birth_date || '',
      birth_time2: payload.person2?.birth_time || '',
      birth_type2: payload.person2?.birth_type || '',
      phone: payload.phone,
      email: payload.email,
      additional_questions: payload.additional_questions || '없음',
      message: [
        `접수일시: ${payload.submitted_at}`,
        `신청서비스: ${payload.selected_services_text}`,
        `합계금액: ${payload.total_price_text}`,
        `이름1: ${payload.person1.name}`,
        `성별1: ${payload.person1.gender}`,
        `생년월일1: ${payload.person1.birth_date}`,
        `시간1: ${payload.person1.birth_time}`,
        `양력/음력1: ${payload.person1.birth_type}`,
        payload.person2 ? `이름2: ${payload.person2.name}` : '',
        payload.person2 ? `성별2: ${payload.person2.gender}` : '',
        payload.person2 ? `생년월일2: ${payload.person2.birth_date}` : '',
        payload.person2 ? `시간2: ${payload.person2.birth_time}` : '',
        payload.person2 ? `양력/음력2: ${payload.person2.birth_type}` : '',
        `전화번호: ${payload.phone}`,
        `이메일: ${payload.email}`,
        `추가질문: ${payload.additional_questions || '없음'}`
      ].filter(Boolean).join('\n')
    };
    return emailjs.send(CONFIG.emailjsServiceId, CONFIG.emailjsTemplateId, templateParams);
  }

  function showSuccess(els, payload) {
    const text = `신청 서비스: ${payload.selected_services_text}<br>합계 금액: ${payload.total_price_text}<br><br>입금 확인 후 24시간 내 이메일로 PDF 리포트를 보내드립니다.`;
    if (els.modal && els.modalBody) {
      els.modalBody.innerHTML = text;
      els.modal.style.display = 'flex';
    } else {
      alert(`상담 신청이 정상적으로 접수되었습니다.\n\n신청 서비스: ${payload.selected_services_text}\n합계 금액: ${payload.total_price_text}`);
    }
  }

  function resetUI(els) {
    ['1', '2'].forEach((i) => {
      const checkbox = document.getElementById(`time_unknown${i}`);
      const hour = document.getElementById(`birth_hour${i}`);
      const minute = document.getElementById(`birth_minute${i}`);
      if (checkbox) checkbox.checked = false;
      if (hour) {
        hour.disabled = false;
        hour.value = '';
      }
      if (minute) {
        minute.disabled = false;
        minute.value = '';
      }
    });
    updateTotalPrice(els);
    togglePerson2(els);
  }
})();

Kakao.Channel.createAddChannelButton({
  container: "#kakao-add-channel-button",
  channelPublicId: "_aExbEX", // 카카오톡 채널 홈 URL에 명시된 id로 설정합니다.
})

Kakao.API.request({
  url: "/v1/api/talk/channels",
})
  
   Kakao.Channel.followChannel({
  channelPublicId: "${CHANNEL_PUBLIC_ID}",
})
  .then(function (response) {
    console.log(response)
    // 채널 간편 추가 성공 처리
  })
  .catch(function (error) {
    console.error(error)
    // 채널 간편 추가 실패 처리
  })

