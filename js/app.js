/**
 * app.js
 * Main application controller — ties together algorithms, visualizer, and UI.
 */

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});

class App {
  constructor() {
    // DOM elements
    this.algorithmSelect = document.getElementById('algorithm-select');
    this.inputValue = document.getElementById('input-value');
    this.generateBtn = document.getElementById('generate-btn');
    this.playBtn = document.getElementById('play-btn');
    this.pauseBtn = document.getElementById('pause-btn');
    this.prevBtn = document.getElementById('prev-btn');
    this.nextBtn = document.getElementById('next-btn');
    this.resetBtn = document.getElementById('reset-btn');
    this.speedControl = document.getElementById('speed-control');
    this.speedLabel = document.getElementById('speed-label');
    this.placeholder = document.querySelector('.placeholder');
    this.visualizationContent = document.getElementById('visualization-content');
    this.canvas = document.getElementById('visualization-canvas');

    // Tab elements
    this.tabBtns = document.querySelectorAll('.tab-btn');
    this.tabContents = {
      description: document.getElementById('description-tab'),
      code: document.getElementById('code-tab'),
      complexity: document.getElementById('complexity-tab'),
    };
    this.algorithmCode = document.getElementById('algorithm-code');

    // State
    this.steps = [];
    this.currentStepIndex = -1;
    this.isPlaying = false;
    this.playInterval = null;
    this.currentAlgorithm = 'factorial';

    // Visualizer
    this.visualizer = new Visualizer('visualization-canvas', 'call-stack-list', 'call-stack-depth');

    // Bind methods
    this.handleAlgorithmChange = this.handleAlgorithmChange.bind(this);
    this.handleGenerate = this.handleGenerate.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.handlePrev = this.handlePrev.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleSpeedChange = this.handleSpeedChange.bind(this);
    this.handleTabClick = this.handleTabClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
  }

  init() {
    // Event listeners
    this.algorithmSelect.addEventListener('change', this.handleAlgorithmChange);
    this.generateBtn.addEventListener('click', this.handleGenerate);
    this.playBtn.addEventListener('click', this.handlePlay);
    this.pauseBtn.addEventListener('click', this.handlePause);
    this.prevBtn.addEventListener('click', this.handlePrev);
    this.nextBtn.addEventListener('click', this.handleNext);
    this.resetBtn.addEventListener('click', this.handleReset);
    this.speedControl.addEventListener('input', this.handleSpeedChange);
    this.tabBtns.forEach(btn => btn.addEventListener('click', this.handleTabClick));
    window.addEventListener('resize', this.onWindowResize);
    document.addEventListener('keydown', this.handleKeyDown);

    // Load default algorithm info
    this.loadAlgorithmInfo('factorial');
    this.updateInputMax('factorial');
  }

  // ============================================================
  // HANDLERS
  // ============================================================

  handleAlgorithmChange() {
    this.currentAlgorithm = this.algorithmSelect.value;
    this.loadAlgorithmInfo(this.currentAlgorithm);
    this.updateInputMax(this.currentAlgorithm);
    this.handleReset();
  }

  handleGenerate() {
    const n = parseInt(this.inputValue.value);
    if (isNaN(n) || n < 1) {
      this.inputValue.value = 1;
      return;
    }

    const algorithm = this.currentAlgorithm;
    const max = this.getMaxValue(algorithm);

    if (n > max) {
      this.inputValue.value = max;
    }

    const finalN = parseInt(this.inputValue.value);

    // Generate steps
    this.steps = ALGORITHMS[algorithm].generateSteps(finalN);
    this.currentStepIndex = 0;

    // Show visualization
    this.placeholder.style.display = 'none';
    this.visualizationContent.style.display = 'flex';

    // Enable controls
    this.enableControls(true);
    this.renderCurrentStep();

    // Update input label for binary search (show what target was picked)
    if (algorithm === 'binarySearch') {
      const lastStep = this.steps[this.steps.length - 1];
      if (lastStep && lastStep.target) {
        // The target is shown in the canvas
      }
    }
  }

  handlePlay() {
    if (this.isPlaying) return;
    if (this.currentStepIndex >= this.steps.length - 1) {
      this.currentStepIndex = 0;
    }
    this.isPlaying = true;
    this.playBtn.disabled = true;
    this.pauseBtn.disabled = false;
    this.prevBtn.disabled = true;
    this.nextBtn.disabled = true;
    this.generateBtn.disabled = true;
    this.algorithmSelect.disabled = true;

    const speed = parseInt(this.speedControl.value);
    this.playInterval = setInterval(() => {
      if (this.currentStepIndex < this.steps.length - 1) {
        this.currentStepIndex++;
        this.renderCurrentStep();
      } else {
        this.handlePause();
      }
    }, speed);
  }

  handlePause() {
    this.isPlaying = false;
    this.playBtn.disabled = false;
    this.pauseBtn.disabled = true;
    this.prevBtn.disabled = false;
    this.nextBtn.disabled = false;
    this.generateBtn.disabled = false;
    this.algorithmSelect.disabled = false;

    if (this.playInterval) {
      clearInterval(this.playInterval);
      this.playInterval = null;
    }
  }

  handlePrev() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.renderCurrentStep();
    }
  }

  handleNext() {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      this.renderCurrentStep();
    }
  }

  handleReset() {
    this.handlePause();
    this.steps = [];
    this.currentStepIndex = -1;
    this.placeholder.style.display = 'block';
    this.visualizationContent.style.display = 'none';
    this.enableControls(false);
  }

  handleSpeedChange() {
    const val = this.speedControl.value;
    this.speedLabel.textContent = val;

    // If playing, update interval speed
    if (this.isPlaying) {
      this.handlePause();
      this.handlePlay();
    }
  }

  handleTabClick(e) {
    const tab = e.target.dataset.tab;
    this.tabBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    Object.keys(this.tabContents).forEach(key => {
      this.tabContents[key].classList.remove('active');
    });
    this.tabContents[tab].classList.add('active');
  }

  handleKeyDown(e) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (!this.nextBtn.disabled) this.nextBtn.click();
    } else if (e.key === ' ') {
      e.preventDefault();
      if (this.steps.length === 0) return;
      if (this.isPlaying) {
        this.handlePause();
      } else {
        this.handlePlay();
      }
    } else if (e.key === 'ArrowLeft' && !this.prevBtn.disabled) {
      e.preventDefault();
      this.prevBtn.click();
    } else if (e.key === 'Escape') {
      this.handleReset();
    }
  }

  onWindowResize() {
    if (this.currentStepIndex >= 0 && this.steps.length > 0) {
      this.visualizer.resize();
      this.visualizer.render(this.steps[this.currentStepIndex], this.currentAlgorithm);
    }
  }

  // ============================================================
  // RENDERING
  // ============================================================

  renderCurrentStep() {
    if (this.currentStepIndex < 0 || this.currentStepIndex >= this.steps.length) return;

    const step = this.steps[this.currentStepIndex];
    this.visualizer.render(step, this.currentAlgorithm);

    // Update button states
    this.prevBtn.disabled = this.currentStepIndex <= 0;
    this.nextBtn.disabled = this.currentStepIndex >= this.steps.length - 1;

    // If at the end, stop auto-play
    if (this.currentStepIndex >= this.steps.length - 1 && this.isPlaying) {
      this.handlePause();
    }
  }

  // ============================================================
  // UI HELPERS
  // ============================================================

  enableControls(enabled) {
    this.playBtn.disabled = !enabled;
    this.prevBtn.disabled = !enabled;
    this.nextBtn.disabled = !enabled;
    this.resetBtn.disabled = !enabled;
    if (enabled) {
      this.prevBtn.disabled = this.currentStepIndex <= 0;
      this.nextBtn.disabled = this.currentStepIndex >= this.steps.length - 1;
    }
  }

  loadAlgorithmInfo(algo) {
    const info = ALGORITHMS[algo];
    if (!info) return;

    // Description tab
    this.tabContents.description.innerHTML = info.description;

    // Code tab
    this.algorithmCode.textContent = info.code;

    // Complexity tab
    this.tabContents.complexity.innerHTML = `
      <h3 style="color: #818cf8; margin-bottom: 8px;">Complexity Analysis</h3>
      <p style="font-size: 1.1rem;">${info.complexity}</p>
      <div style="margin-top: 20px; padding: 16px; background: #0f172a; border-radius: 8px;">
        <h4 style="color: #f59e0b; margin-bottom: 8px;">💡 Key Insight</h4>
        ${this.getInsight(algo)}
      </div>
    `;
  }

  getInsight(algo) {
    switch (algo) {
      case 'factorial':
        return `<p>The recursive factorial is a <strong>linear recursion</strong> — each call makes at most one recursive call, so the call stack depth is O(n). This is an example of <strong>tail-recursive-adjacent</strong> structure.</p>`;
      case 'fibonacci':
        return `<p>Naive Fibonacci uses <strong>tree recursion</strong> — each call branches into two, leading to O(2ⁿ) time. This is why <strong>memoization</strong> or <strong>dynamic programming</strong> is preferred for Fibonacci.</p>`;
      case 'hanoi':
        return `<p>The Tower of Hanoi has a beautiful recursive pattern: move n-1 disks, move the largest, move n-1 again. This gives O(2ⁿ) time, which is minimal for this problem — it's provably impossible to solve in fewer moves!</p>`;
      case 'binarySearch':
        return `<p>Binary search <strong>halves</strong> the search space at each step, giving O(log n) time. This is the power of <strong>divide and conquer</strong> — exponential savings over linear search!</p>`;
      default:
        return '';
    }
  }

  updateInputMax(algo) {
    const input = this.inputValue;
    const max = this.getMaxValue(algo);
    input.max = max;
    input.placeholder = `1-${max}`;
    if (parseInt(input.value) > max) {
      input.value = max > 10 ? 10 : max;
    }
  }

  getMaxValue(algo) {
    switch (algo) {
      case 'factorial': return 20;
      case 'fibonacci': return 15;
      case 'hanoi': return 7;
      case 'binarySearch': return 30;
      default: return 20;
    }
  }
}

