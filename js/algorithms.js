/**
 * algorithms.js
 * Step-generator functions for each recursive algorithm.
 * Each algorithm returns an array of "steps" that the visualizer renders.
 */

const ALGORITHMS = {};

// ============================================================
// 1. FACTORIAL
// ============================================================

ALGORITHMS.factorial = {
  name: 'Factorial',
  description: `
    <p><strong>Factorial</strong> is a classic recursive function where <code>n! = n × (n-1)!</code>.</p>
    <p>Base case: <code>0! = 1</code> and <code>1! = 1</code></p>
    <p>The function calls itself with decreasing values of <code>n</code> until it reaches the base case, then returns values back up the call stack.</p>
  `,
  code: `function factorial(n) {
  // Base case
  if (n <= 1) return 1;

  // Recursive case
  return n * factorial(n - 1);
}`,
  complexity: 'Time: O(n) | Space: O(n) (call stack)',
  generateSteps(n) {
    const steps = [];
    const callStack = [];

    function simulate(currentN, depth) {
      const callId = `factorial(${currentN})`;

      // ENTER
      callStack.push({ id: callId, params: { n: currentN }, depth });
      steps.push({
        type: 'enter',
        callId,
        callStack: callStack.map(c => ({ ...c })),
        currentN,
        depth,
        action: `Calling factorial(${currentN})`,
        highlight: 'enter',
      });

      if (currentN <= 1) {
        // BASE CASE - RETURN 1
        callStack[callStack.length - 1].result = 1;
        steps.push({
          type: 'return',
          callId,
          callStack: callStack.map(c => ({ ...c })),
          currentN,
          result: 1,
          depth,
          action: `Base case: factorial(${currentN}) = 1`,
          highlight: 'base',
        });
        callStack.pop();
        return 1;
      } else {
        // RECURSIVE CALL
        steps.push({
          type: 'compute',
          callId,
          callStack: callStack.map(c => ({ ...c })),
          currentN,
          depth,
          action: `Computing: ${currentN} × factorial(${currentN - 1})`,
          highlight: 'compute',
        });

        const subResult = simulate(currentN - 1, depth + 1);
        const result = currentN * subResult;

        callStack[callStack.length - 1].result = result;
        steps.push({
          type: 'return',
          callId,
          callStack: callStack.map(c => ({ ...c })),
          currentN,
          result,
          depth,
          action: `Returning: ${currentN} × ${subResult} = ${result}`,
          highlight: 'return',
        });
        callStack.pop();
        return result;
      }
    }

    simulate(n, 0);
    steps.push({
      type: 'done',
      callId: `factorial(${n})`,
      callStack: [],
      currentN: n,
      result: factorialCalc(n),
      action: `✅ Final result: factorial(${n}) = ${factorialCalc(n)}`,
      highlight: 'done',
    });
    return steps;
  }
};

function factorialCalc(n) {
  if (n <= 1) return 1;
  return n * factorialCalc(n - 1);
}

// ============================================================
// 2. FIBONACCI
// ============================================================

ALGORITHMS.fibonacci = {
  name: 'Fibonacci',
  description: `
    <p><strong>Fibonacci</strong> generates the sequence where each number is the sum of the two preceding ones.</p>
    <p><code>F(n) = F(n-1) + F(n-2)</code></p>
    <p>Base cases: <code>F(0) = 0</code>, <code>F(1) = 1</code></p>
    <p>The recursion tree grows exponentially — a great example of why naive recursion can be inefficient!</p>
  `,
  code: `function fibonacci(n) {
  // Base cases
  if (n === 0) return 0;
  if (n === 1) return 1;

  // Recursive case
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
  complexity: 'Time: O(2ⁿ) | Space: O(n) (call stack)',
  generateSteps(n) {
    const steps = [];
    const callStack = [];
    const treeNodes = [];
    let nodeId = 0;

    function simulate(currentN, depth, parentId, side) {
      const id = nodeId++;
      const callId = `fib(${currentN})`;
      const node = { id, label: `fib(${currentN})`, depth, parentId, side, x: 0, y: 0 };

      treeNodes.push(node);
      callStack.push({ id: callId, params: { n: currentN }, depth, nodeId: id });

      steps.push({
        type: 'enter',
        callId,
        callStack: callStack.map(c => ({ ...c })),
        currentN,
        depth,
        nodeId: id,
        treeNodes: treeNodes.map(t => ({ ...t })),
        action: `Calling fib(${currentN})`,
        highlight: 'enter',
      });

      let result;
      if (currentN === 0) {
        result = 0;
        node.result = result;
        callStack[callStack.length - 1].result = result;
        steps.push({
          type: 'return',
          callId,
          callStack: callStack.map(c => ({ ...c })),
          currentN,
          result,
          depth,
          nodeId: id,
          treeNodes: treeNodes.map(t => ({ ...t })),
          action: `Base case: fib(0) = 0`,
          highlight: 'base',
        });
        callStack.pop();
        return result;
      } else if (currentN === 1) {
        result = 1;
        node.result = result;
        callStack[callStack.length - 1].result = result;
        steps.push({
          type: 'return',
          callId,
          callStack: callStack.map(c => ({ ...c })),
          currentN,
          result,
          depth,
          nodeId: id,
          treeNodes: treeNodes.map(t => ({ ...t })),
          action: `Base case: fib(1) = 1`,
          highlight: 'base',
        });
        callStack.pop();
        return result;
      } else {
        steps.push({
          type: 'compute',
          callId,
          callStack: callStack.map(c => ({ ...c })),
          currentN,
          depth,
          nodeId: id,
          treeNodes: treeNodes.map(t => ({ ...t })),
          action: `Computing: fib(${currentN - 1}) + fib(${currentN - 2})`,
          highlight: 'compute',
        });

        const left = simulate(currentN - 1, depth + 1, id, 'left');
        const right = simulate(currentN - 2, depth + 1, id, 'right');
        result = left + right;

        node.result = result;
        callStack[callStack.length - 1].result = result;
        steps.push({
          type: 'return',
          callId,
          callStack: callStack.map(c => ({ ...c })),
          currentN,
          result,
          depth,
          nodeId: id,
          treeNodes: treeNodes.map(t => ({ ...t })),
          action: `Returning: ${left} + ${right} = ${result}`,
          highlight: 'return',
        });
        callStack.pop();
        return result;
      }
    }

    simulate(n, 0, -1, 'root');
    steps.push({
      type: 'done',
      callId: `fib(${n})`,
      callStack: [],
      currentN: n,
      result: fibCalc(n),
      treeNodes: treeNodes.map(t => ({ ...t })),
      action: `✅ Final result: fib(${n}) = ${fibCalc(n)}`,
      highlight: 'done',
    });
    return steps;
  }
};

function fibCalc(n) {
  if (n === 0) return 0;
  if (n === 1) return 1;
  return fibCalc(n - 1) + fibCalc(n - 2);
}

// ============================================================
// 3. TOWER OF HANOI
// ============================================================

ALGORITHMS.hanoi = {
  name: 'Tower of Hanoi',
  description: `
    <p><strong>Tower of Hanoi</strong> is a puzzle where you move <code>n</code> disks from the source peg to the destination peg.</p>
    <p>Rules:</p>
    <ul>
      <li>Only one disk can be moved at a time</li>
      <li>A larger disk cannot be placed on a smaller disk</li>
      <li>The auxiliary peg is used as temporary storage</li>
    </ul>
    <p>The recursive solution moves <code>n-1</code> disks to auxiliary, moves the largest disk, then moves <code>n-1</code> from auxiliary to destination.</p>
  `,
  code: `function hanoi(n, source, dest, aux) {
  if (n === 1) {
    console.log(\`Move disk 1 from \${source} to \${dest}\`);
    return;
  }
  hanoi(n - 1, source, aux, dest);
  console.log(\`Move disk \${n} from \${source} to \${dest}\`);
  hanoi(n - 1, aux, dest, source);
}`,
  complexity: 'Time: O(2ⁿ) | Space: O(n) (call stack)',
  generateSteps(n) {
    const steps = [];
    const callStack = [];

    // Initial pegs: source = [n, n-1, ..., 1], aux = [], dest = []
    const pegs = {
      A: Array.from({ length: n }, (_, i) => n - i),
      B: [],
      C: [],
    };
    let moveCount = 0;

    function snapshotPegs() {
      return {
        A: [...pegs.A],
        B: [...pegs.B],
        C: [...pegs.C],
      };
    }

    function simulate(count, source, dest, aux, depth) {
      const callId = `hanoi(${count}, ${source}, ${dest}, ${aux})`;

      callStack.push({ id: callId, params: { n: count, source, dest, aux }, depth });
      steps.push({
        type: 'enter',
        callId,
        callStack: callStack.map(c => ({ ...c })),
        currentN: count,
        pegs: snapshotPegs(),
        depth,
        action: `Calling hanoi(${count}, ${source}, ${dest}, ${aux})`,
        highlight: 'enter',
      });

      if (count === 1) {
        const disk = pegs[source].pop();
        pegs[dest].push(disk);
        moveCount++;
        callStack[callStack.length - 1].result = `Move disk ${disk} ${source}→${dest}`;
        steps.push({
          type: 'move',
          callId,
          callStack: callStack.map(c => ({ ...c })),
          currentN: count,
          pegs: snapshotPegs(),
          disk,
          from: source,
          to: dest,
          depth,
          action: `Move disk ${disk} from ${source} to ${dest}`,
          highlight: 'move',
          moveCount,
        });
        callStack.pop();
        return;
      }

      // Move n-1 from source to aux
      simulate(count - 1, source, aux, dest, depth + 1);

      // Move largest disk
      const disk = pegs[source].pop();
      pegs[dest].push(disk);
      moveCount++;
      steps.push({
        type: 'move',
        callId,
        callStack: callStack.map(c => ({ ...c })),
        currentN: count,
        pegs: snapshotPegs(),
        disk,
        from: source,
        to: dest,
        depth,
        action: `Move disk ${disk} from ${source} to ${dest}`,
        highlight: 'move',
        moveCount,
      });

      // Move n-1 from aux to dest
      simulate(count - 1, aux, dest, source, depth + 1);

      callStack.pop();
    }

    simulate(n, 'A', 'C', 'B', 0);
    steps.push({
      type: 'done',
      callId: `hanoi(${n}, A, C, B)`,
      callStack: [],
      pegs: snapshotPegs(),
      action: `✅ Puzzle solved in ${moveCount} moves!`,
      highlight: 'done',
      moveCount,
    });
    return steps;
  }
};

// ============================================================
// 4. RECURSIVE BINARY SEARCH
// ============================================================

ALGORITHMS.binarySearch = {
  name: 'Binary Search',
  description: `
    <p><strong>Binary Search</strong> finds a target value in a sorted array by repeatedly dividing the search range in half.</p>
    <p>At each step, it compares the middle element with the target:</p>
    <ul>
      <li>If the middle is the target → found!</li>
      <li>If target < middle → search the left half</li>
      <li>If target > middle → search the right half</li>
    </ul>
    <p>Base case: if left > right, the target is not in the array.</p>
  `,
  code: `function binarySearch(arr, target, left, right) {
  if (left > right) return -1; // Not found

  const mid = Math.floor((left + right) / 2);

  if (arr[mid] === target) return mid; // Found!
  if (target < arr[mid])
    return binarySearch(arr, target, left, mid - 1);
  else
    return binarySearch(arr, target, mid + 1, right);
}`,
  complexity: 'Time: O(log n) | Space: O(log n) (call stack)',
  generateSteps(n) {
    // Generate a sorted array of size n
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    // Pick a random target from the array
    const targetIndex = Math.floor(Math.random() * n);
    const target = arr[targetIndex];

    const steps = [];
    const callStack = [];

    function simulate(left, right, depth) {
      const callId = `binarySearch(arr, ${target}, ${left}, ${right})`;

      callStack.push({ id: callId, params: { target, left, right }, depth });
      steps.push({
        type: 'enter',
        callId,
        callStack: callStack.map(c => ({ ...c })),
        arr: [...arr],
        target,
        left,
        right,
        depth,
        action: `Searching for ${target} in range [${left}, ${right}]`,
        highlight: 'enter',
      });

      if (left > right) {
        callStack[callStack.length - 1].result = -1;
        steps.push({
          type: 'return',
          callId,
          callStack: callStack.map(c => ({ ...c })),
          arr: [...arr],
          target,
          left,
          right,
          mid: -1,
          result: -1,
          depth,
          action: `Base case: range empty → ${target} not found`,
          highlight: 'base',
        });
        callStack.pop();
        return -1;
      }

      const mid = Math.floor((left + right) / 2);
      steps.push({
        type: 'compute',
        callId,
        callStack: callStack.map(c => ({ ...c })),
        arr: [...arr],
        target,
        left,
        right,
        mid,
        depth,
        action: `Middle index: ${mid}, value: ${arr[mid]}`,
        highlight: 'compute',
      });

      if (arr[mid] === target) {
        callStack[callStack.length - 1].result = mid;
        steps.push({
          type: 'return',
          callId,
          callStack: callStack.map(c => ({ ...c })),
          arr: [...arr],
          target,
          left,
          right,
          mid,
          result: mid,
          found: true,
          foundIndex: mid,
          depth,
          action: `✅ Found! arr[${mid}] = ${target}`,
          highlight: 'found',
        });
        callStack.pop();
        return mid;
      } else if (target < arr[mid]) {
        steps.push({
          type: 'compute',
          callId,
          callStack: callStack.map(c => ({ ...c })),
          arr: [...arr],
          target,
          left,
          right,
          mid,
          depth,
          action: `${target} < ${arr[mid]}, searching left half [${left}, ${mid - 1}]`,
          highlight: 'compute',
        });
        const result = simulate(left, mid - 1, depth + 1);

        callStack[callStack.length - 1].result = result;
        steps.push({
          type: 'return',
          callId,
          callStack: callStack.map(c => ({ ...c })),
          arr: [...arr],
          target,
          left,
          right,
          mid,
          result,
          depth,
          action: `Returning ${result} from left search`,
          highlight: 'return',
        });
        callStack.pop();
        return result;
      } else {
        steps.push({
          type: 'compute',
          callId,
          callStack: callStack.map(c => ({ ...c })),
          arr: [...arr],
          target,
          left,
          right,
          mid,
          depth,
          action: `${target} > ${arr[mid]}, searching right half [${mid + 1}, ${right}]`,
          highlight: 'compute',
        });
        const result = simulate(mid + 1, right, depth + 1);

        callStack[callStack.length - 1].result = result;
        steps.push({
          type: 'return',
          callId,
          callStack: callStack.map(c => ({ ...c })),
          arr: [...arr],
          target,
          left,
          right,
          mid,
          result,
          depth,
          action: `Returning ${result} from right search`,
          highlight: 'return',
        });
        callStack.pop();
        return result;
      }
    }

    const result = simulate(0, arr.length - 1, 0);
    steps.push({
      type: 'done',
      callId: `binarySearch(arr, ${target}, 0, ${arr.length - 1})`,
      callStack: [],
      arr: [...arr],
      target,
      result,
      action: result !== -1
        ? `✅ Found ${target} at index ${result}`
        : `❌ ${target} not found in the array`,
      highlight: 'done',
      foundIndex: result,
    });
    return steps;
  }
};

