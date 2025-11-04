import fs from 'fs/promises';
import path from 'path';

// Define the courses and problem templates
const courses = [
  {
    id: 'javascript',
    problems: [
      // Easy problems (1-10)
      {
        title: 'Sum Array Elements',
        difficulty: 'Easy',
        description: 'Write a function that takes an array of numbers and returns the sum of all elements.',
        examples: [
          { input: '[1, 2, 3, 4, 5]', output: '15', explanation: '1 + 2 + 3 + 4 + 5 = 15' },
          { input: '[-1, -2, 3, 4]', output: '4', explanation: '-1 + (-2) + 3 + 4 = 4' }
        ],
        constraints: [
          'Array length will be between 0 and 10^5',
          'Array elements will be between -10^4 and 10^4'
        ],
        testCases: [
          { input: '[1, 2, 3, 4, 5]', expectedOutput: '15' },
          { input: '[-1, -2, 3, 4]', expectedOutput: '4' },
          { input: '[]', expectedOutput: '0', isHidden: true }
        ],
        hints: [
          'Consider using a loop to iterate through the array',
          'You can also use the Array.reduce() method for a more concise solution'
        ],
        solution: 'function sumArray(arr) {\n  return arr.reduce((sum, num) => sum + num, 0);\n}',
        tags: ['arrays', 'math', 'loops']
      },
      // Add more problem templates...
    ]
  },
  // Add more courses...
];

async function generateProblems() {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    for (const course of courses) {
      const problems = course.problems.map((template, index) => ({
        problemId: index + 1,
        courseId: course.id,
        ...template
      }));
      
      // Write to JSON file
      const filePath = path.join(dataDir, `${course.id}-problems.json`);
      await fs.writeFile(filePath, JSON.stringify(problems, null, 2));
      
      console.log(`Generated ${problems.length} problems for ${course.id}`);
    }
    
    console.log('Problem generation complete!');
  } catch (error) {
    console.error('Error generating problems:', error);
  }
}

generateProblems(); 