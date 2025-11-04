export const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', extension: 'js' },
  { id: 'typescript', name: 'TypeScript', extension: 'ts' },
  { id: 'python', name: 'Python', extension: 'py' },
  { id: 'java', name: 'Java', extension: 'java' },
  { id: 'cpp', name: 'C++', extension: 'cpp' },
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['id'];

export const DEFAULT_LANGUAGE = 'javascript';

export const LANGUAGE_TEMPLATES: Record<SupportedLanguage, string> = {
  javascript: '// JavaScript Code\nconsole.log("Hello, World!");\n',
  typescript: '// TypeScript Code\nfunction greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n',
  python: '# Python Code\nprint("Hello, World!")\n',
  java: '// Java Code\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n',
  cpp: '// C++ Code\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}\n',
};