-- OnlyNotes Seed Data
-- Version: 1.0
-- Description: Dummy data for testing the OnlyNotes app

-- =====================================================
-- 1. CREATE UNIVERSITY
-- =====================================================

INSERT INTO universities (id, name, domain) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Tech University', '@techuniversity.edu');

-- =====================================================
-- 2. CREATE PROGRAMS
-- =====================================================

INSERT INTO programs (id, university_id, name) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Computer Science'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Business');

-- =====================================================
-- 3. CREATE COURSES
-- =====================================================

INSERT INTO courses (id, university_id, code, name) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'CS101', 'Algorithms'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'CS102', 'Databases'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'BUS101', 'Marketing'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'BUS200', 'Finance');

-- =====================================================
-- 4. CREATE DUMMY USERS (PROFILES)
-- Note: In production, these would be created via auth.users
-- For testing, you'll need to create auth users first or adjust accordingly
-- =====================================================

-- Assuming auth.users exist with these IDs:
INSERT INTO profiles (id, username, avatar_url, university_id, program_id, enrollment_year, total_score) VALUES
('ea32fb80-4166-4d3a-8794-d79609db02c9', 'sarah_j', 'https://i.pravatar.cc/150?u=sarah', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 2023, 1240),
('f74b658a-46da-41f4-8ab6-eaa0fb1dd375', 'mike_r', 'https://i.pravatar.cc/150?u=mike', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 2022, 890),
('641677f8-1a06-42c7-98db-fb737b111776', 'emily_c', 'https://i.pravatar.cc/150?u=emily', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 2023, 2100),
('2af43c3a-1257-404e-9d78-2db8c616d8bd', 'marcus_a', 'https://i.pravatar.cc/150?u=marcus', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 2021, 1500),
('b10bb7f8-a1fa-4ed7-af8c-3136ba74eb0c', 'david_k', 'https://i.pravatar.cc/150?u=david', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 2023, 3200);

-- =====================================================
-- 5. CREATE 20 NOTES
-- =====================================================

INSERT INTO notes (author_id, course_id, title, hook_summary, full_content) VALUES
-- CS101 Notes (Algorithms)
('ea32fb80-4166-4d3a-8794-d79609db02c9', '550e8400-e29b-41d4-a716-446655440010', 'Big O Made Simple', 
'Master algorithm complexity with this visual cheat sheet that professors don''t want you to see!',
'# Big O Notation Explained

Big O describes the worst-case scenario for algorithm runtime.

## Common Complexities
- **O(1)**: Constant
- **O(log n)**: Logarithmic
- **O(n)**: Linear
- **O(n log n)**: Linearithmic
- **O(n^2)**: Quadratic

Remember: drop constants and focus on growth rate!'),

('641677f8-1a06-42c7-98db-fb737b111776', '550e8400-e29b-41d4-a716-446655440010', 'Sorting Showdown', 
'Quick comparison of Merge Sort vs Quick Sort - which one to use when?',
'# Merge Sort vs Quick Sort

**Merge Sort**
- Time: O(n log n) always
- Space: O(n)
- Stable

**Quick Sort**
- Time: O(n log n) average
- Space: O(log n)
- Not stable

Use Merge when stability matters!'),

('b10bb7f8-a1fa-4ed7-af8c-3136ba74eb0c', '550e8400-e29b-41d4-a716-446655440010', 'Recursion Demystified', 
'Finally understand recursion with the 3-step method your TA won''t teach you.',
'# Understanding Recursion

3 Steps to Master Recursion:

1. **Base Case**: When to stop
2. **Recursive Case**: How to break down
3. **Trust**: Assume it works for smaller input

Example: Factorial
```
factorial(n):
  if n <= 1: return 1
  return n * factorial(n-1)
```'),

-- CS102 Notes (Databases)
('ea32fb80-4166-4d3a-8794-d79609db02c9', '550e8400-e29b-41d4-a716-446655440011', 'SQL Joins Visualized', 
'INNER, LEFT, RIGHT, FULL - master SQL joins with Venn diagrams.',
'# SQL Joins Guide

**INNER JOIN**: Only matching records
**LEFT JOIN**: All from left + matches
**RIGHT JOIN**: All from right + matches
**FULL OUTER JOIN**: Everything

Pro tip: 90% of the time you need INNER or LEFT!'),

('641677f8-1a06-42c7-98db-fb737b111776', '550e8400-e29b-41d4-a716-446655440011', 'Normalization 101', 
'Understand 1NF, 2NF, 3NF without the headache.',
'# Database Normalization

**1NF**: Atomic values, no repeating groups
**2NF**: 1NF + no partial dependencies
**3NF**: 2NF + no transitive dependencies

Rule of thumb: every non-key column depends on the key, the whole key, and nothing but the key!'),

('b10bb7f8-a1fa-4ed7-af8c-3136ba74eb0c', '550e8400-e29b-41d4-a716-446655440011', 'Indexing Strategies', 
'Speed up your queries 10x with proper indexing.',
'# Database Indexing

When to create indexes:
- Foreign keys
- Frequently searched columns
- ORDER BY columns

When NOT to index:
- Small tables
- Frequently updated columns
- Columns with low cardinality'),

-- BUS101 Notes (Marketing)
('f74b658a-46da-41f4-8ab6-eaa0fb1dd375', '550e8400-e29b-41d4-a716-446655440012', '4Ps Framework', 
'Product, Price, Place, Promotion - the foundation of every marketing strategy.',
'# The 4Ps of Marketing

1. **Product**: What are you selling?
2. **Price**: What''s the value exchange?
3. **Place**: Where do customers buy it?
4. **Promotion**: How do they know about it?

Modern addition: Add People, Process, Physical Evidence for services!'),

('2af43c3a-1257-404e-9d78-2db8c616d8bd', '550e8400-e29b-41d4-a716-446655440012', 'SWOT Analysis', 
'Ace your case study with this SWOT template.',
'# SWOT Analysis Template

**Strengths**: Internal positives
**Weaknesses**: Internal negatives
**Opportunities**: External positives
**Threats**: External negatives

Pro tip: Be specific and actionable!'),

('f74b658a-46da-41f4-8ab6-eaa0fb1dd375', '550e8400-e29b-41d4-a716-446655440012', 'Digital Marketing 2024', 
'SEO, SEM, Social - what actually works today.',
'# Digital Marketing Channels

**SEO**: Long-term organic growth
**SEM**: Paid search (Google Ads)
**Social Media**: Community & brand
**Email**: Highest ROI channel

Budget allocation: 40% SEO, 30% Social, 20% SEM, 10% Email'),

-- BUS200 Notes (Finance)
('2af43c3a-1257-404e-9d78-2db8c616d8bd', '550e8400-e29b-41d4-a716-446655440013', 'NPV Explained', 
'Net Present Value in 5 minutes - nail your finance exam.',
'# Net Present Value (NPV)

Formula: NPV = Σ (Cash Flow / (1 + r)^t) - Initial Investment

**If NPV > 0**: Accept project
**If NPV < 0**: Reject project

Why? Money today is worth more than money tomorrow!'),

('f74b658a-46da-41f4-8ab6-eaa0fb1dd375', '550e8400-e29b-41d4-a716-446655440013', 'Financial Ratios Cheat Sheet', 
'Liquidity, profitability, leverage - all the ratios you need.',
'# Key Financial Ratios

**Liquidity**
- Current Ratio = Current Assets / Current Liabilities

**Profitability**
- ROE = Net Income / Shareholder Equity

**Leverage**
- Debt-to-Equity = Total Debt / Total Equity'),

('2af43c3a-1257-404e-9d78-2db8c616d8bd', '550e8400-e29b-41d4-a716-446655440013', 'Time Value of Money', 
'Future value, present value, annuities - simplified.',
'# Time Value of Money

**Present Value**: PV = FV / (1 + r)^n
**Future Value**: FV = PV * (1 + r)^n

Where:
- r = interest rate
- n = number of periods

Remember: Compound interest is your friend!'),

-- More diverse notes
('b10bb7f8-a1fa-4ed7-af8c-3136ba74eb0c', '550e8400-e29b-41d4-a716-446655440010', 'Graph Algorithms', 
'BFS vs DFS - when to use which traversal method.',
'# Graph Traversal

**BFS (Breadth-First Search)**
- Uses queue
- Level by level
- Shortest path in unweighted graph

**DFS (Depth-First Search)**
- Uses stack (or recursion)
- Go deep first
- Useful for cycle detection'),

('641677f8-1a06-42c7-98db-fb737b111776', '550e8400-e29b-41d4-a716-446655440011', 'ACID Properties', 
'Database transactions explained - Atomicity, Consistency, Isolation, Durability.',
'# ACID Properties

**Atomicity**: All or nothing
**Consistency**: Valid state always
**Isolation**: Concurrent transactions don''t interfere
**Durability**: Committed = permanent

Critical for banking systems!'),

('f74b658a-46da-41f4-8ab6-eaa0fb1dd375', '550e8400-e29b-41d4-a716-446655440012', 'Customer Segmentation', 
'Demographic, psychographic, behavioral - know your audience.',
'# Customer Segmentation Types

1. **Demographic**: Age, income, education
2. **Geographic**: Location-based
3. **Psychographic**: Lifestyle, values
4. **Behavioral**: Purchase history, usage

Best results: Combine multiple types!'),

('2af43c3a-1257-404e-9d78-2db8c616d8bd', '550e8400-e29b-41d4-a716-446655440013', 'Break-Even Analysis', 
'Calculate the exact point where your business becomes profitable.',
'# Break-Even Point

Formula: Break-Even = Fixed Costs / (Price - Variable Cost per Unit)

Use this to:
- Set pricing strategy
- Evaluate new products
- Make go/no-go decisions'),

('b10bb7f8-a1fa-4ed7-af8c-3136ba74eb0c', '550e8400-e29b-41d4-a716-446655440010', 'Dynamic Programming', 
'Memoization vs Tabulation - solve complex problems efficiently.',
'# Dynamic Programming Approaches

**Memoization** (Top-Down)
- Recursive + cache
- Solve on demand

**Tabulation** (Bottom-Up)
- Iterative
- Fill table systematically

Example: Fibonacci works great with both!'),

('ea32fb80-4166-4d3a-8794-d79609db02c9', '550e8400-e29b-41d4-a716-446655440011', 'Database Transactions', 
'Commit, rollback, savepoints - manage your data changes safely.',
'# Transaction Management

```sql
BEGIN TRANSACTION;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

Always use transactions for multi-step operations!'),

('f74b658a-46da-41f4-8ab6-eaa0fb1dd375', '550e8400-e29b-41d4-a716-446655440012', 'Brand Positioning', 
'Differentiate or die - create a unique space in customer minds.',
'# Brand Positioning Strategy

The Template:
"For [target customer], [brand name] is the [category] that [unique benefit] unlike [competitors]."

Example: "For busy professionals, Starbucks is the coffee shop that provides a third place experience unlike Dunkin''."'),

('2af43c3a-1257-404e-9d78-2db8c616d8bd', '550e8400-e29b-41d4-a716-446655440013', 'Capital Budgeting', 
'IRR vs NPV - choose the right investment appraisal method.',
'# Capital Budgeting Methods

**NPV**: Absolute dollar value
- Best for single projects

**IRR**: Percentage return
- Easy to compare across projects

**Payback Period**: Time to recover investment
- Simple but ignores time value

Use NPV when in doubt!');
