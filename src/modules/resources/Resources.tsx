import React, { useState } from 'react';
import { Quiz } from './Quiz';

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
type Category = 'Programming Concepts' | 'Databases' | 'Computer Networks' | 'Algorithms';



export const Resources: React.FC = () => {
  const [category, setCategory] = useState<Category | ''>('');
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Resources</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <select value={category} onChange={e => setCategory(e.target.value as Category | '')}>
          <option value="">All Categories</option>
          <option>Programming Concepts</option>
          <option>Databases</option>
          <option>Computer Networks</option>
          <option>Algorithms</option>
        </select>
        <select value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty | '')}>
          <option value="">All Levels</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
      </div>

      <div style={{ marginBottom: 18 }}>
        <p style={{ margin: 0 }}>Try the interactive quiz area — practice short-answer and fill-in questions derived from past papers.</p>
      </div>

      <div>
        {/* Demo quiz (Paper 1) */}
        <React.Suspense fallback={<div>Loading quiz…</div>}>
          {/* Lazy-load Quiz to keep bundle small later if desired */}
          <Quiz />
        </React.Suspense>
      </div>

    </div>
  );
}
