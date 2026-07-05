import { Document, ChatMessage, QuizQuestion, Flashcard, ConceptNode, ConceptLink } from '../types';

export const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'Machine Learning Foundations.pdf',
    size: '1.8 MB',
    uploadDate: '2 days ago',
    type: 'pdf',
    status: 'processed',
    pageCount: 24,
    concepts: ['Supervised Learning', 'Loss Functions', 'Gradient Descent', 'Neural Networks', 'Overfitting'],
    summary: 'This document covers the core mathematical and conceptual foundations of machine learning. It starts with simple linear regression, progresses through optimization techniques like stochastic gradient descent, and introduces deep neural network architectures, backpropagation, and regularization methods.'
  },
  {
    id: 'doc-2',
    name: 'Chapter 4 Notes.pdf',
    size: '4.2 MB',
    uploadDate: '1 day ago',
    type: 'pdf',
    status: 'processed',
    pageCount: 12,
    concepts: ['Markov Decision Processes', 'Dynamic Programming', 'Value Iteration', 'Bellman Equation'],
    summary: 'A detailed study note explaining Markov Decision Processes (MDPs) in Reinforcement Learning. It details the transition dynamics, reward structures, Bellman expectation and optimality equations, and algorithms for finding optimal policies through Value Iteration and Policy Iteration.'
  },
  {
    id: 'doc-3',
    name: 'Introduction to NLP.docx',
    size: '850 KB',
    uploadDate: '5 hours ago',
    type: 'docx',
    status: 'processed',
    pageCount: 8,
    concepts: ['Tokenization', 'TF-IDF', 'Word Embeddings', 'Transformer Models', 'Attention Mechanism'],
    summary: 'An introductory reading on Natural Language Processing. It contrasts classic statistical NLP methods (TF-IDF, bag-of-words) with modern deep learning representations (Word2Vec, GloVe), culminating in a conceptual overview of the Transformer architecture and self-attention.'
  },
  {
    id: 'doc-4',
    name: 'Quantum Computing Primer.pptx',
    size: '12.4 MB',
    uploadDate: 'Just now',
    type: 'pptx',
    status: 'processing',
    pageCount: 35,
    concepts: ['Qubits', 'Superposition', 'Entanglement', 'Shor\'s Algorithm'],
    summary: 'A comprehensive lecture slide deck reviewing the physics and computational models of Quantum Computing. Covers quantum bits (qubits), Bloch sphere representations, quantum gates, entanglement, and famous algorithms including Shor\'s factoring and Grover\'s search.'
  }
];

export const mockDashboardStats = {
  studyHours: 18.5,
  quizzesCompleted: 6,
  documentsProcessed: 4,
  studyStreak: 5, // days
  weeklyProgress: [
    { day: 'Mon', hours: 1.5 },
    { day: 'Tue', hours: 3.2 },
    { day: 'Wed', hours: 2.0 },
    { day: 'Thu', hours: 4.5 },
    { day: 'Fri', hours: 3.8 },
    { day: 'Sat', hours: 2.5 },
    { day: 'Sun', hours: 1.0 }
  ]
};

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'm-1',
    role: 'assistant',
    content: 'Welcome, scholar. I have analyzed your uploaded documents, including "Machine Learning Foundations.pdf" and "Chapter 4 Notes.pdf". Ask me anything, and I will cite exact pages and sections to support my answers.',
    timestamp: '5 hours ago'
  },
  {
    id: 'm-2',
    role: 'user',
    content: 'Can you explain the difference between L1 and L2 regularization as described in the Machine Learning Foundations PDF?',
    timestamp: '4 hours ago'
  },
  {
    id: 'm-3',
    role: 'assistant',
    content: `According to **Section 3.2 (Page 14)** of *Machine Learning Foundations.pdf*, the key differences between L1 and L2 regularization are:

1. **L1 Regularization (Lasso)**:
   - Adds the sum of absolute values of the weights ($||w||_1$) to the loss function.
   - Mathematically represented as: $L_{new} = L_{old} + \\lambda \\sum |w_i|$.
   - Drives weights to **exactly zero**, creating sparse feature selections. Excellent for feature elimination.

2. **L2 Regularization (Ridge)**:
   - Adds the sum of squared values of the weights ($||w||_2^2$) to the loss function.
   - Mathematically represented as: $L_{new} = L_{old} + \\lambda \\sum w_i^2$.
   - Mutes weights to be **very small but non-zero**. It distributes the weight penalty across all parameters, preventing any single feature from dominating.

*Context Citation: "Under L1, the optimal weight values frequently collapse to 0 at the axes, whereas L2 creates a smooth hypersphere constraint." (p. 15)*`,
    timestamp: '4 hours ago'
  },
  {
    id: 'm-4',
    role: 'user',
    content: 'Which one is better when I have high-dimensional data with many irrelevant features?',
    timestamp: '15 mins ago'
  },
  {
    id: 'm-5',
    role: 'assistant',
    content: `For high-dimensional data with many suspected irrelevant features, **L1 Regularization (Lasso)** is typically superior. 

As mentioned on **Page 16**, Lasso\'s mathematical property of driving weights to absolute zero effectively acts as an automated **feature selector**. By forcing the coefficients of irrelevant variables to $0$, it reduces the complexity of your model, improves interpretability, and mitigates overfitting.

In contrast, **L2 Regularization** will keep all features in your model with small weights, which can result in a noisier model that is harder to interpret and more expensive to compute at scale.`,
    timestamp: '14 mins ago'
  }
];

export const mockQuizQuestions: QuizQuestion[] = [
  {
    id: 'q-1',
    question: 'Why does L1 regularization lead to sparse weights (features collapsing to exactly zero) while L2 regularization only mutes them?',
    options: [
      'L1 uses a quadratic constraint which has smooth derivatives, whereas L2 uses a absolute constraint which is non-differentiable at zero.',
      'The L1 constraint boundary is a diamond shape (polyhedron) with sharp corners at the axes, making the optimal solution highly likely to hit a vertex where weights are zero.',
      'L2 is mathematically unstable and cannot calculate absolute zeros.',
      'L1 requires larger learning rates which forces weight decay to proceed faster.'
    ],
    correctAnswer: 1,
    explanation: 'The constraint boundary of L1 is a diamond shape (|w1| + |w2| <= t) which has sharp vertices on the coordinate axes. Contour lines of the loss function are extremely likely to touch these vertices first. L2 is a hypersphere (w1^2 + w2^2 <= t), leading to tangent points that rarely fall exactly on the axes.'
  },
  {
    id: 'q-2',
    question: 'What is the role of the Bellman Optimality Equation in Markov Decision Processes?',
    options: [
      'It calculates the probability of transitioning from state S to state S\' under a purely random policy.',
      'It establishes that the value of a state under an optimal policy must equal the expected return for the best immediate action plus the discounted value of the subsequent state.',
      'It limits the reward function so that reinforcement agents do not undergo mathematical overflow.',
      'It approximates the optimal actions using deep Q-learning networks.'
    ],
    correctAnswer: 1,
    explanation: 'The Bellman Optimality Equation states that the value of a state under an optimal policy must equal the expected return of the optimal action from that state, plus the discounted value of the successor state. This forms the recursive foundation for Value Iteration and Q-learning.'
  },
  {
    id: 'q-3',
    question: 'In Stochastic Gradient Descent (SGD), what is the benefit of adding a momentum term?',
    options: [
      'It increases the size of the mini-batch automatically at each epoch.',
      'It dampens oscillations in high-curvature directions and accelerates progress along flat valleys by carrying over a fraction of the previous step\'s velocity.',
      'It guarantees that the learning rate will decay to absolute zero.',
      'It forces the gradient vector to stay completely perpendicular to the loss surface.'
    ],
    correctAnswer: 1,
    explanation: 'Momentum adds a fraction of the previous step\'s update vector to the current step. This accelerates gradient descent in directions of persistent gradients (flat valleys) and cancels out noise/oscillations in directions where the gradient rapidly changes sign.'
  },
  {
    id: 'q-4',
    question: 'What is the primary difference between TF-IDF and modern Word Embeddings like Word2Vec?',
    options: [
      'TF-IDF is a dense neural representation, while Word2Vec is a sparse statistical tally.',
      'TF-IDF is a frequency-based, vocabulary-wide representation that ignores semantic context, while Word2Vec maps words to dense low-dimensional vectors capturing semantic and syntactic relationships.',
      'TF-IDF is only suitable for foreign language translation, while Word2Vec is English-only.',
      'Word2Vec is a deterministic statistical algorithm, while TF-IDF is a stochastic gradient model.'
    ],
    correctAnswer: 1,
    explanation: 'TF-IDF counts term frequencies relative to inverse document frequencies, producing sparse, high-dimensional vectors that lack context. Word2Vec uses neural models (skip-gram or CBOW) to learn dense, low-dimensional vectors where distance represents semantic similarity.'
  }
];

export const mockFlashcards: Flashcard[] = [
  {
    id: 'fc-1',
    front: 'What is the mathematical formulation of L1 Regularization?',
    back: 'L_new = L_old + λ * Σ|w_i|\n\nWhere λ is the regularization parameter, and Σ|w_i| is the sum of absolute values of the weights (L1 norm).',
    category: 'Regularization',
    difficulty: 'easy'
  },
  {
    id: 'fc-2',
    front: 'Explain "Superposition" in Quantum Computing.',
    back: 'The ability of a quantum system (like a qubit) to exist in multiple states (both |0⟩ and |1⟩) simultaneously. Represented as |ψ⟩ = α|0⟩ + β|1⟩, where |α|^2 + |β|^2 = 1.',
    category: 'Quantum Computing',
    difficulty: 'medium'
  },
  {
    id: 'fc-3',
    front: 'What is the Bellman Equation (Expectation)?',
    back: 'V^π(s) = Σ P(s\'|s,a) * [R(s,a,s\') + γ * V^π(s\')]\n\nIt expresses the value of a state under policy π as the expected immediate reward plus the discounted value of the next state.',
    category: 'Reinforcement Learning',
    difficulty: 'hard'
  },
  {
    id: 'fc-4',
    front: 'What does "Overfitting" mean, and how can it be diagnosed?',
    back: 'Overfitting occurs when a model learns noise in the training data rather than the underlying pattern. Diagnosed when training error is very low, but validation/test error is high.',
    category: 'General ML',
    difficulty: 'easy'
  },
  {
    id: 'fc-5',
    front: 'Define "Tokenization" in Natural Language Processing.',
    back: 'The process of splitting a continuous stream of text into individual units or semantic tokens (such as words, subwords, or characters) suitable for parsing and modeling.',
    category: 'NLP',
    difficulty: 'easy'
  }
];

export const mockKnowledgeMapData = {
  nodes: [
    // Documents
    { id: 'doc-1', label: 'Machine Learning Foundations.pdf', type: 'document', group: 'ml', val: 14 },
    { id: 'doc-2', label: 'Chapter 4 Notes.pdf', type: 'document', group: 'rl', val: 12 },
    { id: 'doc-3', label: 'Introduction to NLP.docx', type: 'document', group: 'nlp', val: 10 },
    { id: 'doc-4', label: 'Quantum Computing Primer.pptx', type: 'document', group: 'qc', val: 8 },

    // ML Concepts
    { id: 'c-supervised', label: 'Supervised Learning', type: 'concept', group: 'ml', val: 7 },
    { id: 'c-loss', label: 'Loss Functions', type: 'concept', group: 'ml', val: 6 },
    { id: 'c-grad', label: 'Gradient Descent', type: 'concept', group: 'ml', val: 8 },
    { id: 'c-nn', label: 'Neural Networks', type: 'concept', group: 'ml', val: 9 },
    { id: 'c-reg', label: 'Regularization (L1/L2)', type: 'concept', group: 'ml', val: 7 },

    // RL Concepts
    { id: 'c-mdp', label: 'Markov Decision Processes', type: 'concept', group: 'rl', val: 8 },
    { id: 'c-dp', label: 'Dynamic Programming', type: 'concept', group: 'rl', val: 6 },
    { id: 'c-val', label: 'Value Iteration', type: 'concept', group: 'rl', val: 7 },
    { id: 'c-bellman', label: 'Bellman Equation', type: 'concept', group: 'rl', val: 8 },

    // NLP Concepts
    { id: 'c-token', label: 'Tokenization', type: 'concept', group: 'nlp', val: 5 },
    { id: 'c-tfidf', label: 'TF-IDF', type: 'concept', group: 'nlp', val: 5 },
    { id: 'c-embed', label: 'Word Embeddings', type: 'concept', group: 'nlp', val: 7 },
    { id: 'c-trans', label: 'Transformer Models', type: 'concept', group: 'nlp', val: 8 },

    // Quantum Concepts
    { id: 'c-qubit', label: 'Qubits', type: 'concept', group: 'qc', val: 6 },
    { id: 'c-superpos', label: 'Superposition', type: 'concept', group: 'qc', val: 6 },
    { id: 'c-entangle', label: 'Entanglement', type: 'concept', group: 'qc', val: 6 }
  ] as ConceptNode[],

  links: [
    // Doc 1 Links
    { source: 'doc-1', target: 'c-supervised' },
    { source: 'doc-1', target: 'c-loss' },
    { source: 'doc-1', target: 'c-grad' },
    { source: 'doc-1', target: 'c-nn' },
    { source: 'doc-1', target: 'c-reg' },

    // Doc 2 Links
    { source: 'doc-2', target: 'c-mdp' },
    { source: 'doc-2', target: 'c-dp' },
    { source: 'doc-2', target: 'c-val' },
    { source: 'doc-2', target: 'c-bellman' },

    // Doc 3 Links
    { source: 'doc-3', target: 'c-token' },
    { source: 'doc-3', target: 'c-tfidf' },
    { source: 'doc-3', target: 'c-embed' },
    { source: 'doc-3', target: 'c-trans' },

    // Doc 4 Links
    { source: 'doc-4', target: 'c-qubit' },
    { source: 'doc-4', target: 'c-superpos' },
    { source: 'doc-4', target: 'c-entangle' },

    // Cross-concept connections
    { source: 'c-grad', target: 'c-loss' },
    { source: 'c-nn', target: 'c-supervised' },
    { source: 'c-nn', target: 'c-grad' },
    { source: 'c-dp', target: 'c-val' },
    { source: 'c-bellman', target: 'c-mdp' },
    { source: 'c-embed', target: 'c-trans' }
  ] as ConceptLink[]
};
