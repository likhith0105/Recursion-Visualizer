/**
 * visualizer.js
 * Rendering engine for each algorithm's visualization on Canvas.
 * Also manages call stack panel updates.
 */

class Visualizer {
  constructor(canvasId, callStackListId, callStackDepthId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.callStackList = document.getElementById(callStackListId);
    this.callStackDepth = document.getElementById(callStackDepthId);
    this.currentStep = null;
  }

  resize() {
    const wrapper = this.canvas.parentElement;
    const rect = wrapper.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = Math.max(rect.height, 400);
  }

  render(step, algorithmType) {
    this.currentStep = step;
    this.resize();

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    switch (algorithmType) {
      case 'factorial':
        this.renderFactorial(ctx, w, h, step);
        break;
      case 'fibonacci':
        this.renderFibonacci(ctx, w, h, step);
        break;
      case 'hanoi':
        this.renderHanoi(ctx, w, h, step);
        break;
      case 'binarySearch':
        this.renderBinarySearch(ctx, w, h, step);
        break;
    }

    this.renderCallStack(step);
  }

  // ==========================================================
  // FACTORIAL VISUALIZATION
  // ==========================================================

  renderFactorial(ctx, w, h, step) {
    const { callStack, currentN, result } = step;

    // Draw the multiplication chain
    ctx.save();

    const centerY = h / 2 - 30;
    const boxSize = 60;
    const gap = 10;

    // Build boxes
    const boxes = [];
    if (callStack.length > 0) {
      for (let i = 0; i < callStack.length; i++) {
        const entry = callStack[i];
        boxes.push({
          n: entry.params ? entry.params.n : currentN,
          active: i === callStack.length - 1,
          result: entry.result,
        });
      }
    } else {
      boxes.push({ n: currentN, active: false, result: result });
    }

    const totalWidth = boxes.length * boxSize + (boxes.length - 1) * gap;
    const startX = Math.max(20, (w - totalWidth) / 2);

    // Draw arrows and boxes
    for (let i = 0; i < boxes.length; i++) {
      const x = startX + i * (boxSize + gap);
      const y = centerY - boxSize / 2;

      // Arrow from previous box
      if (i > 0) {
        const prevX = startX + (i - 1) * (boxSize + gap) + boxSize;
        ctx.beginPath();
        ctx.moveTo(prevX, centerY);
        ctx.lineTo(prevX + gap / 2, centerY);
        ctx.strokeStyle = boxes[i].active ? '#22c55e' : '#475569';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Arrow head
        ctx.beginPath();
        ctx.moveTo(prevX + gap / 2 + 5, centerY - 5);
        ctx.lineTo(prevX + gap / 2, centerY);
        ctx.lineTo(prevX + gap / 2 + 5, centerY + 5);
        ctx.strokeStyle = boxes[i].active ? '#22c55e' : '#475569';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Box
      ctx.fillStyle = boxes[i].active ? '#4f46e5' : '#1e293b';
      ctx.strokeStyle = boxes[i].active ? '#818cf8' : '#475569';
      ctx.lineWidth = 2;
      this.roundRect(ctx, x, y, boxSize, boxSize, 8);
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.fillStyle = boxes[i].active ? '#fff' : '#94a3b8';
      ctx.font = 'bold 16px Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`f(${boxes[i].n})`, x + boxSize / 2, y + boxSize / 2);

      // Result below
      if (boxes[i].result !== undefined) {
        ctx.fillStyle = '#22c55e';
        ctx.font = '12px Consolas, monospace';
        ctx.fillText(`= ${boxes[i].result}`, x + boxSize / 2, y + boxSize + 16);
      }

      // Active glow
      if (boxes[i].active) {
        ctx.shadowColor = '#818cf8';
        ctx.shadowBlur = 12;
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 2;
        this.roundRect(ctx, x, y, boxSize, boxSize, 8);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    // Step action text
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    this.wrapText(ctx, step.action, 20, h - 60, w - 40, 20);

    ctx.restore();
  }

  // ==========================================================
  // FIBONACCI RECURSION TREE
  // ==========================================================

  renderFibonacci(ctx, w, h, step) {
    const { treeNodes, currentN } = step;
    if (!treeNodes || treeNodes.length === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Generating recursion tree...', w / 2, h / 2);
      return;
    }

    // Calculate tree layout
    const rootNode = treeNodes.find(t => t.parentId === -1);
    if (!rootNode) return;

    // Calculate tree dimensions
    const maxDepth = Math.max(...treeNodes.map(t => t.depth));
    const levelHeight = Math.min(80, (h - 100) / (maxDepth + 1));

    // Count leaf nodes to determine width
    const leafCount = Math.pow(2, maxDepth);
    const leafSpacing = Math.min(60, (w - 40) / leafCount);

    // Position nodes using DFS
    const leafPositions = [];
    function positionNode(nodeId, depth, leftBound, rightBound) {
      const node = treeNodes.find(t => t.id === nodeId);
      if (!node) return;

      const children = treeNodes.filter(t => t.parentId === nodeId)
        .sort((a, b) => a.side === 'left' ? -1 : 1);

      if (children.length === 0) {
        node.x = (leftBound + rightBound) / 2;
        node.y = 40 + depth * levelHeight;
        leafPositions.push({ nodeId, x: node.x });
      } else {
        const mid = (leftBound + rightBound) / 2;
        positionNode(children[0].id, depth + 1, leftBound, mid);
        if (children.length > 1) {
          positionNode(children[1].id, depth + 1, mid, rightBound);
        }
        node.x = mid;
        node.y = 40 + depth * levelHeight;
      }
    }

    positionNode(rootNode.id, 0, 0, w);

    ctx.save();

    // Draw edges first
    for (const node of treeNodes) {
      if (node.parentId !== -1) {
        const parent = treeNodes.find(t => t.id === node.parentId);
        if (parent) {
          ctx.beginPath();
          ctx.moveTo(parent.x, parent.y + 20);
          const cpY = (parent.y + node.y) / 2;
          ctx.quadraticCurveTo(
            (parent.x + node.x) / 2, cpY,
            node.x, node.y - 20
          );
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    const activeNodeId = step.nodeId !== undefined ? step.nodeId : null;

    for (const node of treeNodes) {
      const isActive = node.id === activeNodeId;
      const radius = 28;
      const x = node.x;
      const y = node.y;

      // Node circle
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      if (isActive) {
        grad.addColorStop(0, '#818cf8');
        grad.addColorStop(1, '#4f46e5');
      } else if (node.result !== undefined) {
        grad.addColorStop(0, '#22c55e');
        grad.addColorStop(1, '#16a34a');
      } else {
        grad.addColorStop(0, '#334155');
        grad.addColorStop(1, '#1e293b');
      }

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = isActive ? '#c7d2fe' : '#475569';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.stroke();

      // Node label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, x, y - 4);

      // Result below
      if (node.result !== undefined) {
        ctx.fillStyle = '#86efac';
        ctx.font = '10px Consolas, monospace';
        ctx.fillText(`= ${node.result}`, x, y + 14);
      }
    }

    // Step action
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    this.wrapText(ctx, step.action, 20, h - 10, w - 40, 20);

    ctx.restore();
  }

  // ==========================================================
  // TOWER OF HANOI
  // ==========================================================

  renderHanoi(ctx, w, h, step) {
    const { pegs, action, currentN } = step;
    if (!pegs) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Initializing Tower of Hanoi...', w / 2, h / 2);
      return;
    }

    ctx.save();

    const pegNames = ['A', 'B', 'C'];
    const pegX = {
      A: w * 0.15,
      B: w * 0.5,
      C: w * 0.85,
    };

    const baseY = h - 80;
    const pegHeight = Math.min(250, h * 0.6);
    const diskHeight = 22;
    const maxDiskWidth = w * 0.12;
    const minDiskWidth = 30;

    // Draw base platform
    ctx.fillStyle = '#475569';
    ctx.fillRect(20, baseY, w - 40, 6);

    // Draw pegs and disks
    for (const name of pegNames) {
      const x = pegX[name];
      const disks = pegs[name] || [];

      // Peg line
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x, baseY - pegHeight);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Peg label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(name, x, baseY + 12);

      // Disks
      const diskColors = [
        '#ef4444', '#f59e0b', '#22c55e', '#3b82f6',
        '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
        '#6366f1', '#84cc16'
      ];

      for (let i = 0; i < disks.length; i++) {
        const diskSize = disks[i];
        const diskW = minDiskWidth + (diskSize / currentN) * (maxDiskWidth - minDiskWidth) * 2;
        const diskX = x - diskW / 2;
        const diskY = baseY - (i + 1) * diskHeight - 2;

        const colorIndex = (diskSize - 1) % diskColors.length;
        ctx.fillStyle = diskColors[colorIndex];
        this.roundRect(ctx, diskX, diskY, diskW, diskHeight - 2, 4);
        ctx.fill();

        // Disk number
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(diskSize, x, diskY + (diskHeight - 2) / 2);
      }
    }

    // Action text
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    this.wrapText(ctx, action, 20, h - 10, w - 40, 20);

    ctx.restore();
  }

  // ==========================================================
  // BINARY SEARCH
  // ==========================================================

  renderBinarySearch(ctx, w, h, step) {
    const { arr, target, left, right, mid, foundIndex } = step;
    if (!arr) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Generating array...', w / 2, h / 2);
      return;
    }

    ctx.save();

    const cellWidth = Math.min(56, (w - 80) / arr.length);
    const cellHeight = 48;
    const gap = 4;
    const totalWidth = arr.length * (cellWidth + gap);
    const startX = Math.max(20, (w - totalWidth) / 2 + gap / 2);
    const baseY = h / 2 - cellHeight / 2 - 20;

    // Draw index labels
    ctx.font = '10px Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    for (let i = 0; i < arr.length; i++) {
      const x = startX + i * (cellWidth + gap) + cellWidth / 2;
      ctx.fillStyle = '#64748b';
      ctx.fillText(i, x, baseY - 6);
    }

    // Draw cells
    for (let i = 0; i < arr.length; i++) {
      const x = startX + i * (cellWidth + gap);
      const y = baseY;

      // Determine cell color
      let fillColor = '#1e293b';
      let borderColor = '#475569';
      let textColor = '#f1f5f9';

      if (foundIndex !== undefined && foundIndex >= 0 && i === foundIndex) {
        fillColor = '#166534';
        borderColor = '#22c55e';
        textColor = '#86efac';
      } else if (mid !== undefined && mid >= 0 && i === mid) {
        if (arr[i] === target) {
          fillColor = '#166534';
          borderColor = '#22c55e';
          textColor = '#86efac';
        } else {
          fillColor = '#4f46e5';
          borderColor = '#818cf8';
          textColor = '#c7d2fe';
        }
      } else if (left !== undefined && right !== undefined && i >= left && i <= right) {
        fillColor = '#1e3a5f';
        borderColor = '#3b82f6';
        textColor = '#93c5fd';
      }

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, x, y, cellWidth, cellHeight, 6);
      ctx.fill();
      ctx.stroke();

      // Cell value
      ctx.fillStyle = textColor;
      ctx.font = 'bold 14px Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(arr[i], x + cellWidth / 2, y + cellHeight / 2);
    }

    // Range labels
    if (left !== undefined && right !== undefined && left <= right) {
      const leftX = startX + left * (cellWidth + gap) + cellWidth / 2;
      const rightX = startX + right * (cellWidth + gap) + cellWidth / 2;

      ctx.fillStyle = '#3b82f6';
      ctx.font = '11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('L', leftX, baseY + cellHeight + 4);
      ctx.fillText('R', rightX, baseY + cellHeight + 4);

      // Draw bracket line
      ctx.beginPath();
      ctx.moveTo(leftX, baseY + cellHeight + 16);
      ctx.lineTo(rightX, baseY + cellHeight + 16);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Bracket ends
      ctx.beginPath();
      ctx.moveTo(leftX, baseY + cellHeight + 12);
      ctx.lineTo(leftX, baseY + cellHeight + 20);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(rightX, baseY + cellHeight + 12);
      ctx.lineTo(rightX, baseY + cellHeight + 20);
      ctx.stroke();
    }

    // Mid label
    if (mid !== undefined && mid >= 0) {
      const midX = startX + mid * (cellWidth + gap) + cellWidth / 2;
      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('mid', midX, baseY + cellHeight + 26);
    }

    // Target info
    ctx.fillStyle = '#f59e0b';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`Target: ${target}`, w / 2, baseY - 30);

    // Action text
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    this.wrapText(ctx, step.action, 20, h - 10, w - 40, 20);

    ctx.restore();
  }

  // ==========================================================
  // CALL STACK PANEL
  // ==========================================================

  renderCallStack(step) {
    const { callStack, highlight } = step;
    this.callStackList.innerHTML = '';

    if (!callStack || callStack.length === 0) {
      this.callStackDepth.textContent = '0';
      const empty = document.createElement('div');
      empty.className = 'call-stack-item';
      empty.style.textAlign = 'center';
      empty.style.color = '#64748b';
      empty.textContent = highlight === 'done' ? '✅ Complete!' : '(empty)';
      this.callStackList.appendChild(empty);
      return;
    }

    this.callStackDepth.textContent = callStack.length;

    // Render from bottom to top (deepest first)
    for (let i = callStack.length - 1; i >= 0; i--) {
      const entry = callStack[i];
      const item = document.createElement('div');
      item.className = 'call-stack-item';
      if (i === callStack.length - 1) {
        item.classList.add('active');
      }
      if (entry.result !== undefined && i < callStack.length - 1) {
        item.classList.add('returned');
      }

      const paramsStr = Object.entries(entry.params || {})
        .map(([k, v]) => `${k}=${v}`)
        .join(', ');

      item.innerHTML = `
        <span class="fn-name">${entry.id || 'fn'}</span>
        <span class="fn-params">(${paramsStr})</span>
        ${entry.result !== undefined ? `<span class="fn-result">→ ${entry.result}</span>` : ''}
      `;

      this.callStackList.appendChild(item);
    }
  }

  // ==========================================================
  // HELPERS
  // ==========================================================

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    if (!text) return;
    const words = text.split(' ');
    let line = '';
    let lineY = y;

    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, x + maxWidth / 2, lineY);
        line = word + ' ';
        lineY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x + maxWidth / 2, lineY);
  }
}

