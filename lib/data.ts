export interface Note {
  id: string;
  title: string;
  topic: string;
  author: {
    name: string;
    avatar: string;
  };
  hook: string;
  content: string;
  upvotes: number;
  price: number;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  earnings: number;
  notesPosted: number;
  totalUpvotes: number;
  rank?: number;
}

export const dummyNotes: Note[] = [
  {
    id: "1",
    title: "Calculus II: Integration Techniques",
    topic: "Mathematics",
    author: {
      name: "Sarah Jenkins",
      avatar: "https://i.pravatar.cc/150?u=sarah",
    },
    hook: "Master integration by parts with this simple trick that professors hate.",
    content: `
      # Integration by Parts
      
      The formula for integration by parts is:
      
      ∫ u dv = uv - ∫ v du
      
      ## When to use it?
      Use it when you have a product of two functions, like x * e^x or x * sin(x).
      
      ## LIATE Rule
      Choose 'u' based on this order:
      1. Logarithmic
      2. Inverse Trigonometric
      3. Algebraic
      4. Trigonometric
      5. Exponential
      
      ## Example
      ∫ x * e^x dx
      u = x, dv = e^x dx
      du = dx, v = e^x
      
      = x * e^x - ∫ e^x dx
      = x * e^x - e^x + C
      
      This method is powerful but requires practice to identify the correct 'u' and 'dv'.
      
      (Content continues with more examples and practice problems...)
    `,
    upvotes: 1240,
    price: 5,
  },
  {
    id: "2",
    title: "Intro to Psychology: Freud vs Jung",
    topic: "Psychology",
    author: {
      name: "Mike Ross",
      avatar: "https://i.pravatar.cc/150?u=mike",
    },
    hook: "Understanding the core differences between Freud's Id and Jung's Collective Unconscious.",
    content: `
      # Freud vs Jung
      
      ## Sigmund Freud
      - Focus on the personal unconscious.
      - Driven by sexual energy (Libido).
      - Structure of personality: Id, Ego, Superego.
      
      ## Carl Jung
      - Introduced the Collective Unconscious.
      - Archetypes (The Shadow, Anima/Animus, The Self).
      - Focus on individuation and self-realization.
      
      ## Key Differences
      Freud saw the unconscious as a repository of repressed desires. Jung saw it as a source of creativity and universal wisdom.
      
      (Content continues...)
    `,
    upvotes: 890,
    price: 3,
  },
  {
    id: "3",
    title: "Organic Chemistry: Resonance Structures",
    topic: "Chemistry",
    author: {
      name: "Emily Chen",
      avatar: "https://i.pravatar.cc/150?u=emily",
    },
    hook: "Don't fail O-Chem. Here is how to draw resonance structures correctly every time.",
    content: `
      # Resonance Structures
      
      Resonance describes the delocalization of electrons within molecules.
      
      ## Rules for Drawing
      1. Only move electrons (pi bonds and lone pairs), never atoms.
      2. Maintain the net charge.
      3. Follow the octet rule (mostly).
      
      ## Stability
      The most stable resonance structure contributes most to the hybrid.
      - Full octets are better.
      - Negative charge on electronegative atoms is better.
      
      (Content continues...)
    `,
    upvotes: 2100,
    price: 8,
  },
  {
    id: "4",
    title: "History of Rome: The Fall",
    topic: "History",
    author: {
      name: "Marcus A.",
      avatar: "https://i.pravatar.cc/150?u=marcus",
    },
    hook: "Was it lead poisoning or political corruption? The real reasons Rome fell.",
    content: `
      # The Fall of Rome
      
      476 AD is the traditional date, but the decline was gradual.
      
      ## Key Factors
      1. **Political Instability**: 20 emperors in 75 years.
      2. **Economic Troubles**: Inflation and heavy taxation.
      3. **Military Spending**: Constant wars drained the treasury.
      4. **Barbarian Invasions**: Visigoths, Vandals, and Huns.
      
      ## The Aftermath
      The fall led to the Dark Ages in Europe, but the Eastern Empire (Byzantine) survived for another 1000 years.
      
      (Content continues...)
    `,
    upvotes: 1500,
    price: 4,
  },
  {
    id: "5",
    title: "Computer Science: Big O Notation",
    topic: "Computer Science",
    author: {
      name: "David Kim",
      avatar: "https://i.pravatar.cc/150?u=david",
    },
    hook: "Stop writing O(n^2) code. Learn to analyze algorithm efficiency.",
    content: `
      # Big O Notation
      
      Big O describes the worst-case scenario for an algorithm's runtime or space complexity.
      
      ## Common Complexities
      - **O(1)**: Constant time (Array access).
      - **O(log n)**: Logarithmic time (Binary search).
      - **O(n)**: Linear time (Simple loop).
      - **O(n log n)**: Linearithmic time (Merge sort).
      - **O(n^2)**: Quadratic time (Nested loops).
      
      ## Why it matters?
      Scalability. An O(n^2) algorithm might work for 100 items but fail for 1,000,000.
      
      (Content continues...)
    `,
    upvotes: 3200,
    price: 10,
  },
];

export const dummyUsers: User[] = [
  {
    id: "u1",
    name: "David Kim",
    avatar: "https://i.pravatar.cc/150?u=david",
    earnings: 1250,
    notesPosted: 45,
    totalUpvotes: 15400,
    rank: 1,
  },
  {
    id: "u2",
    name: "Emily Chen",
    avatar: "https://i.pravatar.cc/150?u=emily",
    earnings: 980,
    notesPosted: 32,
    totalUpvotes: 12300,
    rank: 2,
  },
  {
    id: "u3",
    name: "Sarah Jenkins",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    earnings: 850,
    notesPosted: 28,
    totalUpvotes: 9800,
    rank: 3,
  },
  {
    id: "u4",
    name: "Marcus A.",
    avatar: "https://i.pravatar.cc/150?u=marcus",
    earnings: 620,
    notesPosted: 15,
    totalUpvotes: 7500,
    rank: 4,
  },
  {
    id: "u5",
    name: "Mike Ross",
    avatar: "https://i.pravatar.cc/150?u=mike",
    earnings: 450,
    notesPosted: 12,
    totalUpvotes: 5400,
    rank: 5,
  },
];
