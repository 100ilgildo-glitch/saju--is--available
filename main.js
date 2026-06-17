(() => {
  if (window.__SAJU_MAIN_INITIALIZED__) return;
  window.__SAJU_MAIN_INITIALIZED__ = true;

  const CONFIG = {
    emailjsPublicKey: 'tl5jPJIoiOMEfjMHj',
    emailjsServiceId: 'service_9oog4dh',
    emailjsTemplateId: 'template_3uwin9a',
    gasWebhookUrl: 'https://script.google.com/macros/s/AKfycbx9SVUUk7-zpBiJ4gBObT-vvEGl7qzf5-_S_STdk0JGFmY4zoS6EiIDkCIiHTH5Kzxu/exec',
    ...(window.SAJU_CONFIG || {})
  };

  const STATE = {
    isSubmitting: false
  };

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form[name="saju-form"]');
    if (!form) return;

    const els = {
      navbar: document.getElementById('navbar'),
      navToggle: document.getElementById('navToggle'),
      navMenu: document.getElementById('navMenu'),
      navLinks: document.querySelectorAll('.nav-link'),
      scrollToTop: document.getElementById('scrollToTop'),
      faqQuestions: document.querySelectorAll('.faq-question'),
      serviceRadios: document.querySelectorAll('.service-option input[type="radio"]'),
      totalPrice: document.getElementById('totalPrice'),
      person2Section: document.getElementById('person2Section'),
      privacyAgree: document.getElementById('privacyAgree'),
      submitBtn: document.getElementById('submitBtn'),
      modal: document.getElementById('successModal'),
      modalBody: document.getElementById('modalBody'),
      modalClose: document.getElementById('modalClose'),
      modalConfirm: document.getElementById('modalConfirm')
    };

    initEmailJS();
    initSelectOptions();
    initNav(els);
    initFaq(els);
    initScroll(els);
    initServiceSelection(els);
    initPhoneFormatter();
    initTimeUnknownHandlers();
    initModal(els);
    initForm(els, form);

    togglePerson2Section(els);
    updateTotalPriceUI(els);
    syncSubmitState(els);
  });

  function initEmailJS() {
    if (typeof emailjs === 'undefined') {
      console.error('EmailJS가 로드되지 않았습니다.');
      return;
    }

    try {
      emailjs.init(CONFIG.emailjsPublicKey);
    } catch (error) {
      console.error('EmailJS 초기화 실패:', error);
    }
  }

  function initSelectOptions() {
    populateYearMonthDay('1');
    populateYearMonthDay('2');
    populateTimeSelects('1');
    populateTimeSelects('2');
  }

  function populateYearMonthDay(index) {
    const yearEl = document.getElementById(`birth_year${index}`);
    const monthEl = document.getElementById(`birth_month${index}`);
    const dayEl = document.getElementById(`birth_day${index}`);

    if (!yearEl || !monthEl || !dayEl) return;

    if (yearEl.options.length <= 1) {
      const currentYear = new Date().getFullYear();
      for (let year = currentYear; year >= 1930; year -= 1) {
        yearEl.appendChild(new Option(`${year}년`, String(year)));
      }
    }

    if (monthEl.options.length <= 1) {
      for (let month = 1; month <= 12; month += 1) {
        monthEl.appendChild(new Option(`${month}월`, String(month).padStart(2, '0')));
      }
    }

    const renderDays = () => {
      const selectedDay = dayEl.value;
      const year = Number(yearEl.value) || 2000;
      const month = Number(monthEl.value) || 1;
      const daysInMonth = new Date(year, month, 0).getDate();

      dayEl.innerHTML = '<option value="">일</option>';
      for (let day = 1; day <= daysInMonth; day += 1) {
        dayEl.appendChild(new Option(`${day}일`, String(day).padStart(2, '0')));
      }

      if (selectedDay && Number(selectedDay) <= daysInMonth) {
        dayEl.value = selectedDay;
      }
    };

    yearEl.addEventListener('change', renderDays);
    monthEl.addEventListener('change', renderDays);
    renderDays();
  }

  function populateTimeSelects(index) {
    const hourEl = document.getElementById(`birth_hour${index}`);
    const minuteEl = document.getElementById(`birth_minute${index}`);

    if (hourEl && hourEl.options.length <= 1) {
      for (let hour = 0; hour <= 23; hour += 1) {
        hourEl.appendChild(new Option(`${String(hour).padStart(2, '0')}시`, String(hour).padStart(2, '0')));
      }
    }

    if (minuteEl && minuteEl.options.length <= 1) {
      for (let minute = 0; minute <= 59; minute += 1) {
        minuteEl.appendChild(new Option(`${String(minute).padStart(2, '0')}분`, String(minute).padStart(2, '0')));
      }
    }
  }

  function initNav(els) {
    if (els.navToggle && els.navMenu) {
      els.navToggle.addEventListener('click', () => {
        els.navMenu.classList.toggle('active');
        els.navToggle.classList.toggle('active');
      });
    }

    els.navLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;

        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        els.navMenu?.classList.remove('active');
        els.navToggle?.classList.remove('active');
      });
    });

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#' || anchor.classList.contains('nav-link')) return;

        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function initFaq(els) {
    els.faqQuestions.forEach((button) => {
      button.addEventListener('click', () => {
        const item = button.closest('.faq-item');
        if (!item) return;

        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item.active').forEach((activeItem) => {
          activeItem.classList.remove('active');
        });

        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
  }

  function initScroll(els) {
    const handleScroll = () => {
      const y = window.scrollY || window.pageYOffset;

      if (els.navbar) {
        els.navbar.classList.toggle('scrolled', y > 20);
      }

      if (els.scrollToTop) {
        els.scrollToTop.classList.toggle('show', y > 300);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    els.scrollToTop?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initServiceSelection(els) {
    els.serviceRadios.forEach((radio) => {
      radio.addEventListener('change', () => {
        updateTotalPriceUI(els);
        togglePerson2Section(els);
      });
    });
  }

  function initPhoneFormatter() {
    const phoneInput = document.getElementById('phone');
    if (!phoneInput) return;

    phoneInput.addEventListener('input', (event) => {
      let value = String(event.target.value || '').replace(/[^\d]/g, '');
      if (value.length > 11) value = value.slice(0, 11);

      if (value.length <= 3) {
        event.target.value = value;
      } else if (value.length <= 7) {
        event.target.value = `${value.slice(0, 3)}-${value.slice(3)}`;
      } else {
        event.target.value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
      }
    });
  }

  function initTimeUnknownHandlers() {
    ['1', '2'].forEach((index) => {
      const checkbox = document.getElementById(`time_unknown${index}`);
      const hourEl = document.getElementById(`birth_hour${index}`);
      const minuteEl = document.getElementById(`birth_minute${index}`);
      if (!checkbox || !hourEl || !minuteEl) return;

      const sync = () => {
        const disabled = checkbox.checked;
        hourEl.disabled = disabled;
        minuteEl.disabled = disabled;

        if (disabled) {
          hourEl.value = '';
          minuteEl.value = '';
        }
      };

      checkbox.addEventListener('change', sync);
      sync();
    });
  }

  function initModal(els) {
    const closeModal = () => {
      if (els.modal) els.modal.style.display = 'none';
    };

    els.modalClose?.addEventListener('click', closeModal);
    els.modalConfirm?.addEventListener('click', closeModal);
    els.modal?.addEventListener('click', (event) => {
      if (event.target === els.modal) closeModal();
    });
  }

  function initForm(els, form) {
    els.privacyAgree?.addEventListener('change', () => syncSubmitState(els));

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (STATE.isSubmitting) return;

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const emailValue = document.getElementById('email')?.value?.trim() || '';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        alert('올바른 이메일 주소를 입력해주세요.');
        return;
      }

      const phoneValue = document.getElementById('phone')?.value?.trim() || '';
      if (!/^\d{3}-\d{4}-\d{4}$/.test(phoneValue)) {
        alert('올바른 전화번호 형식을 입력해주세요.');
        return;
      }

      const payload = buildPayload();

      if (!payload.selected_services.length) {
        alert('최소 1개 이상의 상담 서비스를 선택해주세요.');
        return;
      }

      if (!CONFIG.gasWebhookUrl) {
        alert('Google Sheet 웹앱 URL이 설정되지 않았습니다. window.SAJU_CONFIG.gasWebhookUrl에 Apps Script /exec 주소를 넣어주세요.');
        return;
      }

      if (typeof emailjs === 'undefined') {
        alert('EmailJS가 로드되지 않았습니다.');
        return;
      }

      STATE.isSubmitting = true;
      syncSubmitState(els);

      try {
        const [sheetResult, emailResult] = await Promise.allSettled([
          sendToGoogleSheet(payload),
          sendToEmailJS(payload)
        ]);

        const sheetOk = sheetResult.status === 'fulfilled';
        const emailOk = emailResult.status === 'fulfilled';

        if (!sheetOk || !emailOk) {
          console.error('Google Sheet 결과:', sheetResult);
          console.error('EmailJS 결과:', emailResult);
          throw new Error('일부 전송 실패');
        }

        showSuccessModal(els, payload);
        form.reset();
        resetFormUI(els);
      } catch (error) {
        console.error('상담 신청 전송 오류:', error);
        alert('상담 신청 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        STATE.isSubmitting = false;
        syncSubmitState(els);
      }
    }, true);
  }

  function updateTotalPriceUI(els) {
    const total = calculateTotalPrice();
    if (els.totalPrice) {
      els.totalPrice.textContent = `${total.toLocaleString('ko-KR')}원`;
    }
  }

  function calculateTotalPrice() {
    return [...document.querySelectorAll('.service-option input[type="radio"]:checked')]
      .reduce((sum, input) => sum + Number(input.dataset.price || 0), 0);
  }

  function togglePerson2Section(els) {
    if (!els.person2Section) return;

    const needsPerson2 = selectedServices().some((service) => service.people === 2);
    els.person2Section.style.display = needsPerson2 ? 'block' : 'none';

    ['name2', 'gender2', 'birth_year2', 'birth_month2', 'birth_day2'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      if (needsPerson2) {
        el.setAttribute('required', 'required');
      } else {
        el.removeAttribute('required');
      }
    });

    if (!needsPerson2) {
      clearPerson2Fields();
    }
  }

  function clearPerson2Fields() {
    ['name2', 'gender2', 'birth_type2', 'birth_year2', 'birth_month2', 'birth_day2', 'birth_hour2', 'birth_minute2'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    const timeUnknown2 = document.getElementById('time_unknown2');
    if (timeUnknown2) timeUnknown2.checked = false;

    const hour2 = document.getElementById('birth_hour2');
    const minute2 = document.getElementById('birth_minute2');
    if (hour2) hour2.disabled = false;
    if (minute2) minute2.disabled = false;
  }

  function syncSubmitState(els) {
    if (!els.submitBtn) return;
    const agreed = !!els.privacyAgree?.checked;
    els.submitBtn.disabled = STATE.isSubmitting || !agreed;
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

    return defs
      .map((def) => {
        const checked = document.querySelector(`input[name="${def.key}"]:checked`);
        if (!checked || checked.value === 'none') return null;
        return {
          key: def.key,
          label: def.label,
          people: Number(checked.value),
          price: Number(checked.dataset.price || 0)
        };
      })
      .filter(Boolean);
  }

  function genderText(value) {
    if (value === 'male') return '남성';
    if (value === 'female') return '여성';
    return '';
  }

  function birthTypeText(value) {
    return value === 'lunar' ? '음력' : '양력';
  }

  function buildBirthData(index) {
    const birthTypeValue = document.getElementById(`birth_type${index}`)?.value || 'solar';
    const year = document.getElementById(`birth_year${index}`)?.value || '';
    const month = document.getElementById(`birth_month${index}`)?.value || '';
    const day = document.getElementById(`birth_day${index}`)?.value || '';
    const hour = document.getElementById(`birth_hour${index}`)?.value || '';
    const minute = document.getElementById(`birth_minute${index}`)?.value || '';
    const timeUnknown = !!document.getElementById(`time_unknown${index}`)?.checked;

    const birthDate = [year, month, day].filter(Boolean).join('-');
    const birthTime = timeUnknown
      ? '시간 모름'
      : ((hour || minute) ? `${String(hour || '00').padStart(2, '0')}:${String(minute || '00').padStart(2, '0')}` : '');

    const birthText = [birthTypeText(birthTypeValue), birthDate, birthTime ? `/ ${birthTime}` : '']
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      birth_type: birthTypeText(birthTypeValue),
      birth_date: birthDate,
      birth_time: birthTime,
      birth_text: birthText,
      time_unknown: timeUnknown
    };
  }

  function buildPerson(index) {
    const birth = buildBirthData(index);
    return {
      name: document.getElementById(`name${index}`)?.value?.trim() || '',
      gender: genderText(document.getElementById(`gender${index}`)?.value || ''),
      birth_type: birth.birth_type,
      birth_date: birth.birth_date,
      birth_time: birth.birth_time,
      birth_text: birth.birth_text,
      time_unknown: birth.time_unknown
    };
  }

  function buildPayload() {
    const services = selectedServices();
    const totalPrice = calculateTotalPrice();
    const person1 = buildPerson(1);
    const needsPerson2 = services.some((service) => service.people === 2);
    const person2 = needsPerson2 ? buildPerson(2) : null;

    return {
      submitted_at: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      selected_services: services,
      selected_services_text: services.map((s) => `${s.label} ${s.people}인 (${s.price.toLocaleString('ko-KR')}원)`).join(', '),
      total_price: totalPrice,
      total_price_text: `${totalPrice.toLocaleString('ko-KR')}원`,
      person1,
      person2,
      phone: document.getElementById('phone')?.value?.trim() || '',
      email: document.getElementById('email')?.value?.trim() || '',
      additional_questions: document.getElementById('additional_questions')?.value?.trim() || ''
    };
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
      additional_questions: payload.additional_questions || '없음'
    };

    return emailjs.send(
      CONFIG.emailjsServiceId,
      CONFIG.emailjsTemplateId,
      templateParams
    );
  }

  function sendToGoogleSheet(payload) {
    return fetch(CONFIG.gasWebhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });
  }

  function showSuccessModal(els, payload) {
    const message = `신청 서비스: ${payload.selected_services_text}<br>합계 금액: ${payload.total_price_text}<br><br>입금 확인 후 24시간 내 이메일로 PDF 리포트를 보내드립니다.`;

    if (els.modal && els.modalBody) {
      els.modalBody.innerHTML = message;
      els.modal.style.display = 'flex';
      return;
    }

    alert(`상담 신청이 정상적으로 접수되었습니다.\n\n신청 서비스: ${payload.selected_services_text}\n합계 금액: ${payload.total_price_text}`);
  }

  function resetFormUI(els) {
    ['1', '2'].forEach((index) => {
      const timeUnknown = document.getElementById(`time_unknown${index}`);
      const hourEl = document.getElementById(`birth_hour${index}`);
      const minuteEl = document.getElementById(`birth_minute${index}`);

      if (timeUnknown) timeUnknown.checked = false;
      if (hourEl) {
        hourEl.disabled = false;
        hourEl.value = '';
      }
      if (minuteEl) {
        minuteEl.disabled = false;
        minuteEl.value = '';
      }
    });

    updateTotalPriceUI(els);
    togglePerson2Section(els);
  }
})();
