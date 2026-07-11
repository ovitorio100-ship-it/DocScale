document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Fade-up Animations with Intersection Observer
    const fadeElements = document.querySelectorAll('.fade-up');
    
    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    });

    fadeElements.forEach(el => fadeObserver.observe(el));

    // 2. FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all others
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-answer').style.maxHeight = null;
            });

            if (!isActive) {
                item.classList.add('active');
                const answer = item.querySelector('.faq-answer');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });

    // 3. Modal Logic
    const modal = document.getElementById('lead-modal');
    const openBtns = document.querySelectorAll('.open-modal');
    const closeBtn = document.querySelector('.modal-close');
    const form = document.getElementById('lead-form');
    
    const openModal = (e) => {
        if(e) e.preventDefault();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    openBtns.forEach(btn => btn.addEventListener('click', openModal));
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // 4. WhatsApp Mask & Validation
    const waInput = document.getElementById('whatsapp');
    
    if (waInput) {
        waInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 11) val = val.slice(0,11);
            
            let formatted = '';
            if (val.length > 0) formatted = '(' + val.substring(0, 2);
            if (val.length > 2) formatted += ') ' + val.substring(2, 7);
            if (val.length > 7) formatted += '-' + val.substring(7, 11);
            
            e.target.value = formatted;
        });
    }

    // Form Submission
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const inputs = form.querySelectorAll('input[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('error');
                    isValid = false;
                } else {
                    input.classList.remove('error');
                }
            });

            // WhatsApp length validation (aprox 14-15 chars with formatting)
            if (waInput && waInput.value.length < 14) {
                waInput.classList.add('error');
                isValid = false;
            }

            if (isValid) {
                // Fire GTM Event
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    'event': 'lead_form_submit'
                });

                // Fire Meta Pixel Event
                if (typeof fbq === 'function') {
                    fbq('track', 'Lead');
                }

                const btn = form.querySelector('button[type="submit"]');
                if (btn) {
                    const originalText = btn.textContent;
                    btn.textContent = 'PROCESSANDO...';
                    btn.style.pointerEvents = 'none';

                    const nomeEl = document.getElementById('name');
                    const emailEl = document.getElementById('email');
                    const specialtyEl = document.getElementById('specialty');
                    const revenueEl = document.getElementById('revenue');

                    const SUPABASE_URL = 'https://wxxhsuprddzprnrwovwi.supabase.co';
                    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4eGhzdXByZGR6cHJucndvdndpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExOTk5NjAsImV4cCI6MjA5Njc3NTk2MH0.dUzaz0tcZKTPyVlKOwimKRKW05swtWvT2NWHe0AqTtA';

                    fetch(`${SUPABASE_URL}/functions/v1/landing-page-lead`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                            'apikey': SUPABASE_ANON_KEY,
                        },
                        body: JSON.stringify({
                            org: 'docscale',
                            pagina: 'forms',
                            nome: nomeEl ? nomeEl.value.trim() : '',
                            email: emailEl ? emailEl.value.trim() : '',
                            telefone: waInput ? waInput.value : '',
                            especialidade: specialtyEl ? specialtyEl.value.trim() : '',
                            faturamento: revenueEl ? revenueEl.value : '',
                        }),
                    })
                    .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
                    .then(({ ok, data }) => {
                        if (!ok || !data.ok) throw new Error((data && data.error) || 'Falha ao enviar inscrição');

                        btn.textContent = 'INSCRIÇÃO REALIZADA!';
                        btn.style.background = 'var(--color-green)';

                        setTimeout(() => {
                            if (typeof closeModal === 'function') closeModal();
                            form.reset();
                            btn.textContent = originalText;
                            btn.style.background = '';
                            btn.style.pointerEvents = '';
                            
                            // Redirect to WhatsApp
                            const waMessage = encodeURIComponent('Olá! Preenchi o formulário no site e gostaria de garantir meu ingresso para o DocScale.');
                            window.location.href = `https://api.whatsapp.com/send?phone=553497996286&text=${waMessage}`;
                        }, 2000);
                    })
                    .catch(() => {
                        btn.textContent = 'ERRO. TENTE NOVAMENTE';
                        btn.style.background = '#c0392b';
                        setTimeout(() => {
                            btn.textContent = originalText;
                            btn.style.background = '';
                            btn.style.pointerEvents = '';
                        }, 2500);
                    });
                }
            }
        });

        // Remove error class on input
        form.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('error');
            });
        });
    }

    // Batch Countdown Logic (Evergreen 3 days)
    const countdownEl = document.getElementById('batch-countdown');
    if (countdownEl) {
        const daysEl = document.getElementById('cd-days');
        const hoursEl = document.getElementById('cd-hours');
        
        let batchTurnDateStr = localStorage.getItem('docscale_countdown_end');
        let batchTurnDate = parseInt(batchTurnDateStr);
        const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
        
        // If not set, invalid, or already expired, set new deadline 3 days from now
        if (!batchTurnDate || isNaN(batchTurnDate) || new Date().getTime() > batchTurnDate) {
            batchTurnDate = new Date().getTime() + threeDaysMs;
            localStorage.setItem('docscale_countdown_end', batchTurnDate);
        }
        
        const updateCountdown = () => {
            const now = new Date().getTime();
            let distance = batchTurnDate - now;
            
            // If expired during session, reset it again
            if (distance < 0 || isNaN(distance)) {
                batchTurnDate = new Date().getTime() + threeDaysMs;
                localStorage.setItem('docscale_countdown_end', batchTurnDate);
                distance = batchTurnDate - now;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            if(daysEl) daysEl.innerText = days.toString().padStart(2, '0');
            if(hoursEl) hoursEl.innerText = hours.toString().padStart(2, '0');
            if(document.getElementById('cd-minutes')) document.getElementById('cd-minutes').innerText = minutes.toString().padStart(2, '0');
            if(document.getElementById('cd-seconds')) document.getElementById('cd-seconds').innerText = seconds.toString().padStart(2, '0');
        };
        
        updateCountdown();
        setInterval(updateCountdown, 1000); // Update every second
    }

    // Video Play Button Logic
    const videoWrappers = document.querySelectorAll('.video-wrapper');
    videoWrappers.forEach(wrapper => {
        const video = wrapper.querySelector('video');
        const playBtn = wrapper.querySelector('.custom-play-btn');
        
        if(video && playBtn) {
            video.addEventListener('play', () => {
                playBtn.style.opacity = '0';
            });
            video.addEventListener('pause', () => {
                playBtn.style.opacity = '1';
            });
            video.addEventListener('ended', () => {
                playBtn.style.opacity = '1';
            });
        }
    });

});
