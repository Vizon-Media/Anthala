document.addEventListener("DOMContentLoaded", () => {
  // Initialize vertical resizer (between left and right panels)
  const verticalResizer = document.getElementById('verticalResizer');
  const leftPanel = document.getElementById('leftPanel');
  const rightPanel = document.querySelector('.right-small');
  
  // Initialize horizontal resizer (between top and bottom panels)
  const horizontalResizer = document.getElementById('horizontalResizer');
  const topPanel = document.getElementById('topPanel');
  const bottomPanel = document.querySelector('.bottom-small');

  // Set initial sizes based on viewport
  function setInitialSizes() {
    // Set initial width for left panel (60% of container width)
    const containerWidth = document.querySelector('.main-container').offsetWidth;
    leftPanel.style.width = '60%';
    rightPanel.style.width = '40%';
    
    // Set initial height for top panel (60% of right panel height)
    const rightPanelHeight = rightPanel.offsetHeight;
    topPanel.style.height = '60%';
    // bottomPanel.style.height = '40%'; // Eliminat - lăsăm CSS-ul să controleze înălțimea
  }

  // Vertical resizer functionality
  if (verticalResizer && leftPanel && rightPanel) {
    verticalResizer.addEventListener('mousedown', initResize, false);
  }

  // Horizontal resizer functionality
  if (horizontalResizer && topPanel && bottomPanel) {
    horizontalResizer.addEventListener('mousedown', initResize, false);
  }

  function initResize(e) {
    e.preventDefault();
    
    const isVertical = this === verticalResizer;
    const startX = e.clientX;
    const startY = e.clientY;
    
    // Get initial dimensions
    const leftWidth = leftPanel.offsetWidth;
    const topHeight = topPanel.offsetHeight;
    const containerWidth = document.querySelector('.main-container').offsetWidth;
    const rightHeight = rightPanel.offsetHeight;

    // Set cursor style
    document.body.style.cursor = isVertical ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';

    function onMouseMove(e) {
      if (isVertical) {
        // Calculate new width for left panel
        const dx = e.clientX - startX;
        const newLeftWidth = ((leftWidth + dx) * 100) / containerWidth;
        
        // Apply constraints (min 20%, max 80%)
        const constrainedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
        
        leftPanel.style.width = `${constrainedWidth}%`;
        rightPanel.style.width = `${100 - constrainedWidth}%`;
      } else {
        // Calculate new height for top panel
        const dy = e.clientY - startY;
        const newTopHeight = ((topHeight + dy) * 100) / rightHeight;
        
        // Apply constraints (min 20%, max 80%)
        const constrainedHeight = Math.min(Math.max(newTopHeight, 20), 80);
        
        topPanel.style.height = `${constrainedHeight}%`;
        // bottomPanel.style.height = `${100 - constrainedHeight}%`; // Eliminat - lăsăm CSS-ul să controleze
      }
    }

    function onMouseUp() {
      // Remove event listeners
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      // Reset cursor and selection
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    // Add event listeners
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  // Set initial sizes when the page loads
  window.addEventListener('load', setInitialSizes);
  window.addEventListener('resize', setInitialSizes);
});
