const cards = document.querySelectorAll('.detail-card');

cards.forEach((card, index) => {
  card.classList.add(index % 2 === 0 ? 'from-left' : 'from-right');
});

const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.25 });

cards.forEach(card => observer.observe(card));
