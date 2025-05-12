const avatar = document.getElementById('avatar');
  const dropdown = document.getElementById('dropdown');

  avatar.addEventListener('click', () => {
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  });

  // Optional: hide dropdown when clicking outside
  window.addEventListener('click', (e) => {
    if (!avatar.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });