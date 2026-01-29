// Stockfish Web Worker wrapper
// Creates a worker that communicates with the Stockfish engine

let worker = null;
let isEngineReady = false;
let pendingResolve = null;

const initEngine = () => {
  return new Promise((resolve, reject) => {
    if (worker && isEngineReady) {
      resolve();
      return;
    }

    try {
      // Load stockfish from public folder - it creates its own internal web worker
      const stockfishPath = '/stockfish-17.1-lite-single-03e3232.js';
      worker = new Worker(stockfishPath);

      worker.onmessage = (e) => {
        const message = e.data;

        if (message === 'uciok') {
          isEngineReady = true;
          resolve();
        }

        // Handle bestmove response
        if (pendingResolve && message.startsWith('bestmove')) {
          const match = message.match(/^bestmove\s+(\S+)/);
          if (match) {
            pendingResolve(match[1]);
            pendingResolve = null;
          }
        }
      };

      worker.onerror = (err) => {
        reject(err);
      };

      // Initialize UCI protocol
      worker.postMessage('uci');
    } catch (err) {
      reject(err);
    }
  });
};

const getBestMove = (fen, depth) => {
  return new Promise((resolve) => {
    if (!worker || !isEngineReady) {
      resolve(null);
      return;
    }

    pendingResolve = resolve;
    worker.postMessage(`position fen ${fen}`);
    worker.postMessage(`go depth ${depth}`);
  });
};

const terminate = () => {
  if (worker) {
    worker.postMessage('quit');
    worker.terminate();
    worker = null;
    isEngineReady = false;
    pendingResolve = null;
  }
};

export { initEngine, getBestMove, terminate };
