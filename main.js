// ===================================
// 사주마당 - 통합 자바스크립트 (초강력 데이터 추출 보완본)
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initScrollEffects();
    initForm();
    initFAQ();
    initModal();
});

// ===================================
// 1. Navigation (네비게이션)
// ===================================
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.getElementById('navbar');

    if (navToggle) {
        navToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if(navToggle) navToggle.classList.remove('active');
            if(navMenu) navMenu.classList.remove('active');
        });
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection && navbar) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetSection.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    window.addEventListener('scroll', function() {
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });
}

// ===================================
// 2. Scroll Effects (스크롤 효과)
// ===================================
function initScrollEffects() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    if (scrollToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });

        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.service-card, .process-step').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ===================================
// 3. Form Handling (폼 기능 및 전송)
// ===================================
function initForm() {
    const form = document.getElementById('applicationForm');
    const totalPriceElement = document.getElementById('totalPrice');
    const person2Section = document.getElementById('person2Section');
    const serviceRadios = document.querySelectorAll('input[type="radio"][data-price]');
    
    function fillSelect(elementId, start, end, suffix, pad) {
        const el = document.getElementById(elementId);
        if (!el) return;
        let html = '';
        if (start > end) {
            for (let i = start; i >= end; i--) {
                html += `<option value="${i}">${i}${suffix}</option>`;
            }
        } else {
            for (let i = start; i <= end; i++) {
                const val = pad ? String(i).padStart(2, '0') : String(i);
                html += `<option value="${val}">${i}${suffix}</option>`;
            }
        }
        el.innerHTML += html;
    }

    // 존재하는 모든 형태의 ID에 옵션 자동 주입
    ['birth_year1', 'year1', 'birthYear1'].forEach(id => fillSelect(id, new Date().getFullYear(), 1900, '년', false));
    ['birth_month1', 'month1', 'birthMonth1'].forEach(id => fillSelect(id, 1, 12, '월', true));
    ['birth_day1', 'day1', 'birthDay1'].forEach(id => fillSelect(id, 1, 31, '일', true));
    ['birth_hour1', 'hour1', 'birthHour1', 'hour_1'].forEach(id => fillSelect(id, 0, 23, '시', true));
    ['birth_minute1', 'minute1', 'birthMinute1', 'minute_1'].forEach(id => fillSelect(id, 0, 59, '분', true));

    ['birth_year2', 'year2', 'birthYear2'].forEach(id => fillSelect(id, new Date().getFullYear(), 1900, '년', false));
    ['birth_month2', 'month2', 'birthMonth2'].forEach(id => fillSelect(id, 1, 12, '월', true));
    ['birth_day2', 'day2', 'birthDay2'].forEach(id => fillSelect(id, 1, 31, '일', true));
    ['birth_hour2', 'hour2', 'birthHour2', 'hour_2'].forEach(id => fillSelect(id, 0, 23, '시', true));
    ['birth_minute2', 'minute2', 'birthMinute2', 'minute_2'].forEach(id => fillSelect(id, 0, 59, '분', true));

    function calculateTotal() {
        let total = 0;
        let hasTwoPerson = false;

        serviceRadios.forEach(radio => {
            if (radio.checked && radio.value !== 'none') {
                total += parseInt(radio.getAttribute('data-price') || '0');
                if (radio.value === '2') hasTwoPerson = true;
            }
        });

        if (person2Section) {
            if (hasTwoPerson) {
                person2Section.style.display = 'block';
                ['name2', 'gender2', 'birth_year2', 'year2', 'birth_month2', 'month2', 'birth_day2', 'day2'].forEach(id => {
                    const el = document.getElementById(id);
                    if(el) el.required = true;
                });
            } else {
                person2Section.style.display = 'none';
                ['name2', 'gender2', 'birth_year2', 'year2', 'birth_month2', 'month2', 'birth_day2', 'day2'].forEach(id => {
                    const el = document.getElementById(id);
                    if(el) el.required = false;
                });
            }
        }

        if (totalPriceElement) {
            totalPriceElement.textContent = total.toLocaleString('ko-KR') + '원';
        }
    }

    serviceRadios.forEach(radio => radio.addEventListener('change', calculateTotal));
    document.querySelectorAll('input[type="radio"][value="none"]').forEach(radio => radio.addEventListener('change', calculateTotal));

    function setupTimeUnknown(chkId, hourIds, minIds) {
        const chk = document.getElementById(chkId);
        if (chk) {
            chk.addEventListener('change', function() {
                hourIds.concat(minIds).forEach(id => {
                    const el = document.getElementById(id);
                    if(el) {
                        el.disabled = chk.checked;
                        if(chk.checked) el.value = '';
                    }
                });
            });
        }
    }
    setupTimeUnknown('time_unknown1', ['birth_hour1', 'hour1', 'birthHour1', 'hour_1'], ['birth_minute1', 'minute1', 'birthMinute1', 'minute_1']);
    setupTimeUnknown('time_unknown2', ['birth_hour2', 'hour2', 'birthHour2', 'hour_2'], ['birth_minute2', 'minute2', 'birthMinute2', 'minute_2']);

    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^\d]/g, '');
            if (value.length <= 3) e.target.value = value;
            else if (value.length <= 7) e.target.value = value.slice(0, 3) + '-' + value.slice(3);
            else e.target.value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
        });
    }

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const hasSelectedService = Array.from(serviceRadios).some(radio => radio.checked && radio.value !== 'none');
            if (!hasSelectedService) { alert('최소 1개 이상의 서비스를 선택해주세요.'); return; }

            const emailValue = document.getElementById('email').value;
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) { alert('올바른 이메일 주소를 입력해주세요.'); return; }

            const phoneValue = document.getElementById('phone').value;
            if (!/^\d{3}-\d{4}-\d{4}$/.test(phoneValue)) { alert('올바른 전화번호 형식을 입력해주세요.'); return; }

            const formData = collectFormData();
            const nowStr = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
            
            const finalPayload = {
                "접수일": nowStr,
                "상담신청서1": formData.services1.join(', '),
                "이름1": formData.person1.name,
                "성별1": formData.person1.gender,
                "생년월일1": formData.person1.birthDate,
                "시간1": formData.person1.birthTime,
                "양력음력1": formData.person1.birthType,
                "상담신청서2": formData.person2 ? formData.services2.join(', ') : '',
                "이름2": formData.person2 ? formData.person2.name : '',
                "성별2": formData.person2 ? formData.person2.gender : '',
                "생년월일2": formData.person2 ? formData.person2.birthDate : '',
                "시간2": formData.person2 ? formData.person2.birthTime : '',
                "양력음력2": formData.person2 ? formData.person2.birthType : '',
                "합계금액": formData.totalPrice,
                "전화번호": formData.contact.phone,
                "이메일": formData.contact.email,
                "비고": formData.additionalQuestions,

                "to_name": formData.person1.name,
                "접수일시": nowStr,
                "평생사주": formData.emailServices["평생사주"],
                "신년운": formData.emailServices["2026년 신년운"],
                "재물운": formData.emailServices["재물운"],
                "건강운": formData.emailServices["건강운"],
                "직업운": formData.emailServices["직업운"],
                "궁합": formData.emailServices["궁합"]
            };

            fetch("https://script.google.com/macros/s/AKfycbz4TPvT-WUrx47Pjfli9Ib_VKwOBj2is4kRz1SZJkyc-EwF4BkBgOisyXxy4iR7cz8P8A/exec", {
                method: "POST",
                body: JSON.stringify(finalPayload)
            })
            .then(res => res.json())
            .then(data => console.log("✅ 구글 시트 저장 완료:", data))
            .catch(err => console.error("❌ 구글 시트 저장 실패:", err));
            
            showSuccessModal(formData);
            form.reset();
            calculateTotal();
        });
    }
    calculateTotal();
}

function collectFormData() {
    const commentsEl = document.getElementById('comments') || document.getElementById('additional_questions');
    
    // 💡 어떤 ID로 정의되어 있든 무조건 값을 찾아내는 초정밀 탐색기함수
    function findValue(possibleIds) {
        for (let id of possibleIds) {
            const el = document.getElementById(id);
            if (el && el.value !== undefined) return el.value;
        }
        return '';
    }
    
    function getChecked(id) {
        const el = document.getElementById(id);
        return el ? el.checked : false;
    }

    // 💡 합계금액 텍스트 강제 추출 (totalPrice가 안 잡히면 내부 텍스트 전체 검색)
    const priceEl = document.getElementById('totalPrice');
    let totalPriceText = priceEl ? priceEl.textContent : '';
    if(!totalPriceText) {
        const altPrice = document.querySelector('.total-price') || document.querySelector('[path="totalPrice"]');
        totalPriceText = altPrice ? altPrice.textContent : '0원';
    }

    // 1인 시간 추출
    const h1 = findValue(['birth_hour1', 'hour1', 'birthHour1', 'hour_1']);
    const m1 = findValue(['birth_minute1', 'minute1', 'birthMinute1', 'minute_1']);
    const timeStr1 = getChecked('time_unknown1') ? '시간 미상' : (h1 && m1 ? h1 + '시 ' + m1 + '분' : '미입력');

    // 1인 생년월일 추출
    const y1 = findValue(['birth_year1', 'year1', 'birthYear1']);
    const mo1 = findValue(['birth_month1', 'month1', 'birthMonth1']);
    const d1 = findValue(['birth_day1', 'day1', 'birthDay1']);
    const birthStr1 = (y1 && mo1 && d1) ? `${y1}년 ${mo1}월 ${d1}일` : '미입력';

    const data = {
        services1: [],
        services2: [],
        totalPrice: totalPriceText,
        emailServices: { "평생사주": "", "2026년 신년운": "", "재물운": "", "건강운": "", "직업운": "", "궁합": "" },
        person1: {
            name: findValue(['name1', 'birth_name1']),
            gender: findValue(['gender1']) === 'male' ? '남성' : '여성',
            birthType: findValue(['birth_type1', 'birthType1']) === 'solar' ? '양력' : '음력',
            birthDate: birthStr1,
            birthTime: timeStr1
        },
        contact: {
            phone: findValue(['phone', 'telephone']),
            email: findValue(['email', 'user_email'])
        },
        additionalQuestions: commentsEl ? commentsEl.value : ''
    };

    const serviceMapping = {
        'service_lifelong': '평생사주',
        'service_newyear': '2026년 신년운',
        'service_wealth': '재물운',
        'service_health': '건강운',
        'service_career': '직업운',
        'service_compatibility': '궁합'
    };

    Object.keys(serviceMapping).forEach(key => {
        const selected = document.querySelector(`input[name="${key}"]:checked`);
        if (selected && selected.value !== 'none') {
            const label = serviceMapping[key];
            if (selected.value === '1') {
                data.services1.push(`${label} (1인)`);
                data.emailServices[label] = "1인 신청";
            } else if (selected.value === '2') {
                data.services1.push(`${label} (1인)`);
                data.services2.push(`${label} (상대방)`);
                data.emailServices[label] = "2인 신청";
            }
        }
    });

    const p2Sect = document.getElementById('person2Section');
    if (p2Sect && p2Sect.style.display === 'block') {
        const h2 = findValue(['birth_hour2', 'hour2', 'birthHour2', 'hour_2']);
        const m2 = findValue(['birth_minute2', 'minute2', 'birthMinute2', 'minute_2']);
        const timeStr2 = getChecked('time_unknown2') ? '시간 미상' : (h2 && m2 ? h2 + '시 ' + m2 + '분' : '미입력');

        const y2 = findValue(['birth_year2', 'year2', 'birthYear2']);
        const mo2 = findValue(['birth_month2', 'month2', 'birthMonth2']);
        const d2 = findValue(['birth_day2', 'day2', 'birthDay2']);
        const birthStr2 = (y2 && mo2 && d2) ? `${y2}년 ${mo2}월 ${d2}일` : '미입력';

        data.person2 = {
            name: findValue(['name2', 'birth_name2']),
            gender: findValue(['gender2']) === 'male' ? '남성' : '여성',
            birthType: findValue(['birth_type2', 'birthType2']) === 'solar' ? '양력' : '음력',
            birthDate: birthStr2,
            birthTime: timeStr2
        };
    }
    return data;
}

// ===================================
// 4. FAQ Accordion (자주 묻는 질문)
// ===================================
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const q = item.querySelector('.faq-question');
        if(q) {
            q.addEventListener('click', function() {
                faqItems.forEach(other => {
                    if (other !== item && other.classList.contains('active')) {
                        other.classList.remove('active');
                    }
                });
                item.classList.toggle('active');
            });
        }
    });
}

// ===================================
// 5. Modal (결과 팝업창)
// ===================================
function initModal() {
    const modal = document.getElementById('successModal');
    const closeBtn = document.getElementById('modalClose');
    const confirmBtn = document.getElementById('modalConfirm');

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (confirmBtn) confirmBtn.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal();
        });
    }
}

function showSuccessModal(formData) {
    const modal = document.getElementById('successModal');
    const body = document.getElementById('modalBody');
    if (!modal || !body) return;

    let displayServices = [...formData.services1];
    if(formData.services2.length > 0) {
        displayServices = displayServices.concat(formData.services2);
    }

    let html = `
        <p><strong>신청 서비스:</strong><br>${displayServices.join('<br>')}</p>
        <p><strong>합계 금액:</strong> ${formData.totalPrice}</p>
        <hr style="margin:1rem 0; border:none; border-top:1px solid #E5E1D8;">
        <p><strong>신청자 정보 (1인):</strong><br>
        이름: ${formData.person1.name} (${formData.person1.gender})<br>
        생년월일: ${formData.person1.birthDate} (${formData.person1.birthType})<br>
        태어난 시간: ${formData.person1.birthTime}</p>
    `;

    if (formData.person2) {
        html += `
            <p><strong>신청자 정보 (2인):</strong><br>
            이름: ${formData.person2.name} (${formData.person2.gender})<br>
            생년월일: ${formData.person2.birthDate} (${formData.person2.birthType})<br>
            태어난 시간: ${formData.person2.birthTime}</p>
        `;
    }

    html += `
        <hr style="margin:1rem 0; border:none; border-top:1px solid #E5E1D8;">
        <p><strong>연락처:</strong><br>
        전화: ${formData.contact.phone}<br>
        이메일: ${formData.contact.email}</p>
        <p><strong>추가 질문:</strong><br>${formData.additionalQuestions}</p>
        <hr style="margin:1rem 0; border:none; border-top:1px solid #E5E1D8;">
        <p style="color:#8B6F47; font-weight:600;">
        <i class="fas fa-info-circle"></i> 다음 단계:<br>
        <small style="font-weight:normal;">
        1. 농협 351-1377-7789-03 (문광희)로 ${formData.totalPrice}을 입금해주세요<br>
        2. 입금 후 010-9486-4936으로 연락주시거나 입금자명을 남겨주세요<br>
        3. 24시간 내 ${formData.contact.email}로 PDF 리포트를 발송해드립니다
        </small>
        </p>
    `;
    body.innerHTML = html;
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) modal.classList.remove('active');
}