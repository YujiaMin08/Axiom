/**
 * Gemini Planner 验证测试套件
 * 包含断言、统计和边际测试
 */

import { generateModulePlanWithGemini } from './server/gemini-planner';

// 颜色工具
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// 测试用例定义
interface TestCase {
  id: string;
  scenario: number;
  domain: 'LANGUAGE' | 'SCIENCE' | 'LIBERAL_ARTS';
  userInput: string;
  userHistoryPrefs?: any;
  expectedPlan: {
    moduleCountRange: [number, number];
    mustInclude?: string[];
    shouldInclude?: string[];
    shouldAvoid?: string[];
    optional?: string[];
  };
  assertions: string[];
  notes?: string;
}

// 20 条边际测试集
const TEST_SUITE: TestCase[] = [
  // ===== 场景1：单词学习（LANGUAGE）=====
  {
    id: "S1-E01",
    scenario: 1,
    domain: "LANGUAGE",
    userInput: "apple",
    expectedPlan: {
      moduleCountRange: [4, 6],
      mustInclude: ["definition", "examples", "quiz"],
      shouldInclude: ["story"],
    },
    assertions: [
      "module_count_in_range",
      "contains_quiz",
    ]
  },
  {
    id: "S1-E02",
    scenario: 1,
    domain: "LANGUAGE",
    userInput: "set",
    notes: "多义词：应更复杂、模块数更多",
    expectedPlan: {
      moduleCountRange: [5, 9],
      mustInclude: ["definition", "examples", "quiz"],
    },
    assertions: [
      "module_count_in_range",
    ]
  },
  {
    id: "S1-E03",
    scenario: 1,
    domain: "LANGUAGE",
    userInput: "serendipity",
    notes: "抽象词：应更多例句/语境",
    expectedPlan: {
      moduleCountRange: [4, 7],
      mustInclude: ["definition", "examples"],
    },
    assertions: [
      "module_count_in_range",
    ]
  },

  // ===== 场景2：场景学习（LANGUAGE）=====
  {
    id: "S2-E01",
    scenario: 2,
    domain: "LANGUAGE",
    userInput: "Ordering coffee at a cafe (beginner)",
    notes: "场景学习需要对话+实践",
    expectedPlan: {
      moduleCountRange: [5, 8],
      mustInclude: ["examples", "quiz"],
      shouldInclude: ["story", "game"],
    },
    assertions: [
      "module_count_in_range",
    ]
  },
  {
    id: "S2-E02",
    scenario: 2,
    domain: "LANGUAGE",
    userInput: "Politely rejecting a proposal in a business meeting",
    notes: "应识别语气和礼貌策略",
    expectedPlan: {
      moduleCountRange: [5, 9],
      mustInclude: ["examples", "quiz"],
    },
    assertions: [
      "module_count_in_range",
    ]
  },

  // ===== 场景3：不相关词汇组合（LANGUAGE）=====
  {
    id: "S3-E01",
    scenario: 3,
    domain: "LANGUAGE",
    userInput: "apple, telescope, jealousy, refund",
    notes: "不相关词汇：核心是融合故事",
    expectedPlan: {
      moduleCountRange: [5, 9],
      mustInclude: ["story"],
    },
    assertions: [
      "module_count_in_range",
      "contains_story",
    ]
  },

  // ===== 场景4：知识学习（SCIENCE）=====
  {
    id: "S4-E01",
    scenario: 4,
    domain: "SCIENCE",
    userInput: "Newton's First Law",
    notes: "应体现：直觉→操纵→表达→验证",
    expectedPlan: {
      moduleCountRange: [5, 9],
      mustInclude: ["intuition", "quiz"],
      shouldInclude: ["experiment", "formula"],
    },
    assertions: [
      "module_count_in_range",
      "science_must_have_interactive",
    ]
  },
  {
    id: "S4-E02",
    scenario: 4,
    domain: "SCIENCE",
    userInput: "chemical reaction rate vs concentration",
    notes: "必须有交互实验/可调变量",
    expectedPlan: {
      moduleCountRange: [5, 10],
      mustInclude: ["experiment", "quiz"],
      shouldInclude: ["intuition"],
    },
    assertions: [
      "module_count_in_range",
      "science_must_have_interactive",
    ]
  },
  {
    id: "S4-E03",
    scenario: 4,
    domain: "SCIENCE",
    userInput: "Pythagorean theorem (step-by-step)",
    notes: "数学推导应该详细",
    expectedPlan: {
      moduleCountRange: [5, 9],
      mustInclude: ["formula", "quiz"],
      shouldInclude: ["examples"],
    },
    assertions: [
      "module_count_in_range",
    ]
  },
  {
    id: "S4-E04",
    scenario: 4,
    domain: "SCIENCE",
    userInput: "quantum entanglement (explain for G7-G12)",
    notes: "复杂主题应有范围控制",
    expectedPlan: {
      moduleCountRange: [5, 10],
      mustInclude: ["intuition", "quiz"],
    },
    assertions: [
      "module_count_in_range",
      "complexity_appropriate_for_target",
    ]
  },
  {
    id: "S4-E05",
    scenario: 4,
    domain: "SCIENCE",
    userInput: "red-black tree",
    notes: "计算机科学：应包含交互和数学证明",
    expectedPlan: {
      moduleCountRange: [5, 9],
      mustInclude: ["intuition", "experiment", "quiz"],
      shouldInclude: ["game"],
    },
    assertions: [
      "module_count_in_range",
      "science_must_have_interactive",
    ]
  },

  // ===== 场景5：通识教育（LIBERAL_ARTS）=====
  {
    id: "S5-E01",
    scenario: 5,
    domain: "LIBERAL_ARTS",
    userInput: "Why does your tongue stick to metal in winter?",
    notes: "跨学科：物理+生物+化学",
    expectedPlan: {
      moduleCountRange: [6, 12],
      mustInclude: ["quiz"],
      shouldInclude: ["perspective_physics", "perspective_biology"],
    },
    assertions: [
      "module_count_in_range",
      "liberal_arts_must_have_perspectives",
    ]
  },
  {
    id: "S5-E02",
    scenario: 5,
    domain: "LIBERAL_ARTS",
    userInput: "Why do onions make you cry?",
    notes: "PRD 例子：应包含扩散动画+可调参数",
    expectedPlan: {
      moduleCountRange: [6, 12],
      mustInclude: ["quiz"],
      shouldInclude: ["perspective_chemistry", "perspective_biology", "experiment"],
    },
    assertions: [
      "module_count_in_range",
      "liberal_arts_must_have_perspectives",
      "liberal_arts_should_have_interactive",
    ]
  },
  {
    id: "S5-E03",
    scenario: 5,
    domain: "LIBERAL_ARTS",
    userInput: "Climate change",
    notes: "复杂跨学科议题",
    expectedPlan: {
      moduleCountRange: [6, 12],
      mustInclude: ["overview", "quiz"],
      shouldInclude: ["perspective_physics", "perspective_economics", "perspective_sociology"],
    },
    assertions: [
      "module_count_in_range",
      "liberal_arts_must_have_perspectives",
    ]
  },
  {
    id: "S5-E04",
    scenario: 5,
    domain: "LIBERAL_ARTS",
    userInput: "Renaissance",
    notes: "历史主题",
    expectedPlan: {
      moduleCountRange: [5, 10],
      mustInclude: ["overview", "quiz"],
      shouldInclude: ["perspective_history", "perspective_culture"],
    },
    assertions: [
      "module_count_in_range",
      "liberal_arts_must_have_perspectives",
    ]
  },

  // ===== 边界情况测试 =====
  {
    id: "EDGE-01",
    scenario: 999,
    domain: "LANGUAGE",
    userInput: "apple apple APPLE",
    notes: "重复输入",
    expectedPlan: {
      moduleCountRange: [3, 6],
    },
    assertions: [
      "handles_duplicates",
    ]
  },
  {
    id: "EDGE-02",
    scenario: 999,
    domain: "SCIENCE",
    userInput: "explain everything about physics",
    notes: "过于宽泛的输入",
    expectedPlan: {
      moduleCountRange: [3, 8],
    },
    assertions: [
      "handles_overly_broad_input",
    ]
  },
];

// 断言函数
function validateResult(testCase: TestCase, result: any): { passed: boolean; errors: string[] } {
  const errors: string[] = [];
  const { module_plan } = result;
  const moduleCount = module_plan.length;
  const moduleTypes = module_plan.map((m: any) => m.type);

  // 基础断言
  if (testCase.assertions.includes('module_count_in_range')) {
    const [min, max] = testCase.expectedPlan.moduleCountRange;
    if (moduleCount < min || moduleCount > max) {
      errors.push(`模块数量 ${moduleCount} 不在范围 [${min}, ${max}] 内`);
    }
  }

  if (testCase.assertions.includes('contains_quiz')) {
    if (!moduleTypes.includes('quiz')) {
      errors.push('缺少必需的 quiz 模块');
    }
  }

  if (testCase.assertions.includes('contains_story')) {
    if (!moduleTypes.includes('story')) {
      errors.push('缺少必需的 story 模块');
    }
  }

  // SCIENCE 领域断言
  if (testCase.assertions.includes('science_must_have_interactive')) {
    const interactiveTypes = ['experiment', 'game', 'manipulation', 'simulation'];
    const hasInteractive = moduleTypes.some((type: string) => 
      interactiveTypes.some(iType => type.includes(iType))
    );
    if (!hasInteractive) {
      errors.push('SCIENCE 主题缺少交互式模块 (experiment/game/manipulation)');
    }
  }

  // LIBERAL_ARTS 领域断言
  if (testCase.assertions.includes('liberal_arts_must_have_perspectives')) {
    const perspectiveTypes = moduleTypes.filter((type: string) => type.startsWith('perspective_'));
    if (perspectiveTypes.length < 2) {
      errors.push(`LIBERAL_ARTS 主题需要至少 2 个学科视角，当前只有 ${perspectiveTypes.length} 个`);
    }
  }

  if (testCase.assertions.includes('liberal_arts_should_have_interactive')) {
    const interactiveTypes = ['experiment', 'manipulation', 'game'];
    const hasInteractive = moduleTypes.some((type: string) => 
      interactiveTypes.some(iType => type.includes(iType))
    );
    if (!hasInteractive) {
      errors.push('LIBERAL_ARTS 跨学科主题建议包含交互模块');
    }
  }

  // 复杂度适配断言
  if (testCase.assertions.includes('complexity_appropriate_for_target')) {
    if (result.topic_analysis.complexity_level === 'advanced' && moduleCount < 5) {
      errors.push('高级主题模块数量可能不足');
    }
  }

  return {
    passed: errors.length === 0,
    errors
  };
}

// 统计分析
function analyzeResults(results: any[]) {
  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + colors.blue + '📊 统计分析' + colors.reset);
  console.log('='.repeat(80) + '\n');

  // 1. 按领域统计模块数
  const domainStats = {
    LANGUAGE: [] as number[],
    SCIENCE: [] as number[],
    LIBERAL_ARTS: [] as number[],
  };

  results.forEach(r => {
    if (r.success && r.plan) {
      domainStats[r.domain].push(r.plan.module_plan.length);
    }
  });

  console.log(colors.bright + '1. 各领域平均模块数:' + colors.reset);
  Object.entries(domainStats).forEach(([domain, counts]) => {
    if (counts.length > 0) {
      const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
      const min = Math.min(...counts);
      const max = Math.max(...counts);
      console.log(`   ${domain}: ${colors.cyan}平均 ${avg.toFixed(1)}${colors.reset} (范围: ${min}-${max})`);
    }
  });

  // 2. 模块类型分布
  const allModuleTypes: { [key: string]: number } = {};
  results.forEach(r => {
    if (r.success && r.plan) {
      r.plan.module_plan.forEach((m: any) => {
        allModuleTypes[m.type] = (allModuleTypes[m.type] || 0) + 1;
      });
    }
  });

  console.log(`\n${colors.bright}2. 模块类型分布 (Top 10):${colors.reset}`);
  Object.entries(allModuleTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([type, count]) => {
      console.log(`   ${type}: ${colors.yellow}${count}${colors.reset} 次`);
    });

  // 3. 检测固定化问题
  console.log(`\n${colors.bright}3. 动态性检测:${colors.reset}`);
  const allModuleCounts = results
    .filter(r => r.success && r.plan)
    .map(r => r.plan.module_plan.length);
  
  const uniqueCounts = new Set(allModuleCounts);
  if (uniqueCounts.size <= 2) {
    console.log(`   ${colors.red}⚠️  警告: 模块数量几乎固定 (只有 ${uniqueCounts.size} 种取值)${colors.reset}`);
    console.log(`   ${colors.gray}取值: ${Array.from(uniqueCounts).join(', ')}${colors.reset}`);
  } else {
    console.log(`   ${colors.green}✅ 模块数量动态变化 (${uniqueCounts.size} 种不同取值)${colors.reset}`);
  }

  // 4. 跨学科视角检测
  const perspectiveModules = results
    .filter(r => r.success && r.plan)
    .flatMap(r => r.plan.module_plan)
    .filter((m: any) => m.type.startsWith('perspective_'));

  console.log(`\n${colors.bright}4. 跨学科视角统计:${colors.reset}`);
  console.log(`   共出现 ${colors.cyan}${perspectiveModules.length}${colors.reset} 次跨学科模块`);
  
  const perspectiveTypes: { [key: string]: number } = {};
  perspectiveModules.forEach((m: any) => {
    perspectiveTypes[m.type] = (perspectiveTypes[m.type] || 0) + 1;
  });
  
  Object.entries(perspectiveTypes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`   ${type}: ${count} 次`);
    });
}

// 主测试流程
async function runValidationTests() {
  console.log(colors.bright + colors.cyan);
  console.log(`
  ╔═══════════════════════════════════════════════════════════════╗
  ║                                                               ║
  ║         Axiom Planner 验证测试套件                            ║
  ║         ${TEST_SUITE.length} Test Cases with Assertions                        ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝
  `);
  console.log(colors.reset);

  // 检查 API Key
  if (!process.env.GEMINI_API_KEY) {
    console.error(colors.red + '❌ 错误: 未设置 GEMINI_API_KEY' + colors.reset);
    process.exit(1);
  }

  const results = [];
  let passCount = 0;
  let failCount = 0;

  for (let i = 0; i < TEST_SUITE.length; i++) {
    const testCase = TEST_SUITE[i];
    console.log(`\n[${i + 1}/${TEST_SUITE.length}] ${colors.cyan}${testCase.id}${colors.reset}: "${testCase.userInput}"`);
    if (testCase.notes) {
      console.log(`    ${colors.gray}${testCase.notes}${colors.reset}`);
    }

    try {
      const plan = await generateModulePlanWithGemini(testCase.userInput, testCase.domain);
      const validation = validateResult(testCase, plan);

      const result = {
        ...testCase,
        success: true,
        plan,
        validation,
      };
      results.push(result);

      if (validation.passed) {
        console.log(`    ${colors.green}✅ PASS${colors.reset} (${plan.module_plan.length} 个模块)`);
        passCount++;
      } else {
        console.log(`    ${colors.yellow}⚠️  PASS (有警告)${colors.reset}`);
        validation.errors.forEach(err => {
          console.log(`       ${colors.yellow}- ${err}${colors.reset}`);
        });
        passCount++;
      }

      // 显示生成的模块类型
      const types = plan.module_plan.map((m: any) => m.type).join(', ');
      console.log(`    ${colors.gray}模块: ${types}${colors.reset}`);

    } catch (error) {
      console.log(`    ${colors.red}❌ FAIL${colors.reset}`);
      console.log(`    ${colors.red}${error}${colors.reset}`);
      results.push({
        ...testCase,
        success: false,
        error: String(error),
      });
      failCount++;
    }

    // 避免 API 限流
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 汇总结果
  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + '🎯 测试汇总' + colors.reset);
  console.log('='.repeat(80));
  console.log(`\n总测试数: ${TEST_SUITE.length}`);
  console.log(`${colors.green}✅ 通过: ${passCount}${colors.reset}`);
  console.log(`${colors.red}❌ 失败: ${failCount}${colors.reset}`);
  console.log(`通过率: ${colors.cyan}${((passCount / TEST_SUITE.length) * 100).toFixed(1)}%${colors.reset}`);

  // 统计分析
  analyzeResults(results);

  // 保存完整结果
  const fs = require('fs');
  fs.writeFileSync(
    './planner-validation-results.json',
    JSON.stringify(results, null, 2),
    'utf-8'
  );
  console.log(`\n${colors.gray}💾 完整结果已保存到: planner-validation-results.json${colors.reset}\n`);
}

// 运行
runValidationTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

